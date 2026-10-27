import webpush from "web-push";
import type { PoolClient } from "pg";
import { pool } from "@/lib/db";

type SubscriptionRow = {
  id: string;
  endpoint: string;
  p256dh_key: string;
  auth_key: string;
  locale: "en" | "sw";
};

type LowStockEvent = {
  id: string;
  product_id: string;
  shop_id: string;
  product_name: string;
  stock: number;
  low_stock_at: number;
};

type PushPayload = {
  title: string;
  body: string;
  url: string;
  tag: string;
};

function configurePush() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT ?? "mailto:info.dukasmart@gmail.com";
  if (!publicKey || !privateKey) return false;

  try {
    webpush.setVapidDetails(subject, publicKey, privateKey);
    return true;
  } catch {
    console.error("Push notification VAPID configuration is invalid");
    return false;
  }
}

async function sendPush(subscription: SubscriptionRow, payload: PushPayload) {
  const pushSubscription: webpush.PushSubscription = {
    endpoint: subscription.endpoint,
    keys: { p256dh: subscription.p256dh_key, auth: subscription.auth_key },
  };

  let lastError: unknown;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      await webpush.sendNotification(pushSubscription, JSON.stringify(payload), {
        TTL: 86_400,
        urgency: payload.tag.startsWith("low-stock-") ? "high" : "normal",
        timeout: 5_000,
      });
      return { ok: true as const };
    } catch (error) {
      lastError = error;
      const statusCode = (error as { statusCode?: unknown })?.statusCode;
      if (statusCode === 404 || statusCode === 410) {
        return { ok: false as const, expired: true as const, error };
      }
      if (typeof statusCode === "number" && statusCode >= 400 && statusCode < 500 && statusCode !== 429) {
        return { ok: false as const, expired: false as const, error };
      }
      if (attempt < 1) await new Promise((resolve) => setTimeout(resolve, 250));
    }
  }

  return { ok: false as const, expired: false as const, error: lastError };
}

async function sendToSubscription(
  client: PoolClient,
  subscription: SubscriptionRow,
  payload: PushPayload,
  updateQuery: string,
  updateParams: (success: boolean, message: string) => unknown[],
) {
  const result = await sendPush(subscription, payload);
  if (result.expired) {
    await client.query(`DELETE FROM push_subscriptions WHERE id = $1`, [subscription.id]);
  } else {
    const responseCode = (result.error as { statusCode?: unknown })?.statusCode;
    const errorMessage = result.ok ? null :
      typeof responseCode === "number" ? `Push provider returned ${responseCode}` : "Push provider request failed";
    await client.query(updateQuery, updateParams(result.ok, errorMessage ?? ""));
    if (!result.ok) {
      console.error("Push delivery failed", { subscriptionId: subscription.id, statusCode: responseCode });
    }
  }
  return result.ok;
}

/** Sends queued threshold-crossing alerts. The database trigger records crossings. */
export async function deliverPendingLowStockPushes(shopId?: string) {
  if (!configurePush()) return { delivered: 0, failed: 0 };

  let client: PoolClient;
  try {
    client = await pool.connect();
  } catch (error) {
    console.error("Unable to connect to queue low-stock push notifications", error);
    return { delivered: 0, failed: 1 };
  }
  let delivered = 0;
  let failed = 0;
  try {
    await client.query("BEGIN");
    const lock = await client.query(
      `SELECT pg_try_advisory_xact_lock(hashtext('low-stock-web-push')) AS locked`
    );
    if (!lock.rows[0]?.locked) {
      await client.query("ROLLBACK");
      return { delivered, failed };
    }

    await client.query(
      `DELETE FROM low_stock_notification_events
       WHERE processed_at < now() - interval '90 days'`
    );

    const events = await client.query<LowStockEvent>(
      `SELECT id, product_id, shop_id, product_name, stock, low_stock_at
       FROM low_stock_notification_events
       WHERE processed_at IS NULL AND ($1::uuid IS NULL OR shop_id = $1)
       ORDER BY occurred_at ASC
       LIMIT 100
       FOR UPDATE SKIP LOCKED`,
      [shopId ?? null]
    );

    for (const event of events.rows) {
      const current = await client.query(
        `SELECT stock, low_stock_at FROM products WHERE id = $1`,
        [event.product_id]
      );
      if (!current.rows[0] || current.rows[0].stock > current.rows[0].low_stock_at) {
        await client.query(`UPDATE low_stock_notification_events SET processed_at = now() WHERE id = $1`, [event.id]);
        continue;
      }

      await client.query(
        `INSERT INTO low_stock_notification_deliveries (event_id, subscription_id)
         SELECT $1, ps.id
         FROM push_subscriptions ps
         JOIN users u ON u.id = ps.user_id AND u.is_active = TRUE
         WHERE ps.shop_id = $2
         ON CONFLICT (event_id, subscription_id) DO NOTHING`,
        [event.id, event.shop_id]
      );
      const subscriptions = await client.query<SubscriptionRow & { subscription_id: string }>(
        `SELECT d.subscription_id AS id, ps.endpoint, ps.p256dh_key, ps.auth_key, ps.locale
         FROM low_stock_notification_deliveries d
         JOIN push_subscriptions ps ON ps.id = d.subscription_id
         WHERE d.event_id = $1 AND d.delivered_at IS NULL`,
        [event.id]
      );

      for (let offset = 0; offset < subscriptions.rows.length; offset += 10) {
        const batch = subscriptions.rows.slice(offset, offset + 10);
        const results = await Promise.all(batch.map((subscription) =>
          sendToSubscription(
            client,
            subscription,
            {
              title: subscription.locale === "sw" ? "DukaSmart · Tahadhari ya stoku" : "DukaSmart · Low stock",
              body: subscription.locale === "sw"
                ? `Bidhaa ${event.product_name.slice(0, 100)}: stoku ni ${event.stock} (kiwango cha tahadhari: ${event.low_stock_at}).`
                : `${event.product_name.slice(0, 100)}: ${event.stock} left (alert at ${event.low_stock_at}).`,
              url: "/products?lowStockOnly=1",
              tag: `low-stock-${event.id}`,
            },
            `UPDATE low_stock_notification_deliveries
             SET delivered_at = CASE WHEN $1 THEN now() ELSE delivered_at END,
                 attempts = attempts + 1, last_error = NULLIF($2, '')
             WHERE event_id = $3 AND subscription_id = $4`,
            (ok, message) => [ok, message, event.id, subscription.id]
          )
        ));
        delivered += results.filter(Boolean).length;
        failed += results.filter((success) => !success).length;
      }

      const pending = await client.query(
        `SELECT 1 FROM low_stock_notification_deliveries
         WHERE event_id = $1 AND delivered_at IS NULL LIMIT 1`,
        [event.id]
      );
      if (pending.rows.length === 0) {
        await client.query(`UPDATE low_stock_notification_events SET processed_at = now() WHERE id = $1`, [event.id]);
      }
    }

    await client.query("COMMIT");
    return { delivered, failed };
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    console.error("Unable to deliver low-stock push notifications", error);
    return { delivered, failed: failed + 1 };
  } finally {
    client.release();
  }
}

/** Sends one daily reminder per subscribed user device at the shop's Tanzania morning. */
export async function sendDailyPushReminders() {
  if (!configurePush()) {
    throw new Error("VAPID keys must be configured before sending push notifications");
  }

  const client = await pool.connect();
  let sent = 0;
  let failed = 0;
  try {
    await client.query("BEGIN");
    const lock = await client.query(
      `SELECT pg_try_advisory_xact_lock(hashtext('daily-web-push-reminders')) AS locked`
    );
    if (!lock.rows[0]?.locked) {
      await client.query("ROLLBACK");
      return { sent, failed, skipped: true };
    }

    const dateResult = await client.query(
      `SELECT (now() AT TIME ZONE 'Africa/Dar_es_Salaam')::date AS local_date`
    );
    const localDate = dateResult.rows[0].local_date;
    await client.query(
      `DELETE FROM daily_push_deliveries WHERE reminder_date < $1::date - 90`,
      [localDate]
    );
    await client.query(
      `INSERT INTO daily_push_deliveries (subscription_id, reminder_date)
       SELECT ps.id, $1 FROM push_subscriptions ps
       JOIN users u ON u.id = ps.user_id AND u.is_active = TRUE
       ON CONFLICT (subscription_id, reminder_date) DO NOTHING`,
      [localDate]
    );
    const reminders = await client.query<SubscriptionRow & { subscription_id: string; user_name: string }>(
      `SELECT d.subscription_id AS id, ps.endpoint, ps.p256dh_key, ps.auth_key, ps.locale, u.name AS user_name
       FROM daily_push_deliveries d
       JOIN push_subscriptions ps ON ps.id = d.subscription_id
       JOIN users u ON u.id = ps.user_id AND u.is_active = TRUE
       WHERE d.reminder_date = $1 AND d.delivered_at IS NULL`,
      [localDate]
    );

    for (let offset = 0; offset < reminders.rows.length; offset += 10) {
      const batch = reminders.rows.slice(offset, offset + 10);
      const results = await Promise.all(batch.map((subscription) =>
        sendToSubscription(
          client,
          subscription,
          {
            title: subscription.locale === "sw" ? "Habari za asubuhi kutoka DukaSmart" : "Good morning from DukaSmart",
            body: subscription.locale === "sw"
              ? `Uwe na siku njema, ${subscription.user_name.slice(0, 80)}. Kumbuka kurekodi mauzo ya leo, manunuzi na mabadiliko ya stoku.`
              : `Have a great day, ${subscription.user_name.slice(0, 80)}. Remember to record today's sales, purchases, and stock changes.`,
            url: "/dashboard",
            tag: `daily-reminder-${localDate}`,
          },
          `UPDATE daily_push_deliveries
           SET delivered_at = CASE WHEN $1 THEN now() ELSE delivered_at END,
               attempts = attempts + 1, last_error = NULLIF($2, '')
           WHERE reminder_date = $3 AND subscription_id = $4`,
          (ok, message) => [ok, message, localDate, subscription.id]
        )
      ));
      sent += results.filter(Boolean).length;
      failed += results.filter((success) => !success).length;
    }

    await client.query("COMMIT");
    return { sent, failed, skipped: false };
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw error;
  } finally {
    client.release();
  }
}
