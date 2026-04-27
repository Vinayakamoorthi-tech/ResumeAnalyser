import { useState, useRef, useEffect } from "react";
import { Bell } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useNotifications } from "../context/NotificationContext";

export default function NotificationBell() {
  const { theme, isDark } = useTheme();
  const { notifications, unreadCount, markRead, markAllRead, deleteNotification } = useNotifications();
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div ref={panelRef} style={{ position: "relative" }}>
      {/* Bell button */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: "relative",
          width: "36px", height: "36px", borderRadius: "10px",
          background: open
            ? `rgba(${isDark ? "91,138,240" : "67,97,238"},0.15)`
            : `rgba(${isDark ? "91,138,240" : "67,97,238"},0.08)`,
          border: `1px solid rgba(${isDark ? "91,138,240" : "67,97,238"},${open ? "0.3" : "0.15"})`,
          cursor: "pointer", color: theme.primary,
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.2s", flexShrink: 0,
        }}
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <div style={{
            position: "absolute", top: "4px", right: "4px",
            width: "8px", height: "8px", borderRadius: "50%",
            background: "#ef4444",
            border: `2px solid ${theme.sidebar}`,
            animation: "pulse 2s infinite",
          }} />
        )}
      </button>

      {/* Panel */}
      {open && (
        <div style={{
          position: "fixed",
          top: "60px",
          right: "16px",
          width: "340px",
          maxHeight: "480px",
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          borderRadius: "16px",
          boxShadow: isDark
            ? "0 20px 60px rgba(0,0,0,0.5)"
            : "0 20px 60px rgba(0,0,0,0.15)",
          zIndex: 9999,
          display: "flex", flexDirection: "column",
          overflow: "hidden",
          animation: "fadeUp 0.15s ease",
        }}>

          {/* Header */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "16px 18px 12px",
            borderBottom: `1px solid ${theme.border}`,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ color: theme.textPrimary, fontWeight: 700, fontSize: "14px" }}>
                Notifications
              </span>
              {unreadCount > 0 && (
                <span style={{
                  background: "#ef4444", color: "#fff",
                  fontSize: "10px", fontWeight: 700,
                  padding: "1px 6px", borderRadius: "10px",
                }}>{unreadCount}</span>
              )}
            </div>
            {unreadCount > 0 && (
              <button onClick={markAllRead} style={{
                background: "transparent", border: "none",
                color: theme.primary, fontSize: "12px",
                fontWeight: 600, cursor: "pointer",
              }}>Mark all read</button>
            )}
          </div>

          {/* List */}
          <div style={{ overflowY: "auto", flex: 1 }}>
            {notifications.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 20px" }}>
                <div style={{ fontSize: "32px", marginBottom: "8px" }}>🔔</div>
                <p style={{ color: theme.textMuted, fontSize: "13px" }}>No notifications yet</p>
              </div>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  onClick={() => markRead(n.id)}
                  style={{
                    padding: "14px 18px",
                    borderBottom: `1px solid ${theme.border}`,
                    background: n.read ? "transparent" : isDark
                      ? "rgba(91,138,240,0.04)"
                      : "rgba(67,97,238,0.03)",
                    cursor: "pointer",
                    transition: "background 0.15s",
                    position: "relative",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = theme.surfaceHover}
                  onMouseLeave={e => e.currentTarget.style.background = n.read ? "transparent" : isDark ? "rgba(91,138,240,0.04)" : "rgba(67,97,238,0.03)"}
                >
                  <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                    {/* Icon */}
                    <div style={{
                      width: "36px", height: "36px", borderRadius: "10px", flexShrink: 0,
                      background: n.color + "18",
                      border: `1px solid ${n.color}33`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "16px",
                    }}>{n.icon}</div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "3px" }}>
                        <span style={{ color: theme.textPrimary, fontWeight: 600, fontSize: "13px" }}>{n.title}</span>
                        {!n.read && (
                          <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: theme.primary, flexShrink: 0 }} />
                        )}
                      </div>
                      <p style={{ color: theme.textSecondary, fontSize: "12px", lineHeight: "1.6", margin: "0 0 4px" }}>{n.message}</p>
                      <span style={{ color: theme.textMuted, fontSize: "10px" }}>{n.time}</span>
                    </div>

                    {/* Delete */}
                    <button
                      onClick={e => { e.stopPropagation(); deleteNotification(n.id); }}
                      style={{
                        background: "transparent", border: "none",
                        color: theme.textMuted, cursor: "pointer",
                        fontSize: "14px", padding: "2px", flexShrink: 0,
                        lineHeight: 1,
                      }}
                    >✕</button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div style={{ padding: "10px 18px", borderTop: `1px solid ${theme.border}`, textAlign: "center" }}>
              <button
                onClick={() => { notifications.forEach(n => deleteNotification(n.id)); }}
                style={{ background: "transparent", border: "none", color: theme.textMuted, fontSize: "12px", cursor: "pointer" }}
              >
                Clear all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}