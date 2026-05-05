import { Bell } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getMyNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../../features/notifications/notifications.api";
import "../../styles/notifications.css";

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  link?: string | null;
  createdAt: string;
};

export default function NotificationDropdown() {
  const navigate = useNavigate();
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  async function loadNotifications() {
    try {
      const data = await getMyNotifications();

      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    loadNotifications();

    const intervalId = window.setInterval(loadNotifications, 15000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  async function handleToggle() {
    const nextOpen = !open;
    setOpen(nextOpen);

    if (nextOpen && unreadCount > 0) {
      try {
        await markAllNotificationsAsRead();

        setUnreadCount(0);
        setNotifications((prev) =>
          prev.map((item) => ({
            ...item,
            isRead: true,
          })),
        );
      } catch (e) {
        console.error(e);
      }
    }
  }

  async function handleNotificationClick(notification: NotificationItem) {
    try {
      if (!notification.isRead) {
        await markNotificationAsRead(notification.id);
      }

      setOpen(false);

      if (notification.link) {
        navigate(notification.link);
      }
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="notification" ref={wrapperRef}>
      <button
        type="button"
        className="notification__btn"
        aria-label="Сповіщення"
        onClick={handleToggle}
      >
        <Bell size={18} />

        {unreadCount > 0 && (
          <span className="notification__badge">{unreadCount}</span>
        )}
      </button>

      {open && (
        <div className="notification__dropdown">
          <div className="notification__header">
            <strong>Сповіщення</strong>
          </div>

          {notifications.length === 0 ? (
            <p className="notification__empty">Немає сповіщень</p>
          ) : (
            <div className="notification__list">
              {notifications.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  className={`notification__item ${
                    !notification.isRead ? "notification__item--unread" : ""
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <strong>{notification.title}</strong>
                  <span>{notification.message}</span>
                  <small>
                    {new Date(notification.createdAt).toLocaleString("uk-UA")}
                  </small>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}