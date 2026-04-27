import { useState, useEffect, useRef } from "react";
import { authHeaders } from "../utils/auth";
import { useTheme } from "../context/ThemeContext";

const QUESTIONS = {
  quantitative: [
    { q: "A train travels 60 km in 1 hour. How long to travel 210 km?", options: ["2.5 hrs", "3 hrs", "3.5 hrs", "4 hrs"], answer: 2 },
    { q: "If 8 workers complete a job in 6 days, how many days for 12 workers?", options: ["3", "4", "5", "6"], answer: 1 },
    { q: "What is 15% of 480?", options: ["60", "66", "72", "78"], answer: 2 },
    { q: "A shopkeeper sells at 20% profit. Cost price is ₹250. Selling price?", options: ["₹280", "₹290", "₹300", "₹310"], answer: 2 },
    { q: "Simple interest on ₹5000 at 8% per annum for 3 years?", options: ["₹1000", "₹1200", "₹1500", "₹1800"], answer: 1 },
    { q: "Find the LCM of 12, 18, and 24.", options: ["48", "60", "72", "96"], answer: 2 },
    { q: "A pipe fills a tank in 4 hours. Another empties it in 12 hours. Together?", options: ["4 hrs", "6 hrs", "8 hrs", "10 hrs"], answer: 1 },
    { q: "Speed of boat in still water is 15 km/h. Stream is 3 km/h. Upstream speed?", options: ["10", "12", "13", "18"], answer: 1 },
    { q: "Sum of first 20 natural numbers?", options: ["190", "200", "210", "220"], answer: 2 },
    { q: "If 3x + 7 = 22, what is x?", options: ["3", "4", "5", "6"], answer: 2 },
  ],
  logical: [
    { q: "Find next: 2, 6, 12, 20, 30, ?", options: ["40", "42", "44", "46"], answer: 1 },
    { q: "If MANGO = 13+1+14+7+15 = 50, what is APPLE?", options: ["50", "51", "52", "53"], answer: 1 },
    { q: "All cats are animals. Some animals are dogs. Which is definitely true?", options: ["Some cats are dogs", "All dogs are cats", "Some cats are animals", "All animals are cats"], answer: 2 },
    { q: "Find odd one out: 121, 144, 169, 196, 225, 250", options: ["196", "225", "250", "169"], answer: 2 },
    { q: "A is B's sister. B is C's brother. C is D's father. How is A related to D?", options: ["Mother", "Aunt", "Sister", "Grandmother"], answer: 1 },
    { q: "Find next: A, C, F, J, O, ?", options: ["T", "U", "V", "W"], answer: 1 },
    { q: "If 1=5, 2=25, 3=125, 4=625, then 5=?", options: ["1", "3125", "5", "625"], answer: 0 },
    { q: "Pointing to a man, a woman says 'his mother is the only daughter of my mother'. How is the woman related to the man?", options: ["Grandmother", "Mother", "Sister", "Aunt"], answer: 1 },
    { q: "Which number replaces ?: 4, 9, 25, 49, ?, 169", options: ["100", "121", "81", "64"], answer: 1 },
    { q: "Statement: All pens are books. All books are pencils. Conclusion: All pens are pencils?", options: ["True", "False", "Uncertain", "Partially true"], answer: 0 },
  ],
  verbal: [
    { q: "Choose the synonym of BENEVOLENT:", options: ["Cruel", "Kind", "Angry", "Selfish"], answer: 1 },
    { q: "Choose the antonym of VERBOSE:", options: ["Talkative", "Brief", "Loud", "Complex"], answer: 1 },
    { q: "Fill in the blank: He _____ to the market yesterday.", options: ["go", "goes", "went", "going"], answer: 2 },
    { q: "Identify the correctly spelled word:", options: ["Accomodate", "Accommodate", "Acommodate", "Acomodate"], answer: 1 },
    { q: "Choose the word most similar to EPHEMERAL:", options: ["Eternal", "Temporary", "Strong", "Ancient"], answer: 1 },
    { q: "Select correct sentence:", options: ["She don't know", "She doesn't knows", "She doesn't know", "She not know"], answer: 2 },
    { q: "Analogy — Book : Author :: Painting : ?", options: ["Museum", "Canvas", "Artist", "Brush"], answer: 2 },
    { q: "Choose antonym of DILIGENT:", options: ["Hardworking", "Lazy", "Smart", "Careful"], answer: 1 },
    { q: "Fill in: Neither Ram nor Shyam _____ present.", options: ["are", "were", "was", "been"], answer: 2 },
    { q: "Idiom — 'Bite the bullet' means:", options: ["Eat fast", "Endure pain bravely", "Shoot someone", "Be cowardly"], answer: 1 },
  ],
};

const TOPIC_META = {
  quantitative: { icon: "🔢", label: "Quantitative", color: "#3b82f6", desc: "Numbers, percentages, time & work, speed" },
  logical:      { icon: "🧩", label: "Logical Reasoning", color: "#818cf8", desc: "Patterns, sequences, syllogisms, relations" },
  verbal:       { icon: "📝", label: "Verbal Ability", color: "#22c55e", desc: "Grammar, vocabulary, analogies, idioms" },
};

const TOTAL_TIME = 15 * 60; // 15 minutes


export default function AptitudePage() {
  const { theme } = useTheme();
  const card = { background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: "16px", padding: "24px" };
  const [screen, setScreen]       = useState("home");   // home | quiz | result
  const [topic,  setTopic]        = useState(null);
  const [current, setCurrent]     = useState(0);
  const [selected, setSelected]   = useState(null);
  const [answers, setAnswers]     = useState([]);
  const [timeLeft, setTimeLeft]   = useState(TOTAL_TIME);
  const [history, setHistory]     = useState([]);       // past results
  const timerRef = useRef(null);

  // ── Timer ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (screen !== "quiz") return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); finishQuiz(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [screen]);

  const mm = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const ss = String(timeLeft % 60).padStart(2, "0");
  const timerColor = timeLeft < 60 ? "#ef4444" : timeLeft < 180 ? "#f59e0b" : "#22c55e";

  // ── Start quiz ─────────────────────────────────────────────────────────────
  function startQuiz(t) {
    setTopic(t);
    setCurrent(0);
    setSelected(null);
    setAnswers([]);
    setTimeLeft(TOTAL_TIME);
    setScreen("quiz");
  }

  // ── Select answer ──────────────────────────────────────────────────────────
  function selectAnswer(idx) {
    if (selected !== null) return; // locked after selection
    setSelected(idx);
  }

  // ── Next question ──────────────────────────────────────────────────────────
  function nextQuestion() {
    const qs = QUESTIONS[topic];
    const newAnswers = [...answers, { selected, correct: qs[current].answer }];
    setAnswers(newAnswers);

    if (current + 1 >= qs.length) {
      clearInterval(timerRef.current);
      finishQuiz(newAnswers);
    } else {
      setCurrent(current + 1);
      setSelected(null);
    }
  }

  // ── Finish quiz ────────────────────────────────────────────────────────────
  function finishQuiz(finalAnswers) {
    const ans = finalAnswers || answers;
    const score = ans.filter(a => a.selected === a.correct).length;
    const timeTaken = TOTAL_TIME - timeLeft;
    const result = { topic, score, total: QUESTIONS[topic].length, timeTaken, date: new Date().toLocaleDateString() };
    setHistory(prev => [result, ...prev]);
    setScreen("result");
  }

  // ── HOME ───────────────────────────────────────────────────────────────────
  if (screen === "home") return (
    <div style={{ maxWidth: "780px", margin: "0 auto", padding: "40px 24px 80px", fontFamily: "'Segoe UI', sans-serif" }}>
      <div style={{ marginBottom: "32px" }}>
        <div style={{ display: "inline-block", background: theme.surface, color: theme.primary, border: `1px solid ${theme.border}`, padding: "3px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: 700, letterSpacing: "2px", marginBottom: "10px" }}>APTITUDE TRAINING</div>
        <h1 style={{ fontSize: "26px", fontWeight: 800, color: theme.textPrimary, marginBottom: "8px" }}>Practice Aptitude</h1>
        <p style={{ color: theme.textSecondary, fontSize: "14px" }}>10 questions · 15 minutes · Instant results with explanations</p>
      </div>

      {/* Topic cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "32px" }}>
        {Object.entries(TOPIC_META).map(([key, { icon, label, color, desc }]) => (
          <div key={key} onClick={() => startQuiz(key)} style={{
            ...card, cursor: "pointer", transition: "border-color 0.2s, transform 0.2s",
            borderColor: "#1a1953",
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#1a1953"; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            <div style={{ fontSize: "32px", marginBottom: "12px" }}>{icon}</div>
            <div style={{ color: theme.textPrimary, fontWeight: 700, fontSize: "15px", marginBottom: "6px" }}>{label}</div>
            <div style={{ color: theme.textMuted, fontSize: "12px", lineHeight: "1.6", marginBottom: "16px" }}>{desc}</div>
            <div style={{ background: color + "22", color, border: `1px solid ${color}44`, borderRadius: "8px", padding: "8px 14px", fontSize: "12px", fontWeight: 600, textAlign: "center" }}>
              Start Practice →
            </div>
          </div>
        ))}
      </div>

      {/* History */}
      {history.length > 0 && (
        <div style={card}>
          <h3 style={{ color: theme.textPrimary, fontSize: "14px", fontWeight: 700, marginBottom: "16px" }}>📊 Recent Results</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {history.map((h, i) => {
              const pct = Math.round((h.score / h.total) * 100);
              const color = pct >= 70 ? "#22c55e" : pct >= 40 ? "#f59e0b" : "#ef4444";
              const mins = Math.floor(h.timeTaken / 60);
              const secs = h.timeTaken % 60;
              return (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: theme.bg, border: `1px solid ${theme.border}`, borderRadius: "10px", padding: "12px 16px" }}>
                  <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                    <span style={{ fontSize: "20px" }}>{TOPIC_META[h.topic]?.icon}</span>
                    <div>
                      <div style={{ color: theme.textPrimary, fontSize: "13px", fontWeight: 600 }}>{TOPIC_META[h.topic]?.label}</div>
                      <div style={{ color: theme.textMuted, fontSize: "11px" }}>{h.date} · {mins}m {secs}s</div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ color, fontWeight: 800, fontSize: "18px", fontFamily: "monospace" }}>{h.score}/{h.total}</div>
                    <div style={{ color: theme.textMuted, fontSize: "11px" }}>{pct}%</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  // ── QUIZ ───────────────────────────────────────────────────────────────────
  const qs = QUESTIONS[topic];
  const q  = qs[current];
  const meta = TOPIC_META[topic];

  if (screen === "quiz") return (
    <div style={{ maxWidth: "640px", margin: "0 auto", padding: "40px 24px 80px", fontFamily: "'Segoe UI', sans-serif" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <span style={{ fontSize: "20px" }}>{meta.icon}</span>
          <span style={{ color: theme.textPrimary, fontWeight: 700, fontSize: "15px", marginLeft: "8px" }}>{meta.label}</span>
        </div>
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <div style={{ color: timerColor, fontWeight: 800, fontSize: "18px", fontFamily: "monospace" }}>⏱ {mm}:{ss}</div>
          <div style={{ color: theme.textMuted, fontSize: "12px" }}>{current + 1} / {qs.length}</div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: "4px", background: theme.border, borderRadius: "4px", marginBottom: "24px", overflow: "hidden" }}>
        <div style={{ height: "100%", background: `linear-gradient(90deg, ${meta.color}, #6366f1)`, width: `${((current + 1) / qs.length) * 100}%`, transition: "width 0.4s ease", borderRadius: "4px" }} />
      </div>

      {/* Question */}
      <div style={{ ...card, marginBottom: "16px" }}>
        <div style={{ color: theme.textMuted, fontSize: "11px", fontWeight: 700, letterSpacing: "1px", marginBottom: "12px" }}>QUESTION {current + 1}</div>
        <p style={{ color: theme.textPrimary, fontSize: "16px", lineHeight: "1.7", margin: 0, fontWeight: 500 }}>{q.q}</p>
      </div>

      {/* Options */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
        {q.options.map((opt, i) => {
          let bg =theme.surface, border = "#1a1953", color = "#94a3b8";
          if (selected !== null) {
            if (i === q.answer)  { bg = "#dcfce7"; border = "#86efac"; color = "#16a34a"; }
            else if (i === selected && i !== q.answer) { bg = "#fee2e2"; border = "#fca5a5"; color = "#dc2626"; }
          } else if (selected === i) {
            bg = theme.primaryGlow; border = meta.color; color = theme.primary;
          }
          return (
            <div key={i} onClick={() => selectAnswer(i)} style={{
              background: bg, border: `1px solid ${border}`, borderRadius: "12px",
              padding: "14px 18px", cursor: selected !== null ? "default" : "pointer",
              color, fontSize: "14px", fontWeight: 500, lineHeight: "1.5",
              transition: "all 0.2s",
            }}
              onMouseEnter={e => { if (selected === null) e.currentTarget.style.borderColor = meta.color; }}
              onMouseLeave={e => { if (selected === null) e.currentTarget.style.borderColor = "#1a1953"; }}
            >
              <span style={{ color: theme.textMuted, marginRight: "10px", fontWeight: 700 }}>{String.fromCharCode(65 + i)}.</span>
              {opt}
            </div>
          );
        })}
      </div>

      {/* Explanation after answer */}
      {selected !== null && (
        <div style={{ background: selected === q.answer ? "#dcfce7" : "#fee2e2", border: `1px solid ${selected === q.answer ? "#86efac" : "#fca5a5"}`, borderRadius: "12px", padding: "14px 18px", marginBottom: "16px" }}>
          <div style={{ color: selected === q.answer ? "#16a34a" : "#dc2626", fontWeight: 700, fontSize: "13px", marginBottom: "4px" }}>
            {selected === q.answer ? "✅ Correct!" : `❌ Wrong! Correct answer: ${q.options[q.answer]}`}
          </div>
        </div>
      )}

      <button onClick={nextQuestion} disabled={selected === null} style={{
        width: "100%", padding: "13px",
        background: selected === null ? theme.border : `linear-gradient(135deg, ${meta.color}, #6366f1)`,
        color: selected === null ? theme.textMuted : "#fff",
        border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: 700,
        cursor: selected === null ? "not-allowed" : "pointer",
      }}>
        {current + 1 === qs.length ? "Finish Quiz →" : "Next Question →"}
      </button>
    </div>
  );

  // ── RESULT ─────────────────────────────────────────────────────────────────
  const latest = history[0];
  const pct    = Math.round((latest.score / latest.total) * 100);
  const rColor = pct >= 70 ? "#22c55e" : pct >= 40 ? "#f59e0b" : "#ef4444";
  const rLabel = pct >= 70 ? "Excellent!" : pct >= 40 ? "Good effort!" : "Needs Practice";

  return (
    <div style={{ maxWidth: "560px", margin: "0 auto", padding: "40px 24px 80px", fontFamily: "'Segoe UI', sans-serif", textAlign: "center" }}>
      <div style={{ fontSize: "52px", marginBottom: "12px" }}>{pct >= 70 ? "🏆" : pct >= 40 ? "👍" : "📚"}</div>
      <h2 style={{ color: theme.textPrimary, fontWeight: 800, fontSize: "24px", marginBottom: "6px" }}>{rLabel}</h2>
      <p style={{ color: theme.textMuted, fontSize: "14px", marginBottom: "28px" }}>{meta.label} · {latest.date}</p>

      <div style={{ ...card, marginBottom: "20px" }}>
        <div style={{ fontSize: "64px", fontWeight: 900, color: rColor, fontFamily: "monospace", lineHeight: 1 }}>{latest.score}/{latest.total}</div>
        <div style={{ color: theme.textMuted, fontSize: "13px", marginTop: "6px" }}>{pct}% correct</div>
        <div style={{ height: "6px", background: theme.border, borderRadius: "6px", margin: "16px 0 0", overflow: "hidden" }}>
          <div style={{ height: "100%", background: rColor, width: `${pct}%`, borderRadius: "6px", transition: "width 1s ease" }} />
        </div>
      </div>

      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <div style={{ ...card, flex: 1, textAlign: "center" }}>
          <div style={{ color: "#22c55e", fontSize: "22px", fontWeight: 800 }}>{latest.score}</div>
          <div style={{ color: theme.textMuted, fontSize: "11px", marginTop: "4px" }}>Correct</div>
        </div>
        <div style={{ ...card, flex: 1, textAlign: "center" }}>
          <div style={{ color: "#ef4444", fontSize: "22px", fontWeight: 800 }}>{latest.total - latest.score}</div>
          <div style={{ color: theme.textMuted, fontSize: "11px", marginTop: "4px" }}>Wrong</div>
        </div>
        <div style={{ ...card, flex: 1, textAlign: "center" }}>
          <div style={{ color: "#93c5fd", fontSize: "22px", fontWeight: 800 }}>{Math.floor(latest.timeTaken / 60)}m {latest.timeTaken % 60}s</div>
          <div style={{ color: theme.textMuted, fontSize: "11px", marginTop: "4px" }}>Time taken</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: "10px" }}>
        <button onClick={() => startQuiz(topic)} style={{
          flex: 1, padding: "13px",
          background: "linear-gradient(135deg, #3b82f6, #6366f1)",
          color: "#fff", border: "none", borderRadius: "10px",
          fontSize: "14px", fontWeight: 700, cursor: "pointer",
        }}>↺ Retry Same Topic</button>
        <button onClick={() => setScreen("home")} style={{
          flex: 1, padding: "13px",
          background:theme.surface, color: theme.textSecondary,
          border: `1px solid ${theme.border}`, borderRadius: "10px",
          fontSize: "14px", fontWeight: 700, cursor: "pointer",
        }}>← Choose Topic</button>
      </div>
    </div>
  );
}