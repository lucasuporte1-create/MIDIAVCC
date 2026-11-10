const CACHE_NAME = "midia-vcc-v1";

self.addEventListener("install", (e) => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

// Recebe push do servidor (escala de mídia e mensagens de chat)
self.addEventListener("push", (event) => {
  if (!event.data) return;

  let d = {};
  try {
    d = event.data.json();
  } catch (e) {
    d = { title: "Nova mensagem", body: event.data.text() };
  }

  event.waitUntil((async () => {
    const isIOS = /iPhone|iPad|iPod/.test(self.navigator.userAgent);
    const wins = await self.clients.matchAll({ type: "window", includeUncontrolled: true });

    // Mensagem de chat com o app aberto e à frente: o próprio chat já avisa.
    // No iPhone é obrigatório mostrar sempre a notificação.
    if (
      !isIOS &&
      d.conversation_id &&
      wins.some((w) => w.visibilityState === "visible" && w.focused)
    ) return;

    await self.registration.showNotification(d.title || "Nova mensagem", {
      body: d.body || "",
      icon: d.icon || "icon-192.png",
      badge: d.badge || "icon-192.png",
      tag: d.tag || (d.conversation_id ? undefined : "escala-midia"),
      renotify: true,
      vibrate: [200, 100, 200],
      data: { url: d.url || "/", conversation_id: d.conversation_id || null },
    });
  })());
});

// Ao clicar na notificação abre/foca o app (e o chat, se for o caso)
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const { url = "/", conversation_id = null } = event.notification.data || {};

  event.waitUntil((async () => {
    const wins = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const w of wins) {
      if ("focus" in w) {
        await w.focus();
        if (conversation_id) w.postMessage({ type: "open-chat", conversation_id });
        return;
      }
    }
    if (self.clients.openWindow) await self.clients.openWindow(url);
  })());
});
