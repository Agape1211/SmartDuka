import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { pool, query } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";

function isMissingLocaleColumn(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const databaseError = error as { code?: unknown; column?: unknown };
  return databaseError.code === "42703" && databaseError.column === "locale";
}

const subscriptionSchema = z.object({
  endpoint: z.string().url().max(2000),
  keys: z.object({
    p256dh: z.string().min(20).max(256),
    auth: z.string().min(10).max(128),
  }),
  locale: z.enum(["en", "sw"]).default("en"),
});

function hasTrustedOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  return origin !== null && origin === new URL(request.url).origin;
}

function isTrustedPushEndpoint(endpoint: string) {
  const url = new URL(endpoint);
  if (url.protocol !== "https:" || (url.port && url.port !== "443")) return false;
  const host = url.hostname.toLowerCase();
  return host === "fcm.googleapis.com" ||
    host === "updates.push.services.mozilla.com" ||
    host === "web.push.apple.com" ||
    host.endsWith(".push.apple.com") ||
    host === "notify.windows.com" ||
    host.endsWith(".notify.windows.com");
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  if (!hasTrustedOrigin(request)) return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });

  const parsed = subscriptionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success || !isTrustedPushEndpoint(parsed.data?.endpoint ?? "https://invalid.invalid")) {
    return NextResponse.json({ error: "Invalid push subscription" }, { status: 400 });
  }

  if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
    return NextResponse.json({ error: "Push notifications are not configured" }, { status: 503 });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(`SELECT pg_advisory_xact_lock(hashtext($1))`, [parsed.data.endpoint]);
    await client.query(
      `DELETE FROM push_subscriptions
       WHERE endpoint = $1 AND (user_id <> $2 OR shop_id <> $3)`,
      [parsed.data.endpoint, session.userId, session.shopId]
    );
    await client.query(
      `INSERT INTO push_subscriptions (user_id, shop_id, endpoint, p256dh_key, auth_key, locale)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (endpoint) DO UPDATE SET
         p256dh_key = EXCLUDED.p256dh_key,
         auth_key = EXCLUDED.auth_key,
         locale = EXCLUDED.locale,
         updated_at = now()`,
      [session.userId, session.shopId, parsed.data.endpoint, parsed.data.keys.p256dh, parsed.data.keys.auth, parsed.data.locale]
    );
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    if (isMissingLocaleColumn(error)) {
      console.error("Push subscription locale column is missing; apply pending push notification migrations.");
      return NextResponse.json(
        { error: "Notification language setup is incomplete. Please contact the administrator." },
        { status: 503 }
      );
    }
    console.error("Unable to save push notification subscription", error);
    throw error;
  } finally {
    client.release();
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  if (!hasTrustedOrigin(request)) return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });

  const parsed = z.object({ endpoint: z.string().url().max(2000) }).safeParse(
    await request.json().catch(() => null)
  );
  if (!parsed.success || !isTrustedPushEndpoint(parsed.data?.endpoint ?? "https://invalid.invalid")) {
    return NextResponse.json({ error: "Invalid push subscription" }, { status: 400 });
  }

  await query(
    `DELETE FROM push_subscriptions WHERE endpoint = $1 AND user_id = $2 AND shop_id = $3`,
    [parsed.data.endpoint, session.userId, session.shopId]
  );
  return NextResponse.json({ ok: true });
}
