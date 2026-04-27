import { createContext, useContext, useState, useEffect } from "react";
import { getUser } from "../utils/auth";

const NotificationContext = createContext();

const DEFAULT_NOTIFICATIONS = [
  {
    id: 1,
    type: "tip",
    icon: "💡",
    title: "Resume Tip",
    message: "Add quantified achievements to your resume. E.g. 'Improved performance by 40%' instead of 'Improved performance'.",
    time: "Just now",
    read: false,
    color: "#f59e0b",
  },
  {
    id: 2,
    type: "reminder",
    icon: "🎤",
    title: "Practice Reminder",
    message: "You haven't done a mock interview recently. Practice daily to build confidence before your placement drive.",
    time: "1 hour ago",
    read: false,
    color: "#6366f1",
  },
  {
    id: 3,
    type: "achievement",
    icon: "🏆",
    title: "Welcome to PlacementAI",
    message: "Your account is ready. Start by analyzing your resume to get your baseline score.",
    time: "Today",
    read: false,
    color: "#22c55e",
  },
];

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem("notifications");
      return saved ? JSON.parse(saved) : DEFAULT_NOTIFICATIONS;
    } catch {
      return DEFAULT_NOTIFICATIONS;
    }
  });

  useEffect(() => {
    localStorage.setItem("notifications", JSON.stringify(notifications));
  }, [notifications]);

  const unreadCount = notifications.filter(n => !n.read).length;

  function markRead(id) {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }

  function markAllRead() {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }

  function deleteNotification(id) {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }

  function addNotification(notif) {
    setNotifications(prev => [{
      id: Date.now(),
      read: false,
      time: "Just now",
      ...notif,
    }, ...prev]);
  }

  return (
    <NotificationContext.Provider value={{
      notifications, unreadCount,
      markRead, markAllRead, deleteNotification, addNotification,
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}