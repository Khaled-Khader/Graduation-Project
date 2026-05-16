import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCheck, Inbox, RefreshCw, X } from "lucide-react";
import NotificationItem from "./NotificationItem";
import { useNotifications } from "../hooks/useNotifications";
import "./NotificationPanel.css";

function getNotificationPath(notification) {
  if (notification.relatedEntityType === "CHAT") {
    return "/app/chat";
  }

  if (
    notification.relatedEntityType === "ADOPTION_POST" ||
    notification.type === "ADOPTION_REQUEST" ||
    notification.type === "ADOPTION_STATUS"
  ) {
    return "/app/my-adoptions";
  }

  if (notification.relatedEntityType === "POST") {
    return "/app";
  }

  if (notification.relatedEntityType === "VERIFICATION_REQUEST") {
    return "/app";
  }

  if (notification.relatedEntityType === "USER" && notification.relatedId) {
    return `/app/profile/${notification.relatedId}`;
  }

  return "/app";
}

function getEmptyMessage(filter) {
  if (filter === "unread") {
    return "No unread notifications.";
  }

  if (filter === "read") {
    return "No read notifications yet.";
  }

  return "No notifications yet.";
}

export default function NotificationPanel({ isOpen, onClose }) {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    loading,
    error,
    hasMore,
    handleMarkAsRead,
    handleMarkAllAsRead,
    handleDeleteNotification,
    loadNotifications,
    loadMore,
  } = useNotifications();

  const [filter, setFilter] = useState("all");

  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "unread") return !notification.isRead;
    if (filter === "read") return notification.isRead;
    return true;
  });
  const readCount = notifications.filter((notification) => notification.isRead).length;

  function openNotification(notification) {
    if (!notification.isRead) {
      handleMarkAsRead(notification.id);
    }

    const path = getNotificationPath(notification);
    const routeOptions =
      notification.relatedEntityType === "CHAT" && notification.relatedId
        ? { state: { chatId: notification.relatedId } }
        : undefined;

    navigate(path, routeOptions);
    onClose();
  }

  if (!isOpen) return null;

  return (
      <aside
        id="notification-panel"
        className="notification-panel"
        aria-label="Notifications"
      >
        <div className="notification-panel-header">
          <div className="header-left">
            <h2 className="panel-title">Notifications</h2>
            {unreadCount > 0 && (
              <span className="unread-badge">{unreadCount} unread</span>
            )}
          </div>
          <button
            type="button"
            className="btn-close"
            onClick={onClose}
            aria-label="Close notifications"
          >
            <X size={20} />
          </button>
        </div>

        <div className="notification-toolbar">
          <div className="notification-filters" role="tablist" aria-label="Notification filters">
          <button
            type="button"
            className={`filter-btn ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            All <span>{notifications.length}</span>
          </button>
          <button
            type="button"
            className={`filter-btn ${filter === "unread" ? "active" : ""}`}
            onClick={() => setFilter("unread")}
          >
            Unread <span>{unreadCount}</span>
          </button>
          <button
            type="button"
            className={`filter-btn ${filter === "read" ? "active" : ""}`}
            onClick={() => setFilter("read")}
          >
            Read <span>{Math.max(readCount, 0)}</span>
          </button>
          </div>
        </div>

        {unreadCount > 0 && (
          <button type="button" className="btn-mark-all-read" onClick={handleMarkAllAsRead}>
            <CheckCheck size={16} />
            Mark all read
          </button>
        )}

        <div className="notification-list">
          {loading && filteredNotifications.length === 0 ? (
            <div className="loading-state">
              <RefreshCw className="state-icon spinning" size={24} />
              <p>Loading notifications...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <p>{error.message || "Failed to load notifications."}</p>
              <button type="button" className="btn-retry" onClick={loadNotifications}>
                Try again
              </button>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="empty-state">
              <Inbox className="state-icon" size={28} />
              <p>{getEmptyMessage(filter)}</p>
            </div>
          ) : (
            <>
              {filteredNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id ?? `${notification.type}-${notification.createdAt}`}
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                  onDelete={handleDeleteNotification}
                  onClick={() => openNotification(notification)}
                />
              ))}

              {hasMore && (
                <button type="button" className="btn-load-more" onClick={loadMore} disabled={loading}>
                  {loading ? "Loading..." : "Load more"}
                </button>
              )}
            </>
          )}
        </div>
      </aside>
  );
}
