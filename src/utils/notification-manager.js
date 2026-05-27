export function getNotifications() {
  try {
    const raw = localStorage.getItem("yooga_notifications");
    if (!raw) {
      // Semente inicial de notificações
      const seeds = [
        {
          id: "seed-welcome",
          title: "Boas-vindas ao Yooga CS Coach!",
          description: "Sua plataforma interativa para capacitação de Customer Success está pronta. Comece agora!",
          type: "system",
          unread: true,
          timestamp: Date.now() - 1000 * 60 * 30 // 30 minutos atrás
        },
        {
          id: "seed-trilha",
          title: "Nova Trilha de Aprendizado!",
          description: "Estude o módulo prático 'Impressora Cortando Bobina' e teste seus conhecimentos.",
          type: "modules",
          unread: true,
          timestamp: Date.now() - 1000 * 60 * 10 // 10 minutos atrás
        }
      ];
      localStorage.setItem("yooga_notifications", JSON.stringify(seeds));
      return seeds;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveNotifications(notifications) {
  localStorage.setItem("yooga_notifications", JSON.stringify(notifications));
  dispatchNotificationEvent();
}

export function addNotification(title, description, type = "info", metadata = null) {
  const notifications = getNotifications();
  const newNotif = {
    id: "notif_" + Date.now() + Math.random().toString(36).slice(2, 5),
    title,
    description,
    type,
    metadata,
    unread: true,
    timestamp: Date.now()
  };
  
  notifications.unshift(newNotif); // Adiciona no início (mais recente primeiro)
  saveNotifications(notifications);
  console.log(`[Yooga Notification] Nova notificação adicionada: "${title}"`);
  return newNotif;
}

export function markAsRead(id) {
  const notifications = getNotifications();
  const idx = notifications.findIndex(n => n.id === id);
  if (idx !== -1) {
    notifications[idx].unread = false;
    saveNotifications(notifications);
  }
}

export function markAllAsRead() {
  const notifications = getNotifications().map(n => ({ ...n, unread: false }));
  saveNotifications(notifications);
}

export function removeNotification(id) {
  const notifications = getNotifications().filter(n => n.id !== id);
  saveNotifications(notifications);
}

function dispatchNotificationEvent() {
  const unreadCount = getNotifications().filter(n => n.unread).length;
  const event = new CustomEvent("yooga-notifications-changed", {
    detail: { unreadCount }
  });
  window.dispatchEvent(event);
}
