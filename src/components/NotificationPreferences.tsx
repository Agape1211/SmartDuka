"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";

function decodeVapidKey(base64Key: string) {
  const normalized = base64Key.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(normalized.length + ((4 - normalized.length % 4) % 4), "=");
  const binary = window.atob(padded);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function waitForActiveServiceWorker(scope: string, timeoutMessage: string, notReadyMessage: string) {
  let timeoutId: number | undefined;
  const activation = navigator.serviceWorker.ready.then((registration) => {
    if (registration.scope !== scope || !registration.active) {
      throw new Error(notReadyMessage);
    }
    return registration;
  });
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = window.setTimeout(() => reject(new Error(timeoutMessage)), 15_000);
  });

  return Promise.race([activation, timeout]).finally(() => {
    if (timeoutId !== undefined) window.clearTimeout(timeoutId);
  });
}

export function NotificationPreferences({ compact = false }: { compact?: boolean }) {
  const { t, locale } = useLanguage();
  const [enabled, setEnabled] = useState(false);
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) return;
    void navigator.serviceWorker.getRegistration("/").then(async (registration) => {
      const subscription = await registration?.pushManager.getSubscription();
      setEnabled(Boolean(subscription) && Notification.permission === "granted");
      if (subscription && Notification.permission === "granted") {
        const response = await fetch("/api/notifications/subscription", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...subscription.toJSON(), locale }),
        });
        if (!response.ok) {
          const result = await response.json().catch(() => null);
          setMessage(result?.error === "Notification language setup is incomplete. Please contact the administrator."
            ? t(result.error)
            : t("Could not sync notification language."));
        }
      }
    }).catch(() => setMessage(t("Could not check notification status.")));
  }, [locale, t]);

  async function enableNotifications() {
    setWorking(true);
    setMessage("");
    try {
      if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
        throw new Error(t("This browser does not support push notifications."));
      }
      const isAppleMobile = /iphone|ipad|ipod/i.test(navigator.userAgent);
      const isInstalledPwa = window.matchMedia("(display-mode: standalone)").matches ||
        ("standalone" in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone));
      if (isAppleMobile && !isInstalledPwa) {
        throw new Error(t("On iPhone or iPad, install DukaSmart to your Home Screen before enabling notifications."));
      }
      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!publicKey) throw new Error(t("Push notifications are not configured yet."));

      const permission = await Notification.requestPermission();
      if (permission !== "granted") throw new Error(t("Allow notifications in your browser settings, then try again."));

      const registration = await navigator.serviceWorker.register("/sw.js");
      const activeRegistration = await waitForActiveServiceWorker(
        registration.scope,
        t("The notification service is still starting. Please try again."),
        t("The notification service is not ready. Please try again."),
      );

      let subscription = await activeRegistration.pushManager.getSubscription();
      subscription ??= await activeRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: decodeVapidKey(publicKey) as BufferSource,
      });

      const response = await fetch("/api/notifications/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...subscription.toJSON(), locale }),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) {
        const serverError = result?.error === "Push notifications are not configured"
          ? t("Push notifications are not configured.")
          : t("Could not enable notifications. Try again.");
        throw new Error(serverError);
      }

      setEnabled(true);
      setMessage(t("Notifications are enabled on this device."));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : t("Could not enable notifications. Try again."));
    } finally {
      setWorking(false);
    }
  }

  async function disableNotifications() {
    setWorking(true);
    setMessage("");
    try {
      const registration = await navigator.serviceWorker.getRegistration("/");
      const subscription = await registration?.pushManager.getSubscription();
      if (!subscription) {
        setEnabled(false);
        return;
      }

      const response = await fetch("/api/notifications/subscription", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: subscription.endpoint }),
      });
      if (!response.ok) throw new Error(t("Could not disable notifications. Try again."));
      await subscription.unsubscribe();
      setEnabled(false);
      setMessage(t("Notifications are off on this device."));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : t("Could not disable notifications. Try again."));
    } finally {
      setWorking(false);
    }
  }

  return (
    <div className={compact ? "shrink-0" : "space-y-2"}>
      <button
        type="button"
        disabled={working}
        onClick={enabled ? disableNotifications : enableNotifications}
        className={compact
          ? "shrink-0 whitespace-nowrap rounded-lg px-3 py-2 text-[11px] font-medium text-brand hover:bg-teal-50 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          : "w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-left text-sm text-white transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"}
      >
        <span aria-hidden="true" className="mr-2">{enabled ? "✓" : "🔔"}</span>
        {working ? t("Updating notifications…") : enabled ? t("Turn off notifications") : t("Enable notifications")}
      </button>
      {message && (
        <p role="status" className={compact
          ? "fixed bottom-16 left-2 right-2 z-40 rounded-lg bg-slate-900 px-3 py-2 text-xs text-white shadow-lg"
          : "px-1 text-xs leading-5 text-teal-100"}>
          {message}
        </p>
      )}
    </div>
  );
}
