import { useState, useRef, useEffect } from "react";
import { authHeaders } from "../utils/auth";
import { useTheme } from "../context/ThemeContext";
import { useNotifications } from "../context/NotificationContext";

import API from "../utils/config";
const MAX_ROUNDS = 5;

function scoreColor(s, max = 10) {
  const p = s / max;
  return p >= 0.7 ? "#22c55e" : p >= 0.4 ? "#f59e0b" : "#ef4444";
}

function ScorePill({ score, max = 10 }) {
  const c = scoreColor(score, max);
  return (
    <span style={{
      padding: "2px 10px", borderRadius: "20px", fontSize: "11px",
      fontWeight: 800, color: c, background: c + "22",
      border: `1px solid ${c}44`, display: "inline-block",
    }}>{score}/{max}</span>
  );
}

function TypingDots({ theme }) {
  return (
    <div style={{ display: "flex", gap: "10px", alignItems: "flex-start", marginBottom: "4px" }}>
      <div style={{
        width: "32px", height: "32px", borderRadius: "50%", flexShrink: 0,
        background: theme.surface, border: `1px solid ${theme.primary}`,
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px",
      }}>🤖</div>
      <div style={{
        padding: "11px 15px", maxWidth: "72%",
        borderRadius: "4px 18px 18px 18px",
        background: theme.surface, border: `1px solid ${theme.border}`,
      }}>
        <div style={{ display: "flex", gap: "5px", padding: "4px 2px" }}>
          {[0, 1, 2].map(i => (
            <span key={i} style={{
              width: "7px", height: "7px", borderRadius: "50%",
              background: theme.textMuted, display: "inline-block",
              animation: "bounce 1.1s infinite",
              animationDelay: `${i * 0.18}s`,
            }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function Message({ msg, theme, isDark }) {
  if (msg.role === "system") {
    return (
      <div style={{ textAlign: "center", margin: "6px 0" }}>
        <span style={{
          color: theme.textMuted, fontSize: "11px",
          background: theme.surface,
          padding: "3px 14px", borderRadius: "20px",
          border: `1px solid ${theme.border}`,
        }}>{msg.content}</span>
      </div>
    );
  }

  const isAI = msg.role === "ai";
  return (
    <div style={{
      display: "flex", gap: "10px", alignItems: "flex-start",
      flexDirection: isAI ? "row" : "row-reverse", marginBottom: "4px",
    }}>
      <div style={{
        width: "32px", height: "32px", borderRadius: "50%", flexShrink: 0,
        background: theme.surface,
        border: `1px solid ${isAI ? theme.primary : theme.accent1}`,
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px",
      }}>{isAI ? "🤖" : "👤"}</div>

      <div style={{ display: "flex", flexDirection: "column", gap: "7px", alignItems: isAI ? "flex-start" : "flex-end", maxWidth: "75%" }}>
        <div style={{
          padding: "11px 15px", maxWidth: "100%",
          borderRadius: isAI ? "4px 18px 18px 18px" : "18px 4px 18px 18px",
          background: isAI ? theme.surface : isDark ? "#1a2f52" : theme.primaryGlow,
          border: `1px solid ${isAI ? theme.border : theme.primary + "44"}`,
        }}>
          <p style={{ margin: 0, fontSize: "14px", lineHeight: "1.65", color: theme.textPrimary }}>
            {msg.content}
          </p>
        </div>

        {msg.eval && (
          <div style={{
            background: theme.bg, border: `1px solid ${theme.border}`,
            borderRadius: "10px", padding: "12px 14px", width: "100%",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px", flexWrap: "wrap" }}>
              <ScorePill score={msg.eval.score} />
              <span style={{ color: theme.textSecondary, fontSize: "12px", lineHeight: "1.5" }}>{msg.eval.feedback}</span>
            </div>
            <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
              {msg.eval.strengths?.length > 0 && (
                <div>
                  <div style={{ color: theme.textMuted, fontSize: "10px", fontWeight: 700, letterSpacing: "1px", marginBottom: "4px" }}>✅ STRENGTHS</div>
                  {msg.eval.strengths.map((x, i) => (
                    <div key={i} style={{ color: "#22c55e", fontSize: "12px", lineHeight: "1.6" }}>• {x}</div>
                  ))}
                </div>
              )}
              {msg.eval.improvements?.length > 0 && (
                <div>
                  <div style={{ color: theme.textMuted, fontSize: "10px", fontWeight: 700, letterSpacing: "1px", marginBottom: "4px" }}>💡 IMPROVE</div>
                  {msg.eval.improvements.map((x, i) => (
                    <div key={i} style={{ color: "#f59e0b", fontSize: "12px", lineHeight: "1.6" }}>• {x}</div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Summary({ history, onRestart, theme, isDark }) {
  const avg = history.length
    ? (history.reduce((a, h) => a + h.score, 0) / history.length).toFixed(1)
    : 0;
  const c = scoreColor(parseFloat(avg));
  const [modelAnswers, setModelAnswers] = useState({});
  const [loadingAnswer, setLoadingAnswer] = useState(null);

  async function fetchModelAnswer(question, index) {
    setLoadingAnswer(index);
    try {
      const res = await fetch(`${API}/interview/model-answer`, {
        method: "POST", headers: authHeaders(),
        body: JSON.stringify({ question }),
      });
      const data = await res.json();
      setModelAnswers(prev => ({ ...prev, [index]: data.model_answer }));
    } catch {
      setModelAnswers(prev => ({ ...prev, [index]: "Could not load model answer." }));
    }
    setLoadingAnswer(null);
  }

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
      backdropFilter: "blur(8px)", display: "flex",
      alignItems: "center", justifyContent: "center", zIndex: 300,
      overflowY: "auto", padding: "20px",
    }}>
      <div style={{
        background: theme.surface, border: `1px solid ${theme.border}`,
        borderRadius: "20px", padding: "36px", maxWidth: "560px", width: "90%",
        display: "flex", flexDirection: "column", alignItems: "center",
        boxShadow: "0 24px 64px rgba(0,0,0,0.3)",
      }}>
        <div style={{ fontSize: "40px", marginBottom: "12px" }}>🏁</div>
        <h2 style={{ color: theme.textPrimary, fontWeight: 800, margin: "0 0 4px" }}>Session Complete</h2>
        <p style={{ color: theme.textMuted, fontSize: "13px", margin: "0 0 24px" }}>{MAX_ROUNDS} questions answered</p>

        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div style={{ fontSize: "56px", fontWeight: 900, color: c, fontFamily: "monospace", lineHeight: 1 }}>{avg}</div>
          <div style={{ color: theme.textMuted, fontSize: "12px", marginTop: "4px" }}>Average Score / 10</div>
        </div>

        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px" }}>
          {history.map((h, i) => (
            <div key={i} style={{
              background: theme.bg, border: `1px solid ${theme.border}`,
              borderRadius: "10px", padding: "12px 14px",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <span style={{ color: theme.textSecondary, fontSize: "12px", flex: 1, marginRight: "12px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  Q{i + 1}: {h.question}
                </span>
                <ScorePill score={h.score} />
              </div>

              {!modelAnswers[i] ? (
                <button
                  onClick={() => fetchModelAnswer(h.question, i)}
                  disabled={loadingAnswer === i}
                  style={{
                    background: theme.primaryGlow, color: theme.primary,
                    border: `1px solid ${theme.primary}44`, borderRadius: "6px",
                    padding: "4px 12px", fontSize: "11px", cursor: "pointer",
                    marginTop: "4px", fontWeight: 600,
                  }}
                >
                  {loadingAnswer === i ? "Loading…" : "💡 Show Model Answer"}
                </button>
              ) : (
                <div style={{
                  marginTop: "8px", borderRadius: "8px", padding: "10px 12px",
                  background: isDark ? "#0c1d3a" : "#eff6ff",
                  border: `1px solid ${theme.primary}33`,
                }}>
                  <div style={{ color: theme.primary, fontSize: "10px", fontWeight: 700, marginBottom: "4px" }}>💡 MODEL ANSWER</div>
                  <p style={{ color: theme.textSecondary, fontSize: "12px", lineHeight: "1.7", margin: 0 }}>{modelAnswers[i]}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <button onClick={onRestart} style={{
          width: "100%", padding: "13px",
          background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent1})`,
          color: "#fff", border: "none", borderRadius: "10px",
          fontSize: "14px", fontWeight: 700, cursor: "pointer",
          boxShadow: `0 4px 16px ${theme.primaryGlow}`,
        }}>Start New Session</button>
      </div>
    </div>
  );
}

export default function InterviewPage() {
  const { theme, isDark } = useTheme();
  const [messages, setMessages]     = useState([]);
  const [input, setInput]           = useState("");
  const [loading, setLoading]       = useState(false);
  const [started, setStarted]       = useState(false);
  const [done, setDone]             = useState(false);
  const [currentQuestion, setCQ]    = useState("");
  const [round, setRound]           = useState(0);
  const [history, setHistory]       = useState([]);
  const [waitingForAns, setWait]    = useState(false);
  const [askedQuestions, setAsked]  = useState([]);
  const [listening, setListening]   = useState(false);
  const [interviewType, setInterviewType] = useState("mixed");
  const [companyType, setCompanyType]     = useState("general");
  const [configured, setConfigured]       = useState(false);
  const recognitionRef = useRef(null);
  const bottomRef      = useRef(null);
  const inputRef       = useRef(null);
  const { addNotification } = useNotifications();

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  function addMsg(role, content, extra = {}) {
    setMessages(prev => [...prev, { role, content, ...extra }]);
  }

  function startVoice() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert("Voice input not supported. Use Chrome."); return; }
    const r = new SR();
    r.lang = "en-US"; r.continuous = true; r.interimResults = true;
    recognitionRef.current = r;
    r.onstart  = () => setListening(true);
    r.onend    = () => setListening(false);
    r.onerror  = () => setListening(false);
    r.onresult = (e) => {
      let finalTranscript = "";
      let interimTranscript = "";
      for (let i = 0; i < e.results.length; i++) {
        if (e.results[i].isFinal) {
          finalTranscript += e.results[i][0].transcript;
        } else {
          interimTranscript += e.results[i][0].transcript;
        }
      }
      const newText = finalTranscript || interimTranscript;
      // Append to existing input instead of replacing
      setInput(prev => {
        if (!prev.trim()) return newText;
        return prev.trim() + " " + newText;
      });
    };
    r.start();
  }

  function stopVoice() { recognitionRef.current?.stop(); setListening(false); }

  async function start() {
    setLoading(true);
    try {
      const res  = await fetch(`${API}/interview/start`, {
        method: "POST", headers: authHeaders(),
        body: JSON.stringify({ interview_type: interviewType, company_type: companyType }),
      });
      const data = await res.json();
      setStarted(true); setRound(1); setCQ(data.question);
      setAsked([data.question]);
      addMsg("system", `${interviewType.toUpperCase()} · ${companyType.toUpperCase()} · ${MAX_ROUNDS} questions`);
      addMsg("ai", data.question);
      setWait(true);
      setTimeout(() => inputRef.current?.focus(), 120);
    } catch { addMsg("system", "❌ Could not reach backend."); }
    setLoading(false);
  }

  async function submit() {
    const trimmed = input.trim();
    if (!trimmed || loading || !waitingForAns) return;
    setInput(""); setWait(false);
    const msgId = Date.now();
    setMessages(prev => [...prev, { role: "user", content: trimmed, _id: msgId }]);
    setLoading(true);
    try {
      const res = await fetch(`${API}/interview/answer`, {
        method: "POST", headers: authHeaders(),
        body: JSON.stringify({
          question: currentQuestion, answer: trimmed,
          round, asked_questions: askedQuestions,
          interview_type: interviewType, company_type: companyType,
        }),
      });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();
      setHistory(prev => [...prev, { question: currentQuestion, score: data.score }]);
      setMessages(prev => prev.map(m => m._id === msgId ? { ...m, eval: data } : m));
      if (round >= MAX_ROUNDS) {
        addMsg("ai", `Great session! You completed all ${MAX_ROUNDS} questions.`);
        setDone(true);
        addNotification({
          type: "achievement",
          icon: "🎤",
          title: "Interview Complete!",
          message: `You completed a ${interviewType} interview. Check your session history for detailed feedback.`,
          color: "#6366f1",
        });
      } else {
        setCQ(data.next_question); setRound(r => r + 1);
        setAsked(prev => [...prev, data.next_question]);
        addMsg("ai", data.next_question); setWait(true);
        setTimeout(() => inputRef.current?.focus(), 120);
      }
    } catch (e) { addMsg("system", `❌ ${e.message}`); setWait(true); }
    setLoading(false);
  }

  function onKey(e) { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); } }

  function restart() {
    setMessages([]); setInput(""); setLoading(false); setStarted(false);
    setDone(false); setCQ(""); setRound(0); setHistory([]);
    setWait(false); setAsked([]); setConfigured(false); setListening(false);
  }

  const progress = (round / MAX_ROUNDS) * 100;

  // ── Config screen ──────────────────────────────────────────────────────────
  if (!configured) {
    return (
      <div style={{ maxWidth: "520px", margin: "60px auto", padding: "0 24px", fontFamily: "'Inter','Segoe UI', sans-serif" }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ fontSize: "48px", marginBottom: "12px" }}>🎤</div>
          <h1 style={{ color: theme.textPrimary, fontWeight: 800, fontSize: "24px", marginBottom: "8px" }}>Setup Your Interview</h1>
          <p style={{ color: theme.textSecondary, fontSize: "14px" }}>Choose your interview type and company style</p>
        </div>

        <div style={{
          background: theme.surface, border: `1px solid ${theme.border}`,
          borderRadius: "16px", padding: "28px",
          display: "flex", flexDirection: "column", gap: "20px",
          boxShadow: isDark ? "none" : "0 4px 24px rgba(0,0,0,0.08)",
        }}>
          <div>
            <label style={{ color: theme.textMuted, fontSize: "11px", fontWeight: 700, letterSpacing: "1px", display: "block", marginBottom: "10px" }}>INTERVIEW TYPE</label>
            <div style={{ display: "flex", gap: "8px" }}>
              {[["mixed", "🔀 Mixed"], ["technical", "💻 Technical"], ["hr", "🤝 HR"]].map(([val, label]) => (
                <button key={val} onClick={() => setInterviewType(val)} style={{
                  flex: 1, padding: "10px 8px", borderRadius: "10px", cursor: "pointer",
                  background: interviewType === val
                    ? `linear-gradient(135deg, ${theme.primary}, ${theme.accent1})`
                    : theme.input,
                  color: interviewType === val ? "#fff" : theme.textMuted,
                  fontWeight: 600, fontSize: "12px",
                  border: interviewType === val ? "none" : `1px solid ${theme.border}`,
                  boxShadow: interviewType === val ? `0 2px 8px ${theme.primaryGlow}` : "none",
                  transition: "all 0.2s",
                }}>{label}</button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ color: theme.textMuted, fontSize: "11px", fontWeight: 700, letterSpacing: "1px", display: "block", marginBottom: "10px" }}>COMPANY TYPE</label>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {[["general", "🎓 General"], ["startup", "🚀 Startup"], ["mnc", "🏢 MNC"], ["faang", "⭐ FAANG"]].map(([val, label]) => (
                <button key={val} onClick={() => setCompanyType(val)} style={{
                  flex: 1, minWidth: "80px", padding: "10px 8px", borderRadius: "10px", cursor: "pointer",
                  background: companyType === val
                    ? "linear-gradient(135deg, #22c55e, #16a34a)"
                    : theme.input,
                  color: companyType === val ? "#fff" : theme.textMuted,
                  fontWeight: 600, fontSize: "12px",
                  border: companyType === val ? "none" : `1px solid ${theme.border}`,
                  transition: "all 0.2s",
                }}>{label}</button>
              ))}
            </div>
          </div>

          <div style={{
            background: theme.bg, border: `1px solid ${theme.border}`,
            borderRadius: "10px", padding: "14px 16px",
          }}>
            <div style={{ color: theme.textSecondary, fontSize: "13px", lineHeight: "1.7" }}>
              {interviewType === "technical" && "💻 5 rounds of DSA, algorithms, system design, and CS fundamentals."}
              {interviewType === "hr"        && "🤝 5 rounds covering introduction, teamwork, strengths, challenges, and goals."}
              {interviewType === "mixed"     && "🔀 5 rounds: intro → technical → projects → problem solving → HR."}
              {" · "}
              {companyType === "startup" && "Fast-paced startup style questions."}
              {companyType === "mnc"     && "Structured MNC-style questions."}
              {companyType === "faang"   && "Challenging FAANG-style deep dives."}
              {companyType === "general" && "Standard placement interview questions."}
            </div>
          </div>

          <button onClick={() => setConfigured(true)} style={{
            padding: "13px",
            background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent1})`,
            color: "#fff", border: "none", borderRadius: "10px",
            fontSize: "14px", fontWeight: 700, cursor: "pointer",
            boxShadow: `0 4px 16px ${theme.primaryGlow}`,
          }}>
            Continue →
          </button>
        </div>
      </div>
    );
  }

  // ── Chat screen ────────────────────────────────────────────────────────────
  return (
    <div style={{
      display: "flex", flexDirection: "column",
      height: "calc(100vh - 20px)",
      maxWidth: "780px", margin: "0 auto",
      padding: "0 20px 20px",
      fontFamily: "'Inter','Segoe UI', sans-serif",
    }}>
      <style>{`
        @keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-6px)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        .msg-in { animation: fadeUp 0.22s ease forwards; }
      `}</style>

      {/* Header */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "20px 0 14px", flexShrink: 0,
        borderBottom: `1px solid ${theme.border}`,
        marginBottom: "12px",
      }}>
        <div>
          <div style={{
            display: "inline-block", background: theme.primaryGlow,
            color: theme.primary, padding: "3px 12px", borderRadius: "20px",
            fontSize: "10px", fontWeight: 700, letterSpacing: "2px", marginBottom: "6px",
            border: `1px solid ${theme.primary}33`,
          }}>MOCK INTERVIEW</div>
          <h1 style={{ fontSize: "20px", fontWeight: 800, color: theme.textPrimary, margin: 0 }}>
            AI Interview Room
          </h1>
        </div>

        {started && (
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div>
              <div style={{ color: theme.textMuted, fontSize: "10px", marginBottom: "5px", textAlign: "right", fontWeight: 600 }}>
                ROUND {round}/{MAX_ROUNDS}
              </div>
              <div style={{ width: "110px", height: "5px", background: theme.border, borderRadius: "4px", overflow: "hidden" }}>
                <div style={{
                  height: "100%", borderRadius: "4px",
                  background: `linear-gradient(90deg, ${theme.primary}, ${theme.accent1})`,
                  width: `${progress}%`, transition: "width 0.4s ease",
                }} />
              </div>
            </div>
            <button onClick={restart} style={{
              background: "transparent", color: theme.textSecondary,
              border: `1px solid ${theme.border}`, borderRadius: "8px",
              padding: "5px 11px", fontSize: "12px", cursor: "pointer",
              transition: "all 0.2s",
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = theme.danger; e.currentTarget.style.color = theme.danger; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.color = theme.textSecondary; }}
            >↺ Reset</button>
          </div>
        )}
      </div>

      {/* Chat window */}
      <div style={{
        flex: 1, overflowY: "auto", display: "flex",
        flexDirection: "column", gap: "12px",
        padding: "8px 0", minHeight: 0,
      }}>
        {!started && messages.length === 0 && (
          <div style={{
            flex: 1, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            textAlign: "center", padding: "60px 20px", margin: "auto",
          }}>
            <div style={{
              width: "72px", height: "72px", borderRadius: "20px",
              background: theme.primaryGlow, border: `1px solid ${theme.primary}33`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "32px", marginBottom: "20px",
            }}>🎤</div>
            <h2 style={{ color: theme.textPrimary, fontWeight: 800, marginBottom: "10px", fontSize: "20px" }}>Ready to Practice?</h2>
            <p style={{ color: theme.textSecondary, lineHeight: "1.7", maxWidth: "360px", margin: "0 auto 8px", fontSize: "14px" }}>
              {MAX_ROUNDS} questions across 5 topics: intro → technical → projects → problem solving → HR
            </p>
            <p style={{ color: theme.textMuted, fontSize: "12px", margin: "0 auto 28px" }}>
              Each round covers a different area — no repeated questions.
            </p>
            <button onClick={start} disabled={loading} style={{
              padding: "12px 32px",
              background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent1})`,
              color: "#fff", border: "none", borderRadius: "10px",
              fontSize: "14px", fontWeight: 700, cursor: "pointer",
              boxShadow: `0 4px 16px ${theme.primaryGlow}`,
            }}>
              {loading ? "Connecting…" : "▶  Start Interview"}
            </button>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className="msg-in">
            <Message msg={msg} theme={theme} isDark={isDark} />
          </div>
        ))}

        {loading && started && <TypingDots theme={theme} />}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      {started && !done && (
        <>
          <div style={{
            display: "flex", gap: "8px", alignItems: "flex-end",
            padding: "12px 0 0", flexShrink: 0,
            borderTop: `1px solid ${theme.border}`,
          }}>
            <textarea
              ref={inputRef}
              rows={2}
              style={{
                flex: 1, background: theme.input,
                border: `1px solid ${theme.border}`, borderRadius: "12px",
                padding: "11px 15px", color: theme.textPrimary, fontSize: "14px",
                resize: "none", fontFamily: "inherit", lineHeight: "1.5",
                transition: "border-color 0.2s",
              }}
              placeholder={waitingForAns ? "Type your answer… (Enter to send)" : "Waiting for AI…"}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={onKey}
              disabled={!waitingForAns || loading}
            />

            {/* Mic button */}
            <button
              onClick={listening ? stopVoice : startVoice}
              disabled={!waitingForAns || loading}
              style={{
                width: "44px", height: "44px", borderRadius: "12px",
                background: listening ? "linear-gradient(135deg,#ef4444,#dc2626)"
                  : !waitingForAns || loading ? theme.border : theme.input,
                color: listening ? "#fff" : !waitingForAns || loading ? theme.textMuted : theme.textSecondary,
                fontSize: "16px", cursor: !waitingForAns || loading ? "not-allowed" : "pointer",
                border: listening ? "none" : `1px solid ${theme.border}`,
                animation: listening ? "pulse 1s infinite" : "none",
                flexShrink: 0, transition: "all 0.2s",
              }}
            >{listening ? "⏹" : "🎤"}</button>

            {/* Send button */}
            <button
              onClick={submit}
              disabled={!input.trim() || !waitingForAns || loading}
              style={{
                width: "44px", height: "44px", borderRadius: "12px", border: "none",
                background: !input.trim() || !waitingForAns || loading
                  ? theme.border
                  : `linear-gradient(135deg, ${theme.primary}, ${theme.accent1})`,
                color: !input.trim() || !waitingForAns || loading ? theme.textMuted : "#fff",
                fontSize: "18px",
                cursor: !input.trim() || !waitingForAns || loading ? "not-allowed" : "pointer",
                flexShrink: 0, transition: "all 0.2s",
                boxShadow: !input.trim() || !waitingForAns || loading ? "none" : `0 2px 8px ${theme.primaryGlow}`,
              }}
            >↑</button>
          </div>

          {listening && (
            <div style={{ textAlign: "center", padding: "6px 0", color: "#ef4444", fontSize: "12px", fontWeight: 600 }}>
              🔴 Listening… speak your answer, click ⏹ when done
            </div>
          )}
        </>
      )}

      {done && <Summary history={history} onRestart={restart} theme={theme} isDark={isDark} />}
    </div>
  );
}