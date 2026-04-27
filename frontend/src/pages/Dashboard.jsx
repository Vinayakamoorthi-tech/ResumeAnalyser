import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { authHeaders } from "../utils/auth";
import { useTheme } from "../context/ThemeContext";

import API from "../utils/config";

function scoreColor(s, max = 100) {
  const p = s / max;
  return p >= 0.75 ? "#22c55e" : p >= 0.5 ? "#f59e0b" : "#ef4444";
}

function priorityColor(p) {
  return p === "high" ? "#ef4444" : p === "medium" ? "#f59e0b" : "#22c55e";
}

function Gauge({ score, label, theme }) {
  const color = scoreColor(score);
  const pct = score / 100;
  return (
    <div style={{ textAlign: "center" }}>
      <svg width="180" height="100" viewBox="0 0 180 100">
        <path d="M 20 90 A 70 70 0 0 1 160 90" fill="none" stroke={theme.border} strokeWidth="10" strokeLinecap="round" />
        <path d="M 20 90 A 70 70 0 0 1 160 90" fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={`${pct * 219.9} 219.9`}
          style={{ transition: "stroke-dasharray 1.2s cubic-bezier(.4,0,.2,1)" }}
        />
        <text x="90" y="78" textAnchor="middle" fill={color} fontSize="28" fontWeight="900" fontFamily="monospace">{score}</text>
        <text x="90" y="94" textAnchor="middle" fill={theme.textMuted} fontSize="11" fontFamily="sans-serif">/ 100</text>
      </svg>
      <div style={{
        display: "inline-block", padding: "4px 16px", borderRadius: "20px",
        fontSize: "12px", fontWeight: 700, marginTop: "4px",
        color, background: color + "18", border: `1px solid ${color}44`,
      }}>{label}</div>
    </div>
  );
}

function Sparkline({ data, color, theme }) {
  if (!data?.length) return (
    <div style={{
      height: "52px", display: "flex", alignItems: "center", justifyContent: "center",
      border: `1px dashed ${theme.border}`, borderRadius: "8px",
    }}>
      <p style={{ color: theme.textMuted, fontSize: "12px", margin: 0 }}>No data yet</p>
    </div>
  );
  const slice = data.slice(-8);
  const max = Math.max(...slice.map(d => d.score), 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: "5px", height: "52px" }}>
      {slice.map((d, i) => (
        <div key={i} title={`Score: ${d.score}`} style={{
          flex: 1, borderRadius: "4px 4px 0 0",
          background: color, opacity: 0.6 + (i / slice.length) * 0.4,
          height: `${Math.max((d.score / max) * 44, 4)}px`,
          transition: `height ${0.3 + i * 0.05}s ease`,
          cursor: "default",
        }} />
      ))}
    </div>
  );
}

function StatCard({ label, value, sub, color, theme }) {
  return (
    <div style={{
      background: theme.bg,
      border: `1px solid ${theme.border}`,
      borderRadius: "14px", padding: "16px",
      transition: "transform 0.2s, box-shadow 0.2s",
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 8px 24px rgba(0,0,0,0.1)`; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
    >
      <div style={{ fontSize: "22px", fontWeight: 900, color, fontFamily: "monospace", lineHeight: 1, marginBottom: "6px" }}>{value}</div>
      <div style={{ color: theme.textPrimary, fontSize: "12px", fontWeight: 600 }}>{label}</div>
      <div style={{ color: theme.textMuted, fontSize: "11px", marginTop: "2px" }}>{sub}</div>
    </div>
  );
}

function Skel({ w = "100%", h = "14px", r = "6px", theme }) {
  return <div style={{
    width: w, height: h, borderRadius: r,
    background: theme.border,
    animation: "pulse 1.5s ease-in-out infinite",
  }} />;
}

function DashSkeleton({ card, theme }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={card}>
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "20px" }}>
          <Skel w="180px" h="100px" r="12px" theme={theme} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", flex: 1, minWidth: "200px" }}>
            {[1,2,3,4].map(i => <Skel key={i} h="80px" r="12px" theme={theme} />)}
          </div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        {[1,2].map(i => <div key={i} style={card}><Skel h="80px" r="8px" theme={theme} /></div>)}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { theme, isDark } = useTheme();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const card = {
    background: theme.surface,
    border: `1px solid ${theme.border}`,
    borderRadius: "16px",
    padding: "22px 24px",
  };

  function load() {
    setLoading(true); setError("");
    fetch(`${API}/dashboard`, { headers: authHeaders() })
      .then(r => { if (!r.ok) throw new Error(`Status ${r.status}`); return r.json(); })
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }

  useEffect(load, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div style={{ maxWidth: "960px", margin: "0 auto", padding: "36px 28px 80px", fontFamily: "'Inter','Segoe UI', sans-serif" }}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.45}} @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "28px" }}>
        <div>
          <p style={{ color: theme.textMuted, fontSize: "13px", marginBottom: "4px" }}>{greeting} 👋</p>
          <h1 style={{ fontSize: "24px", fontWeight: 800, color: theme.textPrimary, letterSpacing: "-0.5px" }}>
            Placement Readiness
          </h1>
        </div>
        <button onClick={load} style={{
          background: "transparent", color: theme.textSecondary,
          border: `1px solid ${theme.border}`, borderRadius: "8px",
          padding: "7px 16px", fontSize: "12px", cursor: "pointer",
          display: "flex", alignItems: "center", gap: "6px",
          transition: "all 0.2s", fontWeight: 500,
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = theme.primary; e.currentTarget.style.color = theme.primary; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.color = theme.textSecondary; }}
        >↺ Refresh</button>
      </div>

      {loading && <DashSkeleton card={card} theme={theme} />}

      {!loading && error && (
        <div style={{ ...card, textAlign: "center", padding: "60px" }}>
          <div style={{ fontSize: "40px", marginBottom: "16px" }}>⚠️</div>
          <p style={{ color: theme.danger, marginBottom: "16px", fontSize: "14px", fontWeight: 600 }}>{error}</p>
          <p style={{ color: theme.textMuted, fontSize: "13px", marginBottom: "20px" }}>
            Make sure backend is running: <code style={{ color: theme.primary, background: theme.bg, padding: "2px 8px", borderRadius: "4px" }}>uvicorn main:app --reload</code>
          </p>
          <button onClick={load} style={{ padding: "9px 24px", background: theme.primary, color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: 600 }}>
            Retry
          </button>
        </div>
      )}

      {!loading && data && (() => {
        const isEmpty = data.total_resumes === 0 && data.total_interviews === 0;
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

            {/* Hero card */}
            <div style={{
              ...card,
              background: isDark
                ? `linear-gradient(135deg, ${theme.surface}, ${theme.sidebar})`
                : `linear-gradient(135deg, #ffffff, #f0f4ff)`,
              display: "flex", justifyContent: "space-between",
              alignItems: "center", flexWrap: "wrap", gap: "24px",
              boxShadow: isDark ? "0 4px 24px rgba(0,0,0,0.2)" : "0 4px 24px rgba(67,97,238,0.08)",
            }}>
              <Gauge score={data.readiness_score} label={data.readiness_label} theme={theme} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", flex: 1, minWidth: "240px" }}>
                <StatCard label="Resume Score"    value={data.resume_score}          sub={`${data.total_resumes} analyzed`}    color={scoreColor(data.resume_score)}        theme={theme} />
                <StatCard label="Interview Avg"   value={`${data.interview_score}/10`} sub={`${data.total_interviews} sessions`} color={scoreColor(data.interview_score, 10)} theme={theme} />
                <StatCard label="Resumes Done"    value={data.total_resumes}          sub="total submissions"                    color={theme.textSecondary}                  theme={theme} />
                <StatCard label="Interviews Done" value={data.total_interviews}       sub="completed sessions"                   color={theme.textSecondary}                  theme={theme} />
              </div>
            </div>

            {/* Charts */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              {[
                { title: "Resume History",    data: data.resume_history,    color: theme.primary  },
                { title: "Interview History", data: data.interview_history, color: theme.accent1  },
              ].map(({ title, data: d, color }) => (
                <div key={title} style={{
                  ...card,
                  boxShadow: isDark ? "none" : "0 2px 12px rgba(0,0,0,0.06)",
                }}>
                  <div style={{ color: theme.textPrimary, fontSize: "13px", fontWeight: 700, marginBottom: "16px" }}>{title}</div>
                  <Sparkline data={d} color={color} theme={theme} />
                  <div style={{ color: theme.textMuted, fontSize: "11px", marginTop: "10px" }}>score / 100 per submission</div>
                </div>
              ))}
            </div>

            {/* Weaknesses */}
            {!isEmpty && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div style={{ ...card, boxShadow: isDark ? "none" : "0 2px 12px rgba(0,0,0,0.06)" }}>
                  <div style={{ color: theme.textPrimary, fontSize: "13px", fontWeight: 700, marginBottom: "14px" }}>
                    Resume Weaknesses
                  </div>
                  {data.weaknesses.length > 0
                    ? <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                        {data.weaknesses.map((w, i) => (
                          <span key={i} style={{
                            background: isDark ? "#2d0f0f" : "#fff1f1",
                            color: theme.danger,
                            border: `1px solid ${theme.danger}44`,
                            padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 600,
                          }}>{w}</span>
                        ))}
                      </div>
                    : <span style={{ color: theme.success, fontSize: "13px" }}>None detected ✓</span>
                  }
                </div>
                <div style={{ ...card, boxShadow: isDark ? "none" : "0 2px 12px rgba(0,0,0,0.06)" }}>
                  <div style={{ color: theme.textPrimary, fontSize: "13px", fontWeight: 700, marginBottom: "14px" }}>
                    Interview Gaps
                  </div>
                  {data.improvement_areas.length > 0
                    ? <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                        {data.improvement_areas.map((a, i) => (
                          <span key={i} style={{
                            background: isDark ? "#2d1f00" : "#fff8ee",
                            color: theme.warning,
                            border: `1px solid ${theme.warning}44`,
                            padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 600,
                          }}>{a}</span>
                        ))}
                      </div>
                    : <span style={{ color: theme.textMuted, fontSize: "13px" }}>Complete an interview to see gaps</span>
                  }
                </div>
              </div>
            )}

            {/* Suggestions */}
            <div style={{ ...card, boxShadow: isDark ? "none" : "0 2px 12px rgba(0,0,0,0.06)" }}>
              <div style={{ color: theme.textPrimary, fontSize: "14px", fontWeight: 700, marginBottom: "16px" }}>
                What Should You Do Next?
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {data.suggestions.map((s, i) => {
                  const pc = priorityColor(s.priority);
                  return (
                    <div key={i} style={{
                      background: theme.bg,
                      border: `1px solid ${theme.border}`,
                      borderLeft: `3px solid ${pc}`,
                      borderRadius: "10px", padding: "14px 16px",
                      display: "flex", gap: "12px", alignItems: "flex-start",
                      animation: `fadeUp 0.3s ease ${i * 0.06}s both`,
                    }}>
                      <div style={{
                        width: "28px", height: "28px", borderRadius: "8px", flexShrink: 0,
                        background: pc + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px",
                      }}>{s.icon}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "4px", flexWrap: "wrap" }}>
                          <span style={{ color: theme.textSecondary, fontSize: "11px", fontWeight: 700, letterSpacing: "0.5px", textTransform: "uppercase" }}>{s.area}</span>
                          <span style={{ padding: "1px 8px", borderRadius: "20px", fontSize: "9px", fontWeight: 800, color: pc, background: pc + "18", border: `1px solid ${pc}33`, textTransform: "uppercase" }}>{s.priority}</span>
                        </div>
                        <p style={{ color: theme.textSecondary, fontSize: "13px", lineHeight: "1.6", margin: 0 }}>{s.action}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Empty state */}
            {isEmpty && (
              <div style={{ ...card, textAlign: "center", padding: "60px 24px" }}>
                <div style={{ fontSize: "48px", marginBottom: "16px" }}>🚀</div>
                <h3 style={{ color: theme.textPrimary, fontWeight: 700, fontSize: "18px", marginBottom: "10px" }}>Nothing here yet</h3>
                <p style={{ color: theme.textSecondary, fontSize: "14px", marginBottom: "28px", lineHeight: "1.7", maxWidth: "400px", margin: "0 auto 28px" }}>
                  Start by analyzing your resume or completing a mock interview — your readiness score will update automatically.
                </p>
                <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                  <Link to="/resume" style={{
                    background: theme.primary, color: "#fff",
                    textDecoration: "none", padding: "10px 24px", borderRadius: "10px",
                    fontWeight: 600, fontSize: "13px",
                    boxShadow: `0 4px 16px ${theme.primaryGlow}`,
                  }}>
                    Analyze Resume
                  </Link>
                  <Link to="/interview" style={{
                    background: "transparent", color: theme.textSecondary,
                    border: `1px solid ${theme.border}`,
                    textDecoration: "none", padding: "10px 24px", borderRadius: "10px",
                    fontWeight: 600, fontSize: "13px",
                  }}>
                    Start Interview
                  </Link>
                </div>
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
}