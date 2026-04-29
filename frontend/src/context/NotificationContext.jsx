import { createContext, useContext, useState, useEffect, useCallback } from "react";

const NotificationContext = createContext();

export function useNotifications() {
  return useContext(NotificationContext);
}

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function loadStored() {
  try { return JSON.parse(localStorage.getItem("pai_notifications") || "[]"); }
  catch { return []; }
}

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState(loadStored);
  const [pushEnabled, setPushEnabled]     = useState(false);

  // Persist on every change
  useEffect(() => {
    localStorage.setItem("pai_notifications", JSON.stringify(notifications));
  }, [notifications]);

  // Check push permission
  useEffect(() => {
    if ("Notification" in window) {
      setPushEnabled(Notification.permission === "granted");
    }
  }, []);

  // Auto-check daily reminder on app load
  useEffect(() => {
    const timer = setTimeout(() => checkDailyReminder(), 3000);
    return () => clearTimeout(timer);
  }, []);

  async function requestPushPermission() {
    if (!("Notification" in window)) return false;
    if (Notification.permission === "granted") { setPushEnabled(true); return true; }
    if (Notification.permission === "denied")  return false;
    const result  = await Notification.requestPermission();
    const granted = result === "granted";
    setPushEnabled(granted);
    return granted;
  }

  function sendBrowserPush(title, body) {
    if ("Notification" in window && Notification.permission === "granted") {
      try { new Notification(title, { body, icon: "/favicon.svg" }); }
      catch (e) { console.log("Push failed:", e); }
    }
  }

  const addNotification = useCallback((type, title, message, icon = "🔔", color = "#3b82f6") => {
    const today = getTodayKey();
    const id    = `${type}_${today}`;
    setNotifications(prev => {
      if (prev.find(n => n.id === id)) return prev;
      const newNote = {
        id, type, title, message, icon, color,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        read: false,
      };
      sendBrowserPush(title, message);
      return [newNote, ...prev].slice(0, 20);
    });
  }, []);

  function checkDailyReminder() {
    const today     = getTodayKey();
    const lastPract = localStorage.getItem("pai_last_practice");
    if (lastPract === today) return;
    addNotification(
      "daily_reminder",
      "Practice Reminder",
      "You haven't practiced today. Do a mock interview or resume check to stay on track!",
      "🎯",
      "#f59e0b"
    );
  }

  function checkScoreMilestone(score) {
    const milestones = [40, 60, 80, 100];
    const crossed    = milestones.filter(m => score >= m);
    if (!crossed.length) return;
    const highest = Math.max(...crossed);
    const today   = getTodayKey();
    const id      = `score_milestone_${highest}_${today}`;
    setNotifications(prev => {
      if (prev.find(n => n.id === id)) return prev;
      const msg = score >= 80
        ? "Excellent — you're placement ready! Keep it up."
        : score >= 60 ? "Good progress. Keep improving your weak areas."
        : "You're building momentum. Keep going!";
      const newNote = {
        id, type: "score_milestone",
        title:   `Resume Score: ${score}/100`,
        message: msg,
        icon: "🏆", color: "#22c55e",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        read: false,
      };
      sendBrowserPush(newNote.title, newNote.message);
      return [newNote, ...prev].slice(0, 20);
    });
  }

  function markRead(id) {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }

  function markAllRead() {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }

  // ✅ deleteNotification — was missing, caused the crash
  function deleteNotification(id) {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }

  function clearAll() { setNotifications([]); }

  function recordPractice() {
    localStorage.setItem("pai_last_practice", getTodayKey());
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{
      notifications, unreadCount, pushEnabled,
      requestPushPermission, checkDailyReminder,
      checkScoreMilestone, recordPractice,
      markRead, markAllRead, deleteNotification, clearAll,
    }}>
      {children}
    </NotificationContext.Provider>
  );
}