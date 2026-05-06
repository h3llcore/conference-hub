import { Bell, CheckCheck } from "lucide-react";
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
      const items: NotificationItem[] = data.notifications || [];

      setNotifications(items.filter((item) => !item.isRead));
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

  function handleToggle() {
    setOpen((prev) => !prev);
  }

  async function handleMarkAllAsRead() {
    try {
      await markAllNotificationsAsRead();
      setNotifications([]);
      setUnreadCount(0);
    } catch (e) {
      console.error(e);
    }
  }

  async function handleNotificationClick(notification: NotificationItem) {
    try {
      await markNotificationAsRead(notification.id);

      setNotifications((prev) =>
        prev.filter((item) => item.id !== notification.id),
      );

      setUnreadCount((prev) => Math.max(prev - 1, 0));
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
        className="notification__button"
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
          <div className="notification__top">
            <div>
              <h3>Сповіщення</h3>
              <p>
                {unreadCount > 0
                  ? `Непрочитаних: ${unreadCount}`
                  : "Нових сповіщень немає"}
              </p>
            </div>
          </div>

          {notifications.length > 0 && (
            <button
              type="button"
              className="notification__read-all"
              onClick={handleMarkAllAsRead}
            >
              <CheckCheck size={16} />
              <span>Позначити все як прочитане</span>
            </button>
          )}

          {notifications.length === 0 ? (
            <div className="notification__empty">
              <Bell size={22} />
              <p>Немає нових сповіщень</p>
            </div>
          ) : (
            <div className="notification__list">
              {notifications.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  className="notification__item"
                  onClick={() => handleNotificationClick(notification)}
                >
                  <span className="notification__item-dot" />

                  <span className="notification__item-content">
                    <strong>{notification.title}</strong>
                    <span>{notification.message}</span>
                    <small>
                      {new Date(notification.createdAt).toLocaleString(
                        "uk-UA",
                        {
                          day: "2-digit",
                          month: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )}
                    </small>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}