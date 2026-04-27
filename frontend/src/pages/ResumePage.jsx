import { useState } from "react";
import { authHeaders } from "../utils/auth";
import jsPDF from "jspdf";
import { useTheme } from "../context/ThemeContext";
import { useNotifications } from "../context/NotificationContext";

const API = "http://127.0.0.1:8000";

function ScoreRing({ score, size = 120, label = "Resume quality score", theme }) {
  const r    = 52;
  const circ = 2 * Math.PI * r;
  const fill = ((score || 0) / 100) * circ;
  const color = score >= 70 ? "#22c55e" : score >= 40 ? "#f59e0b" : "#ef4444";
  const text  = score >= 70 ? "Strong" : score >= 40 ? "Average" : "Needs Work";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
      <svg width={size} height={size} viewBox="0 0 120 120" style={{ flexShrink: 0 }}>
        <circle cx="60" cy="60" r={r} fill="none" stroke={theme.border} strokeWidth="9" />
        <circle cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="9"
          strokeDasharray={`${fill} ${circ}`} strokeLinecap="round"
          transform="rotate(-90 60 60)"
          style={{ transition: "stroke-dasharray 1s cubic-bezier(.4,0,.2,1)" }}
        />
        <text x="60" y="55" textAnchor="middle" fill={color} fontSize="24" fontWeight="800" fontFamily="monospace">{score}</text>
        <text x="60" y="72" textAnchor="middle" fill={theme.textMuted} fontSize="11" fontFamily="sans-serif">/ 100</text>
      </svg>
      <div>
        <div style={{ color, fontSize: "20px", fontWeight: 700, marginBottom: "4px" }}>{text}</div>
        <div style={{ color: theme.textSecondary, fontSize: "13px" }}>{label}</div>
      </div>
    </div>
  );
}

function Tag({ text, type, isDark }) {
  const styles = {
    green:  { bg: isDark ? "#052e16" : "#f0fdf4", color: "#22c55e", border: isDark ? "#166534" : "#86efac" },
    red:    { bg: isDark ? "#2d0f0f" : "#fff1f2", color: "#ef4444", border: isDark ? "#7f1d1d" : "#fca5a5" },
    blue:   { bg: isDark ? "#0c1d3a" : "#eff6ff", color: "#3b82f6", border: isDark ? "#1e3a5f" : "#93c5fd" },
    yellow: { bg: isDark ? "#2d1f00" : "#fffbeb", color: "#f59e0b", border: isDark ? "#92400e" : "#fcd34d" },
  };
  const s = styles[type] || styles.blue;
  return (
    <span style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}`, padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 600, display: "inline-block" }}>
      {text}
    </span>
  );
}

export default function ResumePage() {
  const { theme, isDark } = useTheme();
  const [tab, setTab]               = useState("analyze");
  const [resume, setResume]         = useState("");
  const [jd, setJd]                 = useState("");
  const [result, setResult]         = useState(null);
  const [matchResult, setMatchResult] = useState(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [coverLoading, setCoverLoading] = useState(false);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");
  const { addNotification } = useNotifications();

  const card = {
    background: theme.surface,
    border: `1px solid ${theme.border}`,
    borderRadius: "16px",
    padding: "24px",
    boxShadow: isDark ? "none" : "0 2px 12px rgba(0,0,0,0.06)",
  };

  const textareaStyle = {
    width: "100%", minHeight: "180px",
    background: theme.input,
    border: `1px solid ${theme.border}`,
    borderRadius: "10px", padding: "14px 16px",
    color: theme.textPrimary, fontSize: "13.5px",
    resize: "vertical", fontFamily: "inherit", lineHeight: "1.65",
    transition: "border-color 0.2s, box-shadow 0.2s",
  };

  const btnStyle = (disabled) => ({
    width: "100%", marginTop: "16px", padding: "13px",
    background: disabled ? theme.border : `linear-gradient(135deg, ${theme.primary}, ${theme.accent1})`,
    color: disabled ? theme.textMuted : "#fff",
    border: "none", borderRadius: "10px",
    fontSize: "14px", fontWeight: 700,
    cursor: disabled ? "not-allowed" : "pointer",
    transition: "all 0.2s",
    boxShadow: disabled ? "none" : `0 4px 16px ${theme.primaryGlow}`,
  });

  async function analyze() {
    if (resume.trim().length < 50) { setError("Please paste more resume content (at least 50 characters)."); return; }
    setLoading(true); setError(""); setResult(null);
    try {
      const res = await fetch(`${API}/resume/analyze`, { method: "POST", headers: authHeaders(), body: JSON.stringify({ content: resume }) });
      if (!res.ok) throw new Error((await res.json()).detail || `Error ${res.status}`);
      const data = await res.json();
        setResult(data);
        addNotification({
          type: "achievement",
          icon: "📄",
          title: "Resume Analyzed!",
          message: `Your resume scored ${data.score}/100. Review the feedback below.`,
          color: "#3b82f6",
        });
    } catch (e) { setError(e.message); }
    setLoading(false);
  }

  async function matchJD() {
    if (resume.trim().length < 50) { setError("Please paste your resume first."); return; }
    if (jd.trim().length < 50)     { setError("Please paste the job description (at least 50 characters)."); return; }
    setLoading(true); setError(""); setMatchResult(null);
    try {
      const res = await fetch(`${API}/resume/match`, { method: "POST", headers: authHeaders(), body: JSON.stringify({ resume, jd }) });
      if (!res.ok) throw new Error((await res.json()).detail || `Error ${res.status}`);
      setMatchResult(await res.json());
    } catch (e) { setError(e.message); }
    setLoading(false);
  }

  async function generateCover() {
    if (resume.trim().length < 50) { setError("Please paste your resume first."); return; }
    if (jd.trim().length < 50)     { setError("Please paste the job description first."); return; }
    setCoverLoading(true); setError(""); setCoverLetter("");
    try {
      const res = await fetch(`${API}/resume/cover-letter`, { method: "POST", headers: authHeaders(), body: JSON.stringify({ resume, jd }) });
      if (!res.ok) throw new Error((await res.json()).detail || `Error ${res.status}`);
      const data = await res.json();
      setCoverLetter(data.cover_letter);
    } catch (e) { setError(e.message); }
    setCoverLoading(false);
  }

  function downloadCoverLetterPDF() {
    const doc = new jsPDF();
    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const maxWidth = pageWidth - margin * 2;
    doc.setFontSize(18); doc.setTextColor(30, 41, 59);
    doc.text("Cover Letter", margin, 25);
    doc.setFontSize(11); doc.setTextColor(71, 85, 105);
    doc.text(`Generated by PlacementAI · ${new Date().toLocaleDateString()}`, margin, 33);
    doc.setDrawColor(30, 41, 59);
    doc.line(margin, 37, pageWidth - margin, 37);
    doc.setFontSize(11); doc.setTextColor(15, 23, 42);
    const lines = doc.splitTextToSize(coverLetter, maxWidth);
    doc.text(lines, margin, 48);
    doc.save("cover_letter.pdf");
  }

  function downloadAnalysisPDF() {
    if (!result) return;
    const doc = new jsPDF();
    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const maxWidth = pageWidth - margin * 2;
    let y = 25;
    doc.setFontSize(18); doc.setTextColor(30, 41, 59);
    doc.text("Resume Analysis Report", margin, y); y += 10;
    doc.setFontSize(11); doc.setTextColor(71, 85, 105);
    doc.text(`Generated by PlacementAI · ${new Date().toLocaleDateString()}`, margin, y); y += 8;
    doc.setDrawColor(30, 41, 59);
    doc.line(margin, y, pageWidth - margin, y); y += 10;
    doc.setFontSize(14); doc.setTextColor(15, 23, 42);
    doc.text(`Resume Score: ${result.score}/100`, margin, y); y += 10;
    doc.setFontSize(13); doc.setTextColor(30, 41, 59);
    doc.text("AI Feedback:", margin, y); y += 7;
    doc.setFontSize(11); doc.setTextColor(51, 65, 85);
    result.feedback?.forEach(f => {
      const lines = doc.splitTextToSize(`• ${f}`, maxWidth);
      doc.text(lines, margin, y); y += lines.length * 6 + 2;
      if (y > 270) { doc.addPage(); y = 20; }
    });
    y += 4;
    doc.setFontSize(13); doc.setTextColor(30, 41, 59);
    doc.text("Keywords Found:", margin, y); y += 7;
    doc.setFontSize(11); doc.setTextColor(51, 65, 85);
    const kwLines = doc.splitTextToSize(result.keywords?.join(", ") || "None", maxWidth);
    doc.text(kwLines, margin, y); y += kwLines.length * 6 + 6;
    doc.setFontSize(13); doc.setTextColor(30, 41, 59);
    doc.text("Weaknesses:", margin, y); y += 7;
    doc.setFontSize(11); doc.setTextColor(51, 65, 85);
    result.weaknesses?.forEach(w => {
      const lines = doc.splitTextToSize(`• ${w}`, maxWidth);
      doc.text(lines, margin, y); y += lines.length * 6 + 2;
      if (y > 270) { doc.addPage(); y = 20; }
    });
    doc.save("resume_analysis.pdf");
  }

  const actionBtn = (onClick, label, color = theme.primary) => ({
    style: {
      background: isDark ? theme.input : "#f8f9fc",
      color: color, border: `1px solid ${color}44`,
      borderRadius: "8px", padding: "7px 16px",
      fontSize: "12px", fontWeight: 600, cursor: "pointer",
      transition: "all 0.2s",
    },
    onClick,
  });

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "36px 28px 80px", fontFamily: "'Inter','Segoe UI', sans-serif" }}>

      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <div style={{ display: "inline-block", background: theme.primaryGlow, color: theme.primary, border: `1px solid ${theme.primary}33`, padding: "3px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: 700, letterSpacing: "2px", marginBottom: "10px" }}>
          RESUME TOOLS
        </div>
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: theme.textPrimary, marginBottom: "6px", letterSpacing: "-0.5px" }}>
          AI Resume Analyzer
        </h1>
        <p style={{ color: theme.textSecondary, fontSize: "14px" }}>
          Score your resume, match it against a job description, or generate a cover letter.
        </p>
      </div>

      {/* Tab switcher */}
      <div style={{
        display: "flex", gap: "6px", marginBottom: "20px",
        background: theme.surface, border: `1px solid ${theme.border}`,
        borderRadius: "12px", padding: "5px",
        boxShadow: isDark ? "none" : "0 2px 8px rgba(0,0,0,0.05)",
      }}>
        {[
          ["analyze", "⚡ Analyze"],
          ["match",   "🎯 JD Match"],
          ["cover",   "✉️ Cover Letter"],
        ].map(([key, label]) => (
          <button key={key} onClick={() => { setTab(key); setError(""); }} style={{
            flex: 1, padding: "9px 12px", borderRadius: "8px", border: "none", cursor: "pointer",
            fontWeight: 600, fontSize: "13px", transition: "all 0.2s",
            background: tab === key
              ? `linear-gradient(135deg, ${theme.primary}, ${theme.accent1})`
              : "transparent",
            color: tab === key ? "#fff" : theme.textMuted,
            boxShadow: tab === key ? `0 2px 8px ${theme.primaryGlow}` : "none",
          }}>{label}</button>
        ))}
      </div>

      {/* Resume textarea */}
      <div style={{ ...card, marginBottom: "14px" }}>
        <label style={{ color: theme.textMuted, fontSize: "11px", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", display: "block", marginBottom: "10px" }}>
          Your Resume
        </label>
        <textarea
          style={textareaStyle}
          placeholder="Paste your full resume here — work experience, skills, education, projects…"
          value={resume}
          onChange={e => { setResume(e.target.value); setError(""); }}
        />
        <div style={{ color: theme.textMuted, fontSize: "11px", marginTop: "6px", textAlign: "right" }}>
          {resume.trim() ? resume.trim().split(/\s+/).length : 0} words
        </div>
      </div>

      {/* JD textarea */}
      {(tab === "match" || tab === "cover") && (
        <div style={{ ...card, marginBottom: "14px" }}>
          <label style={{ color: theme.textMuted, fontSize: "11px", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", display: "block", marginBottom: "10px" }}>
            Job Description
          </label>
          <textarea
            style={{ ...textareaStyle, minHeight: "140px" }}
            placeholder="Paste the job description here…"
            value={jd}
            onChange={e => { setJd(e.target.value); setError(""); }}
          />
        </div>
      )}

      {error && (
        <div style={{ background: isDark ? "#2d0f0f" : "#fff1f2", border: `1px solid ${theme.danger}44`, borderRadius: "10px", padding: "10px 16px", marginBottom: "12px" }}>
          <p style={{ color: theme.danger, fontSize: "13px", margin: 0, fontWeight: 500 }}>{error}</p>
        </div>
      )}

      <button
        onClick={tab === "analyze" ? analyze : tab === "match" ? matchJD : generateCover}
        disabled={loading || coverLoading}
        style={btnStyle(loading || coverLoading)}
      >
        {loading || coverLoading ? "Generating…"
          : tab === "analyze" ? "⚡ Analyze Resume"
          : tab === "match"   ? "🎯 Match Against JD"
          : "✉️ Generate Cover Letter"}
      </button>

      {/* ── Analyze Results ── */}
      {!loading && result && tab === "analyze" && (
        <div style={{ marginTop: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>

          {/* Score card */}
          <div style={{
            ...card,
            display: "flex", justifyContent: "space-between",
            alignItems: "center", flexWrap: "wrap", gap: "20px",
            background: isDark ? `linear-gradient(135deg, ${theme.surface}, ${theme.sidebar})` : "linear-gradient(135deg, #ffffff, #f0f4ff)",
          }}>
            <ScoreRing score={result.score} theme={theme} />
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {[
                ["Keywords",   result.keywords?.length || 0,  theme.primary],
                ["Feedback",   result.feedback?.length || 0,  theme.warning],
                ["Weaknesses", result.weaknesses?.length || 0, theme.danger],
              ].map(([label, val, color]) => (
                <div key={label} style={{
                  background: theme.bg, border: `1px solid ${theme.border}`,
                  borderRadius: "12px", padding: "14px 18px", textAlign: "center",
                  minWidth: "80px",
                }}>
                  <div style={{ fontSize: "24px", fontWeight: 800, color, fontFamily: "monospace" }}>{val}</div>
                  <div style={{ color: theme.textMuted, fontSize: "11px", marginTop: "3px" }}>{label}</div>
                </div>
              ))}
            </div>
            <button onClick={downloadAnalysisPDF} style={{
              background: theme.primaryGlow, color: theme.primary,
              border: `1px solid ${theme.primary}33`, borderRadius: "8px",
              padding: "8px 16px", fontSize: "12px", fontWeight: 600, cursor: "pointer",
              alignSelf: "flex-start",
            }}>📥 Download PDF</button>
          </div>

          {/* Feedback */}
          <div style={card}>
            <h3 style={{ color: theme.textPrimary, fontSize: "14px", fontWeight: 700, marginBottom: "14px" }}>AI Feedback</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {(Array.isArray(result.feedback) ? result.feedback : [result.feedback]).map((f, i) => (
                <div key={i} style={{
                  display: "flex", gap: "12px", padding: "12px 14px",
                  background: theme.bg, borderRadius: "10px",
                  border: `1px solid ${theme.border}`,
                }}>
                  <span style={{ color: theme.primary, flexShrink: 0, fontWeight: 700 }}>→</span>
                  <span style={{ color: theme.textSecondary, fontSize: "13.5px", lineHeight: "1.6" }}>{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Keywords + Weaknesses */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div style={card}>
              <h3 style={{ color: theme.textPrimary, fontSize: "14px", fontWeight: 700, marginBottom: "14px" }}>Keywords Found</h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {result.keywords?.length > 0
                  ? result.keywords.map((k, i) => <Tag key={i} text={k} type="green" isDark={isDark} />)
                  : <span style={{ color: theme.textMuted, fontSize: "13px" }}>None detected</span>}
              </div>
            </div>
            <div style={card}>
              <h3 style={{ color: theme.textPrimary, fontSize: "14px", fontWeight: 700, marginBottom: "14px" }}>Weaknesses</h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {result.weaknesses?.length > 0
                  ? result.weaknesses.map((w, i) => <Tag key={i} text={w} type="red" isDark={isDark} />)
                  : <span style={{ color: theme.success, fontSize: "13px" }}>No major weaknesses ✓</span>}
              </div>
            </div>
          </div>

          {/* CTA */}
          <div style={{
            ...card,
            background: isDark ? `linear-gradient(135deg, ${theme.surface}, ${theme.sidebar})` : "linear-gradient(135deg, #f0f4ff, #ffffff)",
            border: `1px solid ${theme.primary}33`,
            display: "flex", justifyContent: "space-between",
            alignItems: "center", flexWrap: "wrap", gap: "16px",
          }}>
            <div>
              <div style={{ color: theme.primary, fontWeight: 700, fontSize: "14px", marginBottom: "4px" }}>Ready to practice your interview?</div>
              <div style={{ color: theme.textMuted, fontSize: "13px" }}>AI will ask adaptive questions based on your profile.</div>
            </div>
            <a href="/interview" style={{
              background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent1})`,
              color: "#fff", textDecoration: "none",
              padding: "10px 22px", borderRadius: "9px",
              fontWeight: 700, fontSize: "13px", whiteSpace: "nowrap",
              boxShadow: `0 4px 12px ${theme.primaryGlow}`,
            }}>
              Start Interview →
            </a>
          </div>
        </div>
      )}

      {/* ── JD Match Results ── */}
      {!loading && matchResult && tab === "match" && (
        <div style={{ marginTop: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{
            ...card,
            display: "flex", justifyContent: "space-between",
            alignItems: "center", flexWrap: "wrap", gap: "20px",
            background: isDark ? `linear-gradient(135deg, ${theme.surface}, ${theme.sidebar})` : "linear-gradient(135deg, #ffffff, #f0f4ff)",
          }}>
            <ScoreRing score={matchResult.match_score} label="JD match score" theme={theme} />
            <div style={{
              color: theme.textSecondary, fontSize: "13px",
              maxWidth: "260px", lineHeight: "1.7",
              padding: "12px 16px", borderRadius: "10px",
              background: theme.bg, border: `1px solid ${theme.border}`,
            }}>
              {matchResult.match_score >= 70
                ? "✅ Strong match! Your resume aligns well with this job."
                : matchResult.match_score >= 40
                ? "⚠️ Moderate match. Add missing keywords to improve ATS score."
                : "❌ Low match. Significant gaps between your resume and this JD."}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div style={card}>
              <h3 style={{ color: theme.textPrimary, fontSize: "14px", fontWeight: 700, marginBottom: "14px" }}>Matched Keywords</h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {matchResult.matched_keywords?.length > 0
                  ? matchResult.matched_keywords.map((k, i) => <Tag key={i} text={k} type="green" isDark={isDark} />)
                  : <span style={{ color: theme.textMuted, fontSize: "13px" }}>None matched</span>}
              </div>
            </div>
            <div style={card}>
              <h3 style={{ color: theme.textPrimary, fontSize: "14px", fontWeight: 700, marginBottom: "14px" }}>Missing Keywords</h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {matchResult.missing_keywords?.length > 0
                  ? matchResult.missing_keywords.map((k, i) => <Tag key={i} text={k} type="red" isDark={isDark} />)
                  : <span style={{ color: theme.success, fontSize: "13px" }}>No gaps found ✓</span>}
              </div>
            </div>
          </div>

          <div style={card}>
            <h3 style={{ color: theme.textPrimary, fontSize: "14px", fontWeight: 700, marginBottom: "14px" }}>How to Improve Your Match</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {matchResult.suggestions?.map((s, i) => (
                <div key={i} style={{ display: "flex", gap: "12px", padding: "12px 14px", background: theme.bg, borderRadius: "10px", border: `1px solid ${theme.border}` }}>
                  <span style={{ color: theme.warning, flexShrink: 0, fontWeight: 700 }}>→</span>
                  <span style={{ color: theme.textSecondary, fontSize: "13.5px", lineHeight: "1.6" }}>{s}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Cover Letter ── */}
      {!coverLoading && coverLetter && tab === "cover" && (
        <div style={{ marginTop: "24px" }}>
          <div style={card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ color: theme.textPrimary, fontSize: "14px", fontWeight: 700, margin: 0 }}>Your Cover Letter</h3>
              <div style={{ display: "flex", gap: "8px" }}>
                <button onClick={() => navigator.clipboard.writeText(coverLetter)} style={{
                  background: theme.bg, color: theme.primary,
                  border: `1px solid ${theme.primary}44`, borderRadius: "8px",
                  padding: "6px 14px", fontSize: "12px", fontWeight: 600, cursor: "pointer",
                }}>📋 Copy</button>
                <button onClick={downloadCoverLetterPDF} style={{
                  background: theme.bg, color: theme.success,
                  border: `1px solid ${theme.success}44`, borderRadius: "8px",
                  padding: "6px 14px", fontSize: "12px", fontWeight: 600, cursor: "pointer",
                }}>📥 Download PDF</button>
              </div>
            </div>

            <div style={{ background: theme.bg, border: `1px solid ${theme.border}`, borderRadius: "12px", padding: "20px 22px" }}>
              <pre style={{ color: theme.textPrimary, fontSize: "13.5px", lineHeight: "1.8", whiteSpace: "pre-wrap", fontFamily: "inherit", margin: 0 }}>
                {coverLetter}
              </pre>
            </div>

            <div style={{
              marginTop: "14px", borderRadius: "10px", padding: "12px 16px",
              background: isDark ? "#2d1f00" : "#fffbeb",
              border: `1px solid ${theme.warning}44`,
            }}>
              <div style={{ color: theme.warning, fontSize: "12px", fontWeight: 600, marginBottom: "4px" }}>⚠️ Important</div>
              <div style={{ color: isDark ? "#92400e" : "#78350f", fontSize: "12px", lineHeight: "1.6" }}>
                This is an AI-generated draft. Review and personalise it before sending — add specific achievements, tweak the tone, and make it sound like you.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}