import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getUnreadNotificationCount } from "../api/notificationApi";
import { useNotificationSocket } from "../hooks/useNotifications";
import NotificationPanel from "./NotificationPanel";
import "./NotificationBell.css";

export default function NotificationBell({ userId }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useNotificationSocket(userId);

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ["notificationUnreadCount"],
    queryFn: getUnreadNotificationCount,
    enabled: !!userId,
    refetchInterval: 10000,
  });

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    function handlePointerDown(event) {
      if (!containerRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="notification-bell-container" ref={containerRef}>
      <button
        type="button"
        className={`notification-bell-button ${isOpen ? "active" : ""}`}
        onClick={() => setIsOpen((open) => !open)}
        title="Notifications"
        aria-label="Open notifications"
        aria-controls="notification-panel"
        aria-expanded={isOpen}
      >
        <Bell className="bell-icon" />
        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <NotificationPanel isOpen={isOpen} onClose={() => setIsOpen(false)} />
      )}
    </div>
  );
}
