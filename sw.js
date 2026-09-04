const CACHE_NAME = "midia-vcc-v1";

self.addEventListener("install", e => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(clients.claim()));

// Recebe push do servidor
self.addEventListener("push", e => {
  if (!e.data) return;
  const data = e.data.json();
  e.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon || "icon-192.png",
      badge: data.badge || "icon-192.png",
      tag: data.tag || "escala-midia",
      renotify: true,
      vibrate: [200, 100, 200],
      data: { url: data.url || "/" }
    })
  );
});

// Ao clicar na notificação abre o app
self.addEventListener("notificationclick", e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(list => {
      for (const c of list) {
        if (c.url && "focus" in c) return c.focus();
      }
      if (clients.openWindow) return clients.openWindow(e.notification.data.url || "/");
    })
  );
});