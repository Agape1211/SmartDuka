/* global self */

self.addEventListener("push", (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = { title: "DukaSmart", body: event.data?.text() ?? "You have an update." };
  }

  const title = typeof payload.title === "string" ? payload.title : "DukaSmart";
  const body = typeof payload.body === "string" ? payload.body : "You have an update.";
  const url = typeof payload.url === "string" && payload.url.startsWith("/") ? payload.url : "/dashboard";
  const tag = typeof payload.tag === "string" ? payload.tag : "dukasmart-notification";

  event.waitUntil(self.registration.showNotification(title, {
    body,
    icon: "/pwa-192.png",
    badge: "/pwa-192.png",
    tag,
    data: { url },
  }));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = new URL(event.notification.data?.url ?? "/dashboard", self.location.origin);
  if (url.origin !== self.location.origin) return;

  event.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
    for (const client of clients) {
      if ("focus" in client) {
        return client.navigate(url.pathname + url.search).then(() => client.focus());
      }
    }
    return self.clients.openWindow(url.pathname + url.search);
  }));
});
