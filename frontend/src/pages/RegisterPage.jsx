import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { saveAuth } from "../utils/auth";
import { useTheme } from "../context/ThemeContext";
import API from "../utils/config";

export default function RegisterPage() {
  const { theme, isDark } = useTheme();
  const [form, setForm]       = useState({ name: "", email: "", password: "" });
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();
    if (form.password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Registration failed");
      saveAuth(data.token, data.user);
      navigate("/dashboard");
    } catch (e) { setError(e.message); }
    setLoading(false);
  }

  const inputStyle = {
    width: "100%",
    background: isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.6)",
    border: `1px solid ${theme.glassBorder}`,
    borderRadius: "10px", padding: "12px 16px",
    color: theme.textPrimary, fontSize: "14px",
    fontFamily: "inherit", outline: "none", boxSizing: "border-box",
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: isDark
        ? "radial-gradient(ellipse at 30% 30%, #1a1040, #0a0a0f)"
        : "radial-gradient(ellipse at 30% 30%, #dde4ff, #eef0f7)",
      display: "flex", alignItems: "center",
      justifyContent: "center", padding: "24px",
      fontFamily: "'Inter','Segoe UI', sans-serif",
    }}>
      <div style={{ position: "fixed", top: "-20%", left: "-10%", width: "60vw", height: "60vw", background: isDark ? "radial-gradient(circle, rgba(91,138,240,0.15) 0%, transparent 70%)" : "radial-gradient(circle, rgba(67,97,238,0.12) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", bottom: "-20%", right: "-10%", width: "50vw", height: "50vw", background: isDark ? "radial-gradient(circle, rgba(167,139,250,0.12) 0%, transparent 70%)" : "radial-gradient(circle, rgba(114,9,183,0.08) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none", zIndex: 0 }} />

      <div style={{ width: "100%", maxWidth: "400px", position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div style={{
            width: "56px", height: "56px", borderRadius: "16px", margin: "0 auto 16px",
            background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent1})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "24px", boxShadow: `0 8px 32px ${theme.primaryGlow}`,
          }}>🚀</div>
          <h1 style={{ color: theme.textPrimary, fontWeight: 800, fontSize: "24px", margin: "0 0 6px" }}>Create account</h1>
          <p style={{ color: theme.textMuted, fontSize: "14px", margin: 0 }}>Start your placement prep today</p>
        </div>

        <div style={{
          background: theme.glass,
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: `1px solid ${theme.glassBorder}`,
          borderRadius: "24px", padding: "36px 32px",
          boxShadow: isDark
            ? "0 24px 48px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)"
            : "0 24px 48px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.9)",
          position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: theme.glassHighlight }} />

          <form onSubmit={submit}>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ color: theme.textMuted, fontSize: "11px", fontWeight: 700, letterSpacing: "1px", display: "block", marginBottom: "8px" }}>FULL NAME</label>
              <input type="text" required style={inputStyle} placeholder="John Doe" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ color: theme.textMuted, fontSize: "11px", fontWeight: 700, letterSpacing: "1px", display: "block", marginBottom: "8px" }}>EMAIL</label>
              <input type="email" required style={inputStyle} placeholder="you@email.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div style={{ marginBottom: "20px" }}>
              <label style={{ color: theme.textMuted, fontSize: "11px", fontWeight: 700, letterSpacing: "1px", display: "block", marginBottom: "8px" }}>PASSWORD</label>
              <input type="password" required style={inputStyle} placeholder="Min 6 characters" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
            </div>

            {error && (
              <div style={{ background: isDark ? "rgba(239,68,68,0.1)" : "#fff1f2", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "8px", padding: "10px 14px", marginBottom: "14px" }}>
                <p style={{ color: theme.danger, fontSize: "13px", margin: 0 }}>{error}</p>
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              width: "100%", padding: "13px",
              background: loading ? theme.border : `linear-gradient(135deg, ${theme.primary}, ${theme.accent1})`,
              color: loading ? theme.textMuted : "#fff",
              border: "none", borderRadius: "12px",
              fontSize: "14px", fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: loading ? "none" : `0 4px 20px ${theme.primaryGlow}`,
              transition: "all 0.2s",
            }}>
              {loading ? "Creating account…" : "Create Account"}
            </button>
          </form>

          <p style={{ color: theme.textMuted, fontSize: "13px", textAlign: "center", marginTop: "20px", marginBottom: 0 }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: theme.primary, textDecoration: "none", fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}