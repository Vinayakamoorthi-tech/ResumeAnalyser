import { useState } from "react";
import { useTheme } from "../context/ThemeContext";

const COMPANIES = [
  {
    name: "TCS", type: "Service MNC", difficulty: "Medium",
    topics: ["Aptitude", "Verbal", "Coding", "HR"],
    questions: [
      "Tell me about yourself",
      "What is your greatest strength?",
      "Write a program to reverse a string",
      "What is OOP?",
      "Where do you see yourself in 5 years?",
    ],
    tips: "Focus on aptitude and verbal. TCS NQT has 3 sections — Numerical, Verbal, Reasoning.",
  },
  {
    name: "Infosys", type: "Service MNC", difficulty: "Medium",
    topics: ["Aptitude", "Logical", "Verbal", "Puzzle", "HR"],
    questions: [
      "Why do you want to join Infosys?",
      "What are your technical skills?",
      "Explain DBMS concepts",
      "What is normalization?",
      "Describe a challenging project",
    ],
    tips: "Infosys Springboard prep helps. Focus on puzzles and logical reasoning.",
  },
  {
    name: "Wipro", type: "Service MNC", difficulty: "Easy",
    topics: ["Aptitude", "Written English", "Online Test", "HR"],
    questions: [
      "Tell me about yourself",
      "What is cloud computing?",
      "Explain your final year project",
      "What are your hobbies?",
      "Are you willing to relocate?",
    ],
    tips: "WILP test is straightforward. Be confident in HR round.",
  },
  {
    name: "Zoho", type: "Product Company", difficulty: "Hard",
    topics: ["Coding", "Technical", "System Design", "HR"],
    questions: [
      "Write a program to find duplicate elements in array",
      "Explain OOP principles with examples",
      "What is the difference between process and thread?",
      "Design a simple library management system",
      "How does TCP/IP work?",
    ],
    tips: "Zoho focuses heavily on coding. Practice DSA and write clean code without IDE.",
  },
  {
    name: "Amazon", type: "FAANG", difficulty: "Hard",
    topics: ["DSA", "System Design", "Leadership Principles", "Coding"],
    questions: [
      "Tell me about a time you showed ownership",
      "Implement LRU Cache",
      "Design a URL shortener",
      "What is your biggest failure?",
      "Explain consistent hashing",
    ],
    tips: "Amazon uses Leadership Principles heavily. Use STAR method for every behavioral question.",
  },
  {
    name: "Accenture", type: "Service MNC", difficulty: "Easy",
    topics: ["Aptitude", "Communication", "Coding", "HR"],
    questions: [
      "Why Accenture?",
      "What is agile methodology?",
      "Write a program for fibonacci series",
      "What are your career goals?",
      "Tell me about teamwork experience",
    ],
    tips: "Accenture values communication skills. Be clear and confident in answers.",
  },
];

const CHECKLIST_ITEMS = [
  "Studied core CS subjects (OS, DBMS, Networks)",
  "Practiced aptitude questions",
  "Solved 20+ coding problems",
  "Prepared 'Tell me about yourself'",
  "Done 2+ mock interviews",
  "Researched company background",
  "Prepared questions to ask interviewer",
  "Resume tailored for this company",
];




export default function CompanyTrackerPage() {
  const { theme, isDark } = useTheme();
  const DIFFICULTY_COLOR = {
    Easy:   isDark
      ? { bg: "#052e16", color: "#4ade80", border: "#166534" }
      : { bg: "#dcfce7", color: "#16a34a", border: "#86efac" },
    Medium: isDark
      ? { bg: "#2d1f00", color: "#fbbf24", border: "#92400e" }
      : { bg: "#fef9c3", color: "#b45309", border: "#fde047" },
    Hard:   isDark
      ? { bg: "#2d0f0f", color: "#f87171", border: "#7f1d1d" }
      : { bg: "#fee2e2", color: "#dc2626", border: "#fca5a5" },
  };
  const card = { background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: "16px", padding: "24px" };
  const [selected,   setSelected]   = useState(null);
  const [checklists, setChecklists] = useState({});
  const [search,     setSearch]     = useState("");
  const [filter,     setFilter]     = useState("All");

  const company = selected !== null ? COMPANIES[selected] : null;

  function toggleCheck(companyName, item) {
    setChecklists(prev => {
      const current = prev[companyName] || [];
      const updated = current.includes(item)
        ? current.filter(i => i !== item)
        : [...current, item];
      return { ...prev, [companyName]: updated };
    });
  }

  function getProgress(companyName) {
    const done = (checklists[companyName] || []).length;
    return Math.round((done / CHECKLIST_ITEMS.length) * 100);
  }

  const types = ["All", ...new Set(COMPANIES.map(c => c.type))];

  const filtered = COMPANIES.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "All" || c.type === filter;
    return matchSearch && matchFilter;
  });

  // ── Detail view ────────────────────────────────────────────────────────────
  if (company) {
    const progress = getProgress(company.name);
    const checked  = checklists[company.name] || [];
    const dc       = DIFFICULTY_COLOR[company.difficulty];

    return (
      <div style={{ maxWidth: "780px", margin: "0 auto", padding: "40px 24px 80px", fontFamily: "'Segoe UI', sans-serif" }}>
        <button onClick={() => setSelected(null)} style={{ background: "transparent", color: theme.textMuted, border: `1px solid ${theme.border}`, borderRadius: "8px", padding: "7px 14px", fontSize: "12px", cursor: "pointer", marginBottom: "24px" }}>
          ← Back to Companies
        </button>

        {/* Header */}
        <div style={{ ...card, marginBottom: "16px", background: `linear-gradient(135deg, ${theme.bg}, ${theme.surface})`, border: `1px solid ${theme.border}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <h1 style={{ color: theme.textPrimary, fontWeight: 800, fontSize: "28px", margin: "0 0 6px" }}>{company.name}</h1>
              <div style={{ color: theme.textMuted, fontSize: "13px", marginBottom: "12px" }}>{company.type}</div>
              <span style={{ background: dc.bg, color: dc.color, border: `1px solid ${dc.border}`, padding: "3px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 600 }}>
                {company.difficulty}
              </span>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ color: theme.textPrimary, fontSize: "32px", fontWeight: 900, fontFamily: "monospace" }}>{progress}%</div>
              <div style={{ color: theme.textMuted, fontSize: "12px" }}>Prepared</div>
              <div style={{ width: "120px", height: "6px", background: theme.border, borderRadius: "6px", marginTop: "8px", overflow: "hidden" }}>
                <div style={{ height: "100%", background: progress >= 70 ? "#22c55e" : progress >= 40 ? "#f59e0b" : "#ef4444", width: `${progress}%`, transition: "width 0.5s ease", borderRadius: "6px" }} />
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
          {/* Topics */}
          <div style={card}>
            <h3 style={{ color: theme.textPrimary, fontSize: "14px", fontWeight: 700, marginBottom: "14px" }}>📚 Topics to Cover</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {company.topics.map((t, i) => (
                <span key={i} style={{ background: theme.primaryGlow, color: theme.primary, border: `1px solid ${theme.primary}33`, padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 600 }}>{t}</span>
              ))}
            </div>
          </div>

          {/* Tip */}
          <div style={{ ...card, background: "#2d1f00", border: "1px solid #92400e" }}>
            <h3 style={{ color: "#fbbf24", fontSize: "14px", fontWeight: 700, marginBottom: "10px" }}>💡 Insider Tip</h3>
            <p style={{ color: "#92400e", fontSize: "13px", lineHeight: "1.7", margin: 0 }}>{company.tips}</p>
          </div>
        </div>

        {/* Past Questions */}
        <div style={{ ...card, marginBottom: "16px" }}>
          <h3 style={{ color: theme.textPrimary, fontSize: "14px", fontWeight: 700, marginBottom: "14px" }}>🎯 Past Interview Questions</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {company.questions.map((q, i) => (
              <div key={i} style={{ display: "flex", gap: "12px", padding: "12px 14px", background: theme.bg, borderRadius: "10px", border: `1px solid ${theme.border}` }}>
                <span style={{ color: "#6366f1", fontWeight: 700, flexShrink: 0 }}>Q{i + 1}.</span>
                <span style={{ color: theme.textSecondary, fontSize: "13.5px", lineHeight: "1.6" }}>{q}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Checklist */}
        <div style={card}>
          <h3 style={{ color: theme.textPrimary, fontSize: "14px", fontWeight: 700, marginBottom: "14px" }}>
            ✅ Preparation Checklist
            <span style={{ color: theme.textMuted, fontWeight: 400, fontSize: "12px", marginLeft: "10px" }}>{checked.length}/{CHECKLIST_ITEMS.length} done</span>
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {CHECKLIST_ITEMS.map((item, i) => {
              const done = checked.includes(item);
              return (
                <div key={i} onClick={() => toggleCheck(company.name, item)} style={{
                  display: "flex", gap: "12px", alignItems: "center",
                  padding: "12px 14px", borderRadius: "10px", cursor: "pointer",
                  background: done ? (isDark ? "#052e16" : "#dcfce7") : theme.input,
                  border: `1px solid ${done ? (isDark ? "#166534" : "#86efac") : theme.border}`,
                  transition: "all 0.2s",
                }}>
                  <div style={{
                    width: "18px", height: "18px", borderRadius: "5px", flexShrink: 0,
                    background: done ? "#22c55e" : "transparent",
                    border: `2px solid ${done ? "#22c55e" : "#334155"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "11px", color: "#fff",
                  }}>{done ? "✓" : ""}</div>
                  <span style={{ color: done ? (isDark ? "#4ade80" : "#16a34a") : theme.textSecondary, fontSize: "13px", textDecoration: done ? "line-through" : "none" }}>{item}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ── List view ──────────────────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "40px 24px 80px", fontFamily: "'Segoe UI', sans-serif" }}>

      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <div style={{ display: "inline-block", background: theme.surface, color: theme.primary, border: `1px solid ${theme.border}`, padding: "3px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: 700, letterSpacing: "2px", marginBottom: "10px" }}>COMPANY TRACKER</div>
        <h1 style={{ fontSize: "26px", fontWeight: 800, color: theme.textPrimary, marginBottom: "8px" }}>Company Preparation Tracker</h1>
        <p style={{ color: theme.textSecondary, fontSize: "14px" }}>Track your prep for each company — past questions, topics, and checklist.</p>
      </div>

      {/* Search + Filter */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "24px", flexWrap: "wrap" }}>
        <input
          placeholder="Search company…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: "160px", background: theme.input, border: `1px solid ${theme.border}`, borderRadius: "10px", padding: "10px 16px", color: theme.textPrimary, fontSize: "13px", outline: "none" }}        />
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {types.map(t => (
            <button key={t} onClick={() => setFilter(t)} style={{
              padding: "8px 14px", borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "12px", fontWeight: 600,
              background: filter === t ? "linear-gradient(135deg,#3b82f6,#6366f1)" : theme.surface,
              color: filter === t ? "#fff" : theme.textSecondary,
              border: filter === t ? "none" : `1px solid ${theme.border}`,
            }}>{t}</button>
          ))}
        </div>
      </div>

      {/* Company Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px" }}>
        {filtered.map((c, i) => {
          const progress = getProgress(c.name);
          const dc = DIFFICULTY_COLOR[c.difficulty];
          const idx = COMPANIES.indexOf(c);
          return (
            <div key={c.name} onClick={() => setSelected(idx)} style={{
              ...card, cursor: "pointer", transition: "border-color 0.2s, transform 0.2s",
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#3b82f6"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                <div>
                  <div style={{ color: theme.textPrimary, fontWeight: 700, fontSize: "16px", marginBottom: "4px" }}>{c.name}</div>
                  <div style={{ color: theme.textMuted, fontSize: "12px" }}>{c.type}</div>
                </div>
                <span style={{ background: dc.bg, color: dc.color, border: `1px solid ${dc.border}`, padding: "2px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 600 }}>
                  {c.difficulty}
                </span>
              </div>

              {/* Topics */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "16px" }}>
                {c.topics.slice(0, 3).map((t, j) => (
                  <span key={j} style={{ background: theme.primaryGlow, color: theme.primary, border: `1px solid ${theme.primary}33`, padding: "2px 10px", borderRadius: "20px", fontSize: "11px" }}>{t}</span>
                ))}
                {c.topics.length > 3 && <span style={{ color: theme.textMuted, fontSize: "11px", padding: "2px 6px" }}>+{c.topics.length - 3} more</span>}
              </div>

              {/* Progress */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <span style={{ color: theme.textMuted, fontSize: "11px" }}>Preparation</span>
                <span style={{ color: progress >= 70 ? "#22c55e" : progress >= 40 ? "#f59e0b" : "#475569", fontSize: "11px", fontWeight: 700 }}>{progress}%</span>
              </div>
              <div style={{ height: "4px", background: theme.border, borderRadius: "4px", overflow: "hidden" }}>
                <div style={{ height: "100%", background: progress >= 70 ? "#22c55e" : progress >= 40 ? "#f59e0b" : "#334155", width: `${progress}%`, transition: "width 0.5s ease", borderRadius: "4px" }} />
              </div>

              <div style={{ color: theme.textMuted, fontSize: "11px", marginTop: "10px" }}>
                {c.questions.length} past questions · Click to prepare →
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}