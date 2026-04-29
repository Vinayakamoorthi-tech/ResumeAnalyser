import { useState, useRef, useEffect } from "react";
import { Bell } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useNotifications } from "../context/NotificationContext";

export default function NotificationBell() {
  const { theme, isDark } = useTheme();
  const {
    notifications, unreadCount,
    markRead, markAllRead, deleteNotification, clearAll,
    requestPushPermission, pushEnabled,
  } = useNotifications();

  const [open, setOpen]           = useState(false);
  const [panelPos, setPanelPos]   = useState({ top: 0, left: 0 });
  const buttonRef                 = useRef(null);
  const panelRef                  = useRef(null);

  // ── Position panel relative to bell button ────────────────────────────────
  useEffect(() => {
    if (open && buttonRef.current) {
      const rect   = buttonRef.current.getBoundingClientRect();
      const vw     = window.innerWidth;
      const panelW = 340;

      // Try to open to the right of button; if not enough space, open left
      let left = rect.right + 8;
      if (left + panelW > vw - 8) left = rect.left - panelW - 8;

      // Vertical: align top with button, but don't go off screen bottom
      let top = rect.top;
      const maxTop = window.innerHeight - 500;
      if (top > maxTop) top = maxTop;

      setPanelPos({ top, left });
    }
  }, [open]);

  // ── Close on outside click ────────────────────────────────────────────────
  useEffect(() => {
    function handleClick(e) {
      if (
        panelRef.current && !panelRef.current.contains(e.target) &&
        buttonRef.current && !buttonRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  function toggle() { setOpen(o => !o); }

  function timeLabel(n) {
    return n.time || "";
  }

  return (
    <>
      {/* Bell button */}
      <button
        ref={buttonRef}
        onClick={toggle}
        title="Notifications"
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
            position: "absolute", top: "5px", right: "5px",
            width: "8px", height: "8px", borderRadius: "50%",
            background: "#ef4444",
            border: `2px solid ${theme.sidebar}`,
            animation: "pulse 2s infinite",
          }} />
        )}
      </button>

      {/* Panel — rendered via portal-like fixed positioning */}
      {open && (
        <div
          ref={panelRef}
          style={{
            position: "fixed",
            top: panelPos.top,
            left: panelPos.left,
            width: "340px",
            maxHeight: "480px",
            background: isDark ? "#0f0f1a" : "#ffffff",
            border: `1px solid ${theme.border}`,
            borderRadius: "16px",
            boxShadow: isDark
              ? "0 20px 60px rgba(0,0,0,0.6)"
              : "0 20px 60px rgba(0,0,0,0.15)",
            zIndex: 99999,
            display: "flex", flexDirection: "column",
            overflow: "hidden",
            animation: "fadeUp 0.15s ease",
          }}
        >
          {/* Header */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "14px 16px 12px",
            borderBottom: `1px solid ${theme.border}`,
            flexShrink: 0,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ color: theme.textPrimary, fontWeight: 700, fontSize: "14px" }}>
                Notifications
              </span>
              {unreadCount > 0 && (
                <span style={{
                  background: "#ef4444", color: "#fff",
                  fontSize: "10px", fontWeight: 700,
                  padding: "1px 7px", borderRadius: "10px",
                }}>{unreadCount}</span>
              )}
            </div>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              {!pushEnabled && (
                <button
                  onClick={requestPushPermission}
                  style={{
                    background: theme.primaryGlow, color: theme.primary,
                    border: `1px solid ${theme.primary}33`,
                    borderRadius: "6px", padding: "3px 8px",
                    fontSize: "10px", fontWeight: 600, cursor: "pointer",
                  }}
                >Enable Push</button>
              )}
              {unreadCount > 0 && (
                <button onClick={markAllRead} style={{
                  background: "transparent", border: "none",
                  color: theme.primary, fontSize: "11px",
                  fontWeight: 600, cursor: "pointer",
                }}>Mark all read</button>
              )}
            </div>
          </div>

          {/* Notification list */}
          <div style={{ overflowY: "auto", flex: 1 }}>
            {notifications.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 20px" }}>
                <div style={{ fontSize: "32px", marginBottom: "10px" }}>🔔</div>
                <p style={{ color: theme.textMuted, fontSize: "13px", marginBottom: "6px" }}>No notifications yet</p>
                <p style={{ color: theme.textMuted, fontSize: "11px", lineHeight: "1.5" }}>
                  You'll get reminders for daily practice and score milestones.
                </p>
              </div>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  onClick={() => markRead(n.id)}
                  style={{
                    padding: "12px 16px",
                    borderBottom: `1px solid ${theme.border}`,
                    background: n.read
                      ? "transparent"
                      : isDark ? "rgba(91,138,240,0.05)" : "rgba(67,97,238,0.03)",
                    cursor: "pointer",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = theme.surfaceHover}
                  onMouseLeave={e => e.currentTarget.style.background = n.read ? "transparent" : isDark ? "rgba(91,138,240,0.05)" : "rgba(67,97,238,0.03)"}
                >
                  <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                    {/* Icon */}
                    <div style={{
                      width: "36px", height: "36px", borderRadius: "10px", flexShrink: 0,
                      background: (n.color || "#3b82f6") + "18",
                      border: `1px solid ${(n.color || "#3b82f6")}33`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "16px",
                    }}>{n.icon || "🔔"}</div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "3px", gap: "6px" }}>
                        <span style={{ color: theme.textPrimary, fontWeight: 600, fontSize: "12px", lineHeight: "1.4" }}>
                          {n.title}
                        </span>
                        {!n.read && (
                          <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: theme.primary, flexShrink: 0, marginTop: "4px" }} />
                        )}
                      </div>
                      <p style={{ color: theme.textSecondary, fontSize: "11px", lineHeight: "1.6", margin: "0 0 4px" }}>
                        {n.message}
                      </p>
                      <span style={{ color: theme.textMuted, fontSize: "10px" }}>{timeLabel(n)}</span>
                    </div>

                    {/* Delete button */}
                    <button
                      onClick={e => { e.stopPropagation(); deleteNotification(n.id); }}
                      style={{
                        background: "transparent", border: "none",
                        color: theme.textMuted, cursor: "pointer",
                        fontSize: "12px", padding: "2px 4px", flexShrink: 0,
                        borderRadius: "4px", lineHeight: 1,
                        transition: "color 0.15s",
                      }}
                      onMouseEnter={e => e.currentTarget.style.color = theme.danger}
                      onMouseLeave={e => e.currentTarget.style.color = theme.textMuted}
                    >✕</button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div style={{
              padding: "10px 16px",
              borderTop: `1px solid ${theme.border}`,
              textAlign: "center", flexShrink: 0,
            }}>
              <button
                onClick={clearAll}
                style={{
                  background: "transparent", border: "none",
                  color: theme.textMuted, fontSize: "11px",
                  cursor: "pointer", fontWeight: 500,
                }}
                onMouseEnter={e => e.currentTarget.style.color = theme.danger}
                onMouseLeave={e => e.currentTarget.style.color = theme.textMuted}
              >
                Clear all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}