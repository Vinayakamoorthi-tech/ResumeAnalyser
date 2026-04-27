import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { authHeaders } from "../utils/auth";
import { useTheme } from "../context/ThemeContext";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function scoreColor(s, max = 10) {
  const p = s / max;
  return p >= 0.7 ? "#22c55e" : p >= 0.4 ? "#f59e0b" : "#ef4444";
}

function ScoreBadge({ score, max = 10 }) {
  const c = scoreColor(score, max);
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{
        fontSize: "22px", fontWeight: 900, color: c,
        fontFamily: "monospace", lineHeight: 1,
      }}>{score}/{max}</div>
      <div style={{
        fontSize: "9px", fontWeight: 700, color: c,
        marginTop: "2px", letterSpacing: "0.5px",
        textTransform: "uppercase",
      }}>
        {score >= 7 ? "Good" : score >= 4 ? "Average" : "Low"}
      </div>
    </div>
  );
}

function SkeletonCard({ theme }) {
  return (
    <div style={{
      background: theme.surface, border: `1px solid ${theme.border}`,
      borderRadius: "16px", padding: "24px",
      animation: "pulse 1.5s ease-in-out infinite",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ height: "20px", width: "40%", background: theme.border, borderRadius: "20px" }} />
          <div style={{ height: "14px", width: "90%", background: theme.border, borderRadius: "6px" }} />
          <div style={{ height: "14px", width: "70%", background: theme.border, borderRadius: "6px" }} />
        </div>
        <div style={{ width: "48px", height: "48px", background: theme.border, borderRadius: "12px" }} />
      </div>
    </div>
  );
}

export default function HistoryPage() {
  const { theme, isDark } = useTheme();
  const [sessions, setSessions] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [filter,   setFilter]   = useState("all");

  const card = {
    background: theme.surface,
    border: `1px solid ${theme.border}`,
    borderRadius: "16px", padding: "24px",
    boxShadow: isDark ? "none" : "0 2px 12px rgba(0,0,0,0.06)",
  };

  useEffect(() => {
    fetch(`${API}/interview/history`, { headers: authHeaders() })
      .then(r => r.json())
      .then(d => { setSessions(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = filter === "all"
    ? sessions
    : sessions.filter(s => s.interview_type === filter);

  const avgScore = sessions.length
    ? (sessions.reduce((a, s) => a + s.score, 0) / sessions.length).toFixed(1)
    : 0;

  return (
    <div style={{ maxWidth: "820px", margin: "0 auto", padding: "36px 28px 80px", fontFamily: "'Inter','Segoe UI', sans-serif" }}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.45}}`}</style>

      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <div style={{
          display: "inline-block", background: theme.primaryGlow,
          color: theme.primary, border: `1px solid ${theme.primary}33`,
          padding: "3px 12px", borderRadius: "20px",
          fontSize: "11px", fontWeight: 700, letterSpacing: "2px", marginBottom: "10px",
        }}>SESSION HISTORY</div>
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: theme.textPrimary, marginBottom: "6px", letterSpacing: "-0.5px" }}>
          Past Interview Sessions
        </h1>
        <p style={{ color: theme.textSecondary, fontSize: "14px" }}>
          Review your previous answers, AI feedback, and model answers.
        </p>
      </div>

      {/* Stats row */}
      {!loading && sessions.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "24px" }}>
          {[
            { label: "Total Sessions", value: sessions.length, color: theme.primary },
            { label: "Average Score",  value: `${avgScore}/10`, color: scoreColor(parseFloat(avgScore)) },
            { label: "Best Score",     value: `${Math.max(...sessions.map(s => s.score))}/10`, color: "#22c55e" },
          ].map(({ label, value, color }) => (
            <div key={label} style={{
              ...card, textAlign: "center", padding: "16px",
              transition: "transform 0.2s",
            }}
              onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
              onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
            >
              <div style={{ fontSize: "24px", fontWeight: 900, color, fontFamily: "monospace" }}>{value}</div>
              <div style={{ color: theme.textMuted, fontSize: "11px", marginTop: "4px" }}>{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filter tabs */}
      {!loading && sessions.length > 0 && (
        <div style={{
          display: "flex", gap: "6px", marginBottom: "20px",
          background: theme.surface, border: `1px solid ${theme.border}`,
          borderRadius: "10px", padding: "4px",
        }}>
          {[
            ["all",       "All Sessions"],
            ["mixed",     "Mixed"],
            ["technical", "Technical"],
            ["hr",        "HR"],
          ].map(([val, label]) => (
            <button key={val} onClick={() => setFilter(val)} style={{
              flex: 1, padding: "7px 10px", borderRadius: "7px",
              border: "none", cursor: "pointer", fontSize: "12px", fontWeight: 600,
              transition: "all 0.2s",
              background: filter === val
                ? `linear-gradient(135deg, ${theme.primary}, ${theme.accent1})`
                : "transparent",
              color: filter === val ? "#fff" : theme.textMuted,
            }}>{label}</button>
          ))}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {[1, 2, 3].map(i => <SkeletonCard key={i} theme={theme} />)}
        </div>
      )}

      {/* Empty state */}
      {!loading && sessions.length === 0 && (
        <div style={{ ...card, textAlign: "center", padding: "60px 24px" }}>
          <div style={{
            width: "72px", height: "72px", borderRadius: "20px",
            background: theme.primaryGlow, border: `1px solid ${theme.primary}33`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "32px", margin: "0 auto 20px",
          }}>🎤</div>
          <h3 style={{ color: theme.textPrimary, fontWeight: 700, fontSize: "18px", marginBottom: "8px" }}>
            No sessions yet
          </h3>
          <p style={{ color: theme.textSecondary, fontSize: "14px", marginBottom: "24px", lineHeight: "1.7" }}>
            Complete a mock interview to see your session history here.
          </p>
          <Link to="/interview" style={{
            background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent1})`,
            color: "#fff", textDecoration: "none",
            padding: "10px 24px", borderRadius: "10px",
            fontWeight: 600, fontSize: "13px",
            boxShadow: `0 4px 12px ${theme.primaryGlow}`,
          }}>Start Interview →</Link>
        </div>
      )}

      {/* No filter results */}
      {!loading && sessions.length > 0 && filtered.length === 0 && (
        <div style={{ ...card, textAlign: "center", padding: "40px" }}>
          <p style={{ color: theme.textMuted, fontSize: "14px" }}>
            No {filter} sessions found. Try a different filter.
          </p>
        </div>
      )}

      {/* Session list */}
      {!loading && filtered.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {filtered.map((s, i) => {
            const c = scoreColor(s.score);
            const isOpen = expanded === i;
            return (
              <div key={s.id || i} style={{
                ...card, cursor: "pointer",
                transition: "border-color 0.2s, transform 0.2s",
                borderColor: isOpen ? theme.primary : theme.border,
              }}
                onClick={() => setExpanded(isOpen ? null : i)}
                onMouseEnter={e => { if (!isOpen) e.currentTarget.style.borderColor = theme.primary + "66"; }}
                onMouseLeave={e => { if (!isOpen) e.currentTarget.style.borderColor = theme.border; }}
              >
                {/* Card header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Badges */}
                    <div style={{ display: "flex", gap: "6px", marginBottom: "10px", flexWrap: "wrap", alignItems: "center" }}>
                      <span style={{
                        background: theme.primaryGlow, color: theme.primary,
                        border: `1px solid ${theme.primary}33`,
                        padding: "2px 10px", borderRadius: "20px", fontSize: "10px", fontWeight: 700,
                      }}>{s.interview_type?.toUpperCase() || "MIXED"}</span>
                      <span style={{
                        background: isDark ? "rgba(124,106,245,0.1)" : "#f5f3ff",
                        color: theme.accent1,
                        border: `1px solid ${theme.accent1}33`,
                        padding: "2px 10px", borderRadius: "20px", fontSize: "10px", fontWeight: 700,
                      }}>{s.company_type?.toUpperCase() || "GENERAL"}</span>
                      <span style={{ color: theme.textMuted, fontSize: "10px" }}>
                        {s.created_at?.split("T")[0] || "—"}
                      </span>
                    </div>

                    {/* Question preview */}
                    <p style={{
                      color: theme.textPrimary, fontSize: "13.5px",
                      margin: 0, lineHeight: "1.6", fontWeight: 500,
                      overflow: "hidden", textOverflow: "ellipsis",
                      display: "-webkit-box", WebkitLineClamp: isOpen ? "none" : 2,
                      WebkitBoxOrient: "vertical",
                    }}>
                      {s.question}
                    </p>
                  </div>

                  {/* Score + expand */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", flexShrink: 0 }}>
                    <ScoreBadge score={s.score} />
                    <div style={{
                      color: theme.textMuted, fontSize: "10px",
                      background: theme.bg, border: `1px solid ${theme.border}`,
                      borderRadius: "6px", padding: "2px 8px",
                    }}>
                      {isOpen ? "▲" : "▼"}
                    </div>
                  </div>
                </div>

                {/* Expanded content */}
                {isOpen && (
                  <div style={{
                    marginTop: "16px", borderTop: `1px solid ${theme.border}`,
                    paddingTop: "16px", display: "flex", flexDirection: "column", gap: "10px",
                    animation: "fadeUp 0.2s ease forwards",
                  }}>
                    {/* Your answer */}
                    <div style={{
                      background: theme.bg, border: `1px solid ${theme.border}`,
                      borderRadius: "10px", padding: "14px",
                    }}>
                      <div style={{ color: theme.textMuted, fontSize: "10px", fontWeight: 700, letterSpacing: "1px", marginBottom: "8px", textTransform: "uppercase" }}>
                        Your Answer
                      </div>
                      <p style={{ color: theme.textSecondary, fontSize: "13px", lineHeight: "1.7", margin: 0 }}>{s.answer}</p>
                    </div>

                    {/* AI Feedback */}
                    <div style={{
                      background: theme.bg, border: `1px solid ${theme.primary}22`,
                      borderLeft: `3px solid ${theme.primary}`,
                      borderRadius: "10px", padding: "14px",
                    }}>
                      <div style={{ color: theme.primary, fontSize: "10px", fontWeight: 700, letterSpacing: "1px", marginBottom: "8px", textTransform: "uppercase" }}>
                        AI Feedback
                      </div>
                      <p style={{ color: theme.textSecondary, fontSize: "13px", lineHeight: "1.7", margin: 0 }}>{s.feedback}</p>
                    </div>

                    {/* Strengths + Improvements */}
                    {(s.strengths || s.improvements) && (
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                        {s.strengths && (
                          <div style={{
                            background: isDark ? "#052e16" : "#f0fdf4",
                            border: "1px solid #22c55e44",
                            borderRadius: "10px", padding: "12px",
                          }}>
                            <div style={{ color: "#22c55e", fontSize: "10px", fontWeight: 700, marginBottom: "6px", letterSpacing: "1px" }}>✅ STRENGTHS</div>
                            <p style={{ color: isDark ? "#4ade80" : "#15803d", fontSize: "12px", margin: 0, lineHeight: "1.6" }}>{s.strengths}</p>
                          </div>
                        )}
                        {s.improvements && (
                          <div style={{
                            background: isDark ? "#2d1f00" : "#fffbeb",
                            border: "1px solid #f59e0b44",
                            borderRadius: "10px", padding: "12px",
                          }}>
                            <div style={{ color: "#f59e0b", fontSize: "10px", fontWeight: 700, marginBottom: "6px", letterSpacing: "1px" }}>💡 IMPROVE</div>
                            <p style={{ color: isDark ? "#fbbf24" : "#92400e", fontSize: "12px", margin: 0, lineHeight: "1.6" }}>{s.improvements}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}