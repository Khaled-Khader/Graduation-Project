import { http } from "../util/http";

const NOTIFICATION_BASE_URL = "/notifications";

const DEFAULT_NOTIFICATION_TITLES = {
  NEW_MESSAGE: "New message",
  ADOPTION_REQUEST: "New adoption request",
  ADOPTION_STATUS: "Adoption update",
  POST_COMMENT: "New comment",
  POST_INTERACTION: "Post interaction",
};

function toBoolean(value) {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    return value.toLowerCase() === "true";
  }

  return Boolean(value);
}

function normalizeEntityType(value) {
  if (!value) {
    return null;
  }

  return String(value).toUpperCase();
}

export function normalizeNotification(notification = {}) {
  const type = notification.type || "UNKNOWN";
  const title = notification.title || DEFAULT_NOTIFICATION_TITLES[type] || "Notification";

  return {
    ...notification,
    id: notification.id,
    type,
    title,
    message: notification.message || "",
    relatedId: notification.relatedId ?? notification.related_id ?? null,
    relatedEntityType: normalizeEntityType(
      notification.relatedEntityType ?? notification.related_entity_type
    ),
    isRead: toBoolean(notification.isRead ?? notification.read ?? false),
    createdAt:
      notification.createdAt ??
      notification.created_at ??
      notification.timestamp ??
      null,
    readAt: notification.readAt ?? notification.read_at ?? null,
  };
}

function normalizeNotificationPage(data) {
  if (Array.isArray(data)) {
    return {
      content: data.map(normalizeNotification),
      number: 0,
      last: true,
      totalElements: data.length,
    };
  }

  const content = Array.isArray(data?.content)
    ? data.content
    : Array.isArray(data?.notifications)
      ? data.notifications
      : [];

  return {
    ...data,
    content: content.map(normalizeNotification),
    number: data?.number ?? 0,
    last: data?.last ?? true,
    totalElements: data?.totalElements ?? content.length,
  };
}

export async function fetchNotifications(page = 0, size = 20) {
  const params = new URLSearchParams({
    page,
    size,
    sort: "createdAt,desc",
  });

  const data = await http(`${NOTIFICATION_BASE_URL}?${params.toString()}`);
  return normalizeNotificationPage(data);
}

export async function fetchUnreadNotifications() {
  const data = await http(`${NOTIFICATION_BASE_URL}/unread`);
  return Array.isArray(data) ? data.map(normalizeNotification) : [];
}

export async function getUnreadNotificationCount() {
  const data = await http(`${NOTIFICATION_BASE_URL}/unread/count`);
  if (typeof data === "number") {
    return data;
  }

  return data.unreadCount ?? data.count ?? 0;
}

export async function fetchNotificationsByType(type, page = 0, size = 20) {
  const params = new URLSearchParams({
    page,
    size,
    sort: "createdAt,desc",
  });

  const data = await http(`${NOTIFICATION_BASE_URL}/type/${type}?${params.toString()}`);
  return normalizeNotificationPage(data);
}

export async function markNotificationAsRead(notificationId) {
  const data = await http(`${NOTIFICATION_BASE_URL}/${notificationId}/read`, {
    method: "PUT",
  });
  return normalizeNotification(data);
}

export function markAllNotificationsAsRead() {
  return http(`${NOTIFICATION_BASE_URL}/read/all`, {
    method: "PUT",
  });
}

export function deleteNotification(notificationId) {
  return http(`${NOTIFICATION_BASE_URL}/${notificationId}`, {
    method: "DELETE",
  });
}
