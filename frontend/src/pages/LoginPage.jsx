import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { saveAuth } from "../utils/auth";
import { useTheme } from "../context/ThemeContext";

import API from "../utils/config";



export default function LoginPage() {
  const { theme } = useTheme();
  const card = {
    background: theme.surface, border: "1px solid #1a1953",
    borderRadius: "16px", padding: "36px 32px",
  };

  const inputStyle = {
    width: "100%", background: "#0e1240",
    border: "1px solid #1a1953", borderRadius: "10px",
    padding: "12px 16px", color: "#e2e8f0",
    fontSize: "14px", fontFamily: "inherit",
    outline: "none", boxSizing: "border-box",
  };
  const [form, setForm]     = useState({ email: "", password: "" });
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Login failed");
      saveAuth(data.token, data.user);
      navigate("/dashboard");
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", fontFamily: "'Segoe UI', sans-serif" }}>
      <div style={{ width: "100%", maxWidth: "400px" }}>
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div style={{ fontSize: "32px", marginBottom: "8px" }}>🎯</div>
          <h1 style={{ color: theme.textPrimary, fontWeight: 800, fontSize: "24px", margin: "0 0 6px" }}>Welcome back</h1>
          <p style={{ color: theme.textMuted, fontSize: "14px", margin: 0 }}>Sign in to PlacementAI</p>
        </div>

        <div style={card}>
          <form onSubmit={submit}>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ color: theme.textSecondary, fontSize: "12px", fontWeight: 700, letterSpacing: "1px", display: "block", marginBottom: "8px" }}>EMAIL</label>
              <input
                type="email" required style={inputStyle}
                placeholder="you@email.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ color: theme.textSecondary, fontSize: "12px", fontWeight: 700, letterSpacing: "1px", display: "block", marginBottom: "8px" }}>PASSWORD</label>
              <input
                type="password" required style={inputStyle}
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              />
            </div>

            {error && <p style={{ color: "#f87171", fontSize: "13px", marginBottom: "14px", textAlign: "center" }}>{error}</p>}

            <button type="submit" disabled={loading} style={{
              width: "100%", padding: "13px",
              background: loading ? "#1a1953" : "linear-gradient(135deg, #3b82f6, #6366f1)",
              color: loading ? "#334155" : "#fff",
              border: "none", borderRadius: "10px",
              fontSize: "14px", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
            }}>
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <p style={{ color: theme.textMuted, fontSize: "13px", textAlign: "center", marginTop: "20px", marginBottom: 0 }}>
            Don't have an account?{" "}
            <Link to="/register" style={{ color: "#93c5fd", textDecoration: "none", fontWeight: 600 }}>Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
}