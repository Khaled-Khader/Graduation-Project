import {
  Bell,
  Check,
  CheckCircle2,
  ExternalLink,
  Heart,
  MessageCircle,
  MessageSquareText,
  PawPrint,
  Trash2,
} from "lucide-react";
import "./NotificationItem.css";

const TYPE_CONFIG = {
  NEW_MESSAGE: {
    label: "Message",
    detail: "Someone sent you a private message.",
    icon: MessageCircle,
    tone: "blue",
  },
  ADOPTION_REQUEST: {
    label: "Adoption request",
    detail: "Someone is interested in adopting your pet.",
    icon: PawPrint,
    tone: "amber",
  },
  ADOPTION_STATUS: {
    label: "Adoption update",
    detail: "There is a status update on an adoption request.",
    icon: CheckCircle2,
    tone: "green",
  },
  POST_COMMENT: {
    label: "Comment",
    detail: "Someone commented on your post.",
    icon: MessageSquareText,
    tone: "violet",
  },
  POST_INTERACTION: {
    label: "Post activity",
    detail: "Someone interacted with your post.",
    icon: Heart,
    tone: "rose",
  },
};

function getTypeConfig(type) {
  return TYPE_CONFIG[type] || {
    label: "Notification",
    detail: "You have a new update.",
    icon: Bell,
    tone: "slate",
  };
}

function formatRelativeTime(value) {
  const createdAt = new Date(value);
  if (Number.isNaN(createdAt.getTime())) {
    return "";
  }

  const seconds = Math.max(0, Math.floor((Date.now() - createdAt.getTime()) / 1000));
  if (seconds < 60) return "Just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return createdAt.toLocaleDateString();
}

function formatAbsoluteTime(value) {
  const createdAt = new Date(value);
  if (Number.isNaN(createdAt.getTime())) {
    return "";
  }

  return createdAt.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function getRelatedLabel(notification) {
  const labels = {
    CHAT: "Chat",
    ADOPTION_POST: "Adoption post",
    POST: "Post",
    USER: "Profile",
  };

  const label = labels[notification.relatedEntityType];
  if (!label) {
    return "";
  }

  return notification.relatedId ? `${label} #${notification.relatedId}` : label;
}

export default function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
  onClick,
  onOpen,
}) {
  const config = getTypeConfig(notification.type);
  const Icon = config.icon;
  const relatedLabel = getRelatedLabel(notification);
  const relativeTime = formatRelativeTime(notification.createdAt);
  const absoluteTime = formatAbsoluteTime(notification.createdAt);
  const openNotification = onOpen || onClick;

  function handleMarkAsRead() {
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }
  }

  function handleDelete() {
    onDelete(notification.id);
  }

  return (
    <article className={`notification-item ${notification.isRead ? "read" : "unread"}`}>
      <button
        type="button"
        className="notification-main"
        onClick={openNotification}
      >
        <span className={`notification-icon notification-icon-${config.tone}`}>
          <Icon className="notification-icon-svg" />
        </span>

        <span className="notification-content">
          <span className="notification-meta-row">
            <span className={`notification-type notification-type-${config.tone}`}>
              {config.label}
            </span>
            {!notification.isRead && <span className="notification-new-pill">New</span>}
          </span>

          <span className="notification-title" dir="auto">
            {notification.title}
          </span>

          {notification.message ? (
            <span className="notification-message" dir="auto">
              {notification.message}
            </span>
          ) : (
            <span className="notification-message muted">{config.detail}</span>
          )}

          <span className="notification-footer">
            {relativeTime && (
              <span className="notification-time" title={absoluteTime}>
                {relativeTime}
              </span>
            )}
            {relatedLabel && <span className="notification-related">{relatedLabel}</span>}
          </span>
        </span>

        <ExternalLink className="notification-open-icon" />
      </button>

      <div className="notification-actions">
        {!notification.isRead && (
          <button
            type="button"
            className="btn-mark-read"
            onClick={handleMarkAsRead}
            title="Mark as read"
            aria-label="Mark notification as read"
          >
            <Check size={16} />
          </button>
        )}
        <button
          type="button"
          className="btn-delete"
          onClick={handleDelete}
          title="Delete notification"
          aria-label="Delete notification"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </article>
  );
}
