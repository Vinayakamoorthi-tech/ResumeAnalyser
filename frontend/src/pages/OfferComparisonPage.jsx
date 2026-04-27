import { useState } from "react";
import { useTheme } from "../context/ThemeContext";





const EMPTY_OFFER = {
  company: "", role: "", ctc: "", location: "",
  bond: "", workMode: "Hybrid", type: "Full-time", perks: "",
};

function ScoreBar({ label, value, max, color, theme }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div style={{ marginBottom: "10px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
        <span style={{ color: theme.textMuted, fontSize: "11px" }}>{label}</span>
        <span style={{ color, fontSize: "11px", fontWeight: 700 }}>{value}/{max}</span>
      </div>
      <div style={{ height: "4px", background: theme.border, borderRadius: "4px", overflow: "hidden" }}>
        <div style={{ height: "100%", background: color, width: `${pct}%`, borderRadius: "4px", transition: "width 0.6s ease" }} />
      </div>
    </div>
  );
}

function scoreOffer(offer) {
  let score = 0;
  const ctc = parseFloat(offer.ctc) || 0;

  // CTC score (0-40)
  if (ctc >= 10) score += 40;
  else if (ctc >= 7) score += 32;
  else if (ctc >= 5) score += 24;
  else if (ctc >= 3) score += 16;
  else score += 8;

  // Bond penalty (0-15)
  const bond = parseFloat(offer.bond) || 0;
  if (bond === 0) score += 15;
  else if (bond <= 1) score += 10;
  else if (bond <= 2) score += 5;

  // Work mode (0-20)
  if (offer.workMode === "Remote")  score += 20;
  if (offer.workMode === "Hybrid")  score += 15;
  if (offer.workMode === "On-site") score += 10;

  // Type (0-15)
  if (offer.type === "Full-time")   score += 15;
  if (offer.type === "Contract")    score += 8;
  if (offer.type === "Internship")  score += 5;

  // Perks (0-10)
  if (offer.perks?.length > 20) score += 10;
  else if (offer.perks?.length > 0) score += 5;

  return Math.min(score, 100);
}

function getVerdict(offers, scores) {
  if (offers.length === 0) return null;
  const best = scores.indexOf(Math.max(...scores));
  const o = offers[best];
  const ctc = parseFloat(o.ctc) || 0;
  const bond = parseFloat(o.bond) || 0;

  let reason = "";
  if (ctc >= 8) reason = "highest CTC";
  else if (bond === 0) reason = "no bond clause";
  else if (o.workMode === "Remote") reason = "remote flexibility";
  else reason = "best overall package";

  return { index: best, name: o.company || `Offer ${best + 1}`, reason };
}

export default function OfferComparisonPage() {
  const { theme } = useTheme();
  const card = { background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: "16px", padding: "24px" }; 
  const inputStyle = {
    width: "100%", background: theme.bg, border: `1px solid ${theme.border}`,
    borderRadius: "10px", padding: "10px 14px", color: "#e2e8f0",
    fontSize: "13px", fontFamily: "inherit", outline: "none",
    boxSizing: "border-box",
  };
  const [offers, setOffers]   = useState([{ ...EMPTY_OFFER }, { ...EMPTY_OFFER }]);
  const [compared, setCompared] = useState(false);

  function updateOffer(i, field, value) {
    setOffers(prev => prev.map((o, idx) => idx === i ? { ...o, [field]: value } : o));
    setCompared(false);
  }

  function addOffer() {
    if (offers.length < 4) setOffers(prev => [...prev, { ...EMPTY_OFFER }]);
  }

  function removeOffer(i) {
    if (offers.length > 2) setOffers(prev => prev.filter((_, idx) => idx !== i));
  }

  const scores  = offers.map(scoreOffer);
  const verdict = compared ? getVerdict(offers, scores) : null;
  const maxScore = Math.max(...scores);

  const COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#818cf8"];

  return (
    <div style={{ maxWidth: "960px", margin: "0 auto", padding: "40px 24px 80px", fontFamily: "'Segoe UI', sans-serif" }}>

      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <div style={{ display: "inline-block", background: theme.surface, color: theme.primary, border: `1px solid ${theme.border}`, padding: "3px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: 700, letterSpacing: "2px", marginBottom: "10px" }}>OFFER COMPARISON</div>
        <h1 style={{ fontSize: "26px", fontWeight: 800, color: theme.textPrimary, marginBottom: "8px" }}>Compare Job Offers</h1>
        <p style={{ color: theme.textSecondary, fontSize: "14px" }}>Enter your offers below and get an AI-powered comparison with recommendation.</p>
      </div>

      {/* Offer input cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px", marginBottom: "20px" }}>
        {offers.map((offer, i) => (
          <div key={i} style={{ ...card, borderColor: compared && scores[i] === maxScore ? COLORS[i] : theme.border, transition: "border-color 0.3s" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div style={{ color: COLORS[i], fontWeight: 700, fontSize: "13px", letterSpacing: "1px" }}>
                OFFER {i + 1}
                {compared && scores[i] === maxScore && <span style={{ marginLeft: "8px", background: "#22c55e22", color: "#22c55e", border: "1px solid #166534", padding: "1px 8px", borderRadius: "20px", fontSize: "10px" }}>⭐ BEST</span>}
              </div>
              {offers.length > 2 && (
                <button onClick={() => removeOffer(i)} style={{ background: "transparent", color: theme.textMuted, border: "none", cursor: "pointer", fontSize: "16px" }}>✕</button>
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                ["Company Name", "company", "text", "e.g. Google"],
                ["Role / Position", "role", "text", "e.g. SDE-1"],
                ["CTC (LPA)", "ctc", "number", "e.g. 8.5"],
                ["Location", "location", "text", "e.g. Bangalore"],
                ["Bond (years)", "bond", "number", "0 if no bond"],
              ].map(([label, field, type, placeholder]) => (
                <div key={field}>
                  <label style={{ color: theme.textMuted, fontSize: "11px", fontWeight: 700, letterSpacing: "1px", display: "block", marginBottom: "5px" }}>{label.toUpperCase()}</label>
                  <input type={type} placeholder={placeholder} value={offer[field]} onChange={e => updateOffer(i, field, e.target.value)} style={inputStyle} />
                </div>
              ))}

              <div>
                <label style={{ color: theme.textMuted, fontSize: "11px", fontWeight: 700, letterSpacing: "1px", display: "block", marginBottom: "5px" }}>WORK MODE</label>
                <div style={{ display: "flex", gap: "6px" }}>
                  {["Remote", "Hybrid", "On-site"].map(mode => (
                    <button key={mode} onClick={() => updateOffer(i, "workMode", mode)} style={{
                      flex: 1, padding: "7px 4px", borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "11px", fontWeight: 600,
                      background: offer.workMode === mode ? COLORS[i] : theme.input,
                      color: offer.workMode === mode ? "#fff" : theme.textSecondary,
                      border: offer.workMode === mode ? "none" : `1px solid ${theme.border}`,
                    }}>{mode}</button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ color: theme.textMuted, fontSize: "11px", fontWeight: 700, letterSpacing: "1px", display: "block", marginBottom: "5px" }}>JOB TYPE</label>
                <div style={{ display: "flex", gap: "6px" }}>
                  {["Full-time", "Contract", "Internship"].map(type => (
                    <button key={type} onClick={() => updateOffer(i, "type", type)} style={{
                      flex: 1, padding: "7px 4px", borderRadius: "8px", cursor: "pointer", fontSize: "10px", fontWeight: 600,
                      background: offer.type === type ? COLORS[i] : theme.input,
                      color: offer.type === type ? "#fff" : theme.textSecondary,
                      border: offer.type === type ? "none" : `1px solid ${theme.border}`,
                    }}>{type}</button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ color: theme.textMuted, fontSize: "11px", fontWeight: 700, letterSpacing: "1px", display: "block", marginBottom: "5px" }}>PERKS</label>
                <input placeholder="e.g. Health insurance, WFH allowance" value={offer.perks} onChange={e => updateOffer(i, "perks", e.target.value)} style={inputStyle} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add offer button */}
      {offers.length < 4 && (
        <button onClick={addOffer} style={{
          width: "100%", padding: "13px", marginBottom: "16px",
          background: "transparent", color: theme.textMuted,
          border: `1px dashed ${theme.border}`, borderRadius: "12px",
          fontSize: "13px", fontWeight: 600, cursor: "pointer",
        }}>
          + Add Another Offer (max 4)
        </button>
      )}

      {/* Compare button */}
      <button onClick={() => setCompared(true)} style={{
        width: "100%", padding: "14px", marginBottom: "24px",
        background: "linear-gradient(135deg, #3b82f6, #6366f1)",
        color: "#fff", border: "none", borderRadius: "12px",
        fontSize: "14px", fontWeight: 700, cursor: "pointer",
      }}>
        ⚖️ Compare Offers
      </button>

      {/* Results */}
      {compared && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

          {/* Verdict */}
          {verdict && offers[verdict.index].company && (
            <div style={{ ...card, background: "linear-gradient(135deg, #052e16, #0a1628)", border: "1px solid #166534" }}>
              <div style={{ color: "#4ade80", fontWeight: 700, fontSize: "15px", marginBottom: "6px" }}>
                🏆 Recommendation
              </div>
              <p style={{ color: theme.textSecondary, fontSize: "14px", lineHeight: "1.7", margin: 0 }}>
                Based on CTC, bond clause, work mode, and perks — <strong style={{ color: theme.textPrimary }}>{verdict.name}</strong> appears to be the strongest offer due to <strong style={{ color: "#4ade80" }}>{verdict.reason}</strong>. However, consider your personal priorities — growth opportunities and work culture matter as much as salary.
              </p>
            </div>
          )}

          {/* Score comparison */}
          <div style={card}>
            <h3 style={{ color: theme.textPrimary, fontSize: "14px", fontWeight: 700, marginBottom: "16px" }}>📊 Overall Score Comparison</h3>
            {offers.map((offer, i) => (
              <ScoreBar
                key={i}
                label={offer.company || `Offer ${i + 1}`}
                value={scores[i]}
                max={100}
                color={COLORS[i]}
                theme={theme}
              />
            ))}
          </div>

          {/* Side by side table */}
          <div style={card}>
            <h3 style={{ color: theme.textPrimary, fontSize: "14px", fontWeight: 700, marginBottom: "16px" }}>📋 Side by Side Comparison</h3>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                <thead>
                  <tr>
                    <th style={{ color: theme.textMuted, textAlign: "left", padding: "8px 12px", borderBottom: `1px solid ${theme.border}`, fontWeight: 700, fontSize: "11px" }}>FACTOR</th>
                    {offers.map((o, i) => (
                      <th key={i} style={{ color: COLORS[i], textAlign: "center", padding: "8px 12px", borderBottom: `1px solid ${theme.border}`, fontWeight: 700, fontSize: "11px" }}>
                        {o.company || `OFFER ${i + 1}`}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Role",      o => o.role      || "—"],
                    ["CTC",       o => o.ctc ? `₹${o.ctc} LPA` : "—"],
                    ["Location",  o => o.location  || "—"],
                    ["Bond",      o => o.bond ? `${o.bond} yr` : "None"],
                    ["Work Mode", o => o.workMode],
                    ["Type",      o => o.type],
                    ["Perks",     o => o.perks || "—"],
                    ["Score",     (o, i) => `${scores[i]}/100`],
                  ].map(([label, fn]) => (
                    <tr key={label} style={{ borderBottom: `1px solid ${theme.border}` }}>
                      <td style={{ color: theme.textMuted, padding: "10px 12px", fontWeight: 600, fontSize: "12px" }}>{label}</td>
                      {offers.map((o, i) => (
                        <td key={i} style={{ color: label === "Score" ? COLORS[i] : "#94a3b8", textAlign: "center", padding: "10px 12px", fontWeight: label === "Score" ? 700 : 400 }}>
                          {fn(o, i)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Priority tips */}
          <div style={card}>
            <h3 style={{ color: theme.textPrimary, fontSize: "14px", fontWeight: 700, marginBottom: "14px" }}>💡 What Matters for Different Goals</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {[
                ["💰 Best for Money",    "Pick the highest CTC with no bond. Long-term compensation beats short-term perks."],
                ["📈 Best for Growth",   "Look beyond salary — choose the company with better tech stack, mentorship, and brand name."],
                ["🏠 Best for Flexibility", "Remote or hybrid work mode with no bond gives you maximum freedom."],
                ["🎯 Best for Career",   "FAANG/Product companies over service companies if growth is your priority."],
              ].map(([title, tip]) => (
                <div key={title} style={{ display: "flex", gap: "12px", padding: "12px 14px", background: theme.bg, borderRadius: "10px", border: `1px solid ${theme.border}` }}>
                  <span style={{ flexShrink: 0, fontSize: "14px" }}>{title.split(" ")[0]}</span>
                  <div>
                    <div style={{ color: theme.textPrimary, fontSize: "12px", fontWeight: 600, marginBottom: "3px" }}>{title.slice(2)}</div>
                    <div style={{ color: theme.textMuted, fontSize: "12px", lineHeight: "1.6" }}>{tip}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}