import { useState, useRef, useEffect } from "react";
import { authHeaders } from "../utils/auth";
import { useTheme } from "../context/ThemeContext";

import API from "../utils/config";

const GD_TOPICS = [
  "Artificial Intelligence will replace human jobs",
  "Social media does more harm than good",
  "Work from home should be permanent",
  "College education is overrated",
  "Technology is making humans less social",
  "India should focus on space exploration",
  "Electric vehicles are the future",
  "Online education vs traditional education",
  "Climate change: individual vs government responsibility",
  "Should coding be mandatory in schools?",
];

const PARTICIPANTS = [
  { name: "Alex",  role: "Advocate",         color: "#3b82f6", avatar: "A", stance: "You strongly support the topic." },
  { name: "Sam",   role: "Devil's Advocate",  color: "#ef4444", avatar: "S", stance: "You oppose the topic." },
  { name: "Jordan",role: "Neutral Analyst",   color: "#22c55e", avatar: "J", stance: "You analyze both sides." },
];

function ScoreBar({ label, value, max = 10, color, theme }) {
  return (
    <div style={{ marginBottom: "12px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
        <span style={{ color: theme.textSecondary, fontSize: "12px", fontWeight: 600 }}>{label}</span>
        <span style={{ color, fontSize: "12px", fontWeight: 700 }}>{value}/{max}</span>
      </div>
      <div style={{ height: "6px", background: theme.border, borderRadius: "6px", overflow: "hidden" }}>
        <div style={{ height: "100%", background: color, width: `${(value / max) * 100}%`, borderRadius: "6px", transition: "width 1s ease" }} />
      </div>
    </div>
  );
}

function EvaluationModal({ result, topic, onRestart, theme, isDark }) {
  const scoreColor = result.overall_score >= 70 ? "#22c55e" : result.overall_score >= 40 ? "#f59e0b" : "#ef4444";

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)",
      backdropFilter: "blur(8px)", display: "flex",
      alignItems: "center", justifyContent: "center",
      zIndex: 300, overflowY: "auto", padding: "20px",
    }}>
      <div style={{
        background: theme.surface, border: `1px solid ${theme.border}`,
        borderRadius: "20px", padding: "36px", maxWidth: "560px", width: "90%",
        boxShadow: "0 24px 64px rgba(0,0,0,0.3)",
      }}>
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div style={{ fontSize: "48px", marginBottom: "12px" }}>🏆</div>
          <h2 style={{ color: theme.textPrimary, fontWeight: 800, fontSize: "22px", marginBottom: "6px" }}>GD Session Complete</h2>
          <p style={{ color: theme.textMuted, fontSize: "13px" }}>Topic: {topic}</p>
        </div>

        {/* Overall score */}
        <div style={{
          textAlign: "center", marginBottom: "24px",
          background: theme.bg, border: `1px solid ${theme.border}`,
          borderRadius: "16px", padding: "20px",
        }}>
          <div style={{ fontSize: "56px", fontWeight: 900, color: scoreColor, fontFamily: "monospace", lineHeight: 1 }}>
            {result.overall_score}
          </div>
          <div style={{ color: theme.textMuted, fontSize: "12px", marginTop: "4px" }}>Overall GD Score / 100</div>
        </div>

        {/* Score bars */}
        <div style={{ marginBottom: "20px" }}>
          <ScoreBar label="Clarity of Arguments" value={result.clarity_score}       color="#3b82f6" theme={theme} />
          <ScoreBar label="Argument Quality"      value={result.argument_score}      color="#6366f1" theme={theme} />
          <ScoreBar label="Leadership"            value={result.leadership_score}    color="#f59e0b" theme={theme} />
          <ScoreBar label="Communication"         value={result.communication_score} color="#22c55e" theme={theme} />
        </div>

        {/* Summary */}
        <div style={{ background: theme.bg, border: `1px solid ${theme.border}`, borderRadius: "12px", padding: "14px 16px", marginBottom: "16px" }}>
          <div style={{ color: theme.textMuted, fontSize: "10px", fontWeight: 700, marginBottom: "6px", letterSpacing: "1px" }}>AI ASSESSMENT</div>
          <p style={{ color: theme.textSecondary, fontSize: "13px", lineHeight: "1.7", margin: 0 }}>{result.summary}</p>
        </div>

        {/* Strengths + Improvements */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
          <div style={{ background: isDark ? "#052e16" : "#f0fdf4", border: "1px solid #22c55e44", borderRadius: "10px", padding: "12px" }}>
            <div style={{ color: "#22c55e", fontSize: "10px", fontWeight: 700, marginBottom: "8px" }}>✅ STRENGTHS</div>
            {result.strengths?.map((s, i) => (
              <div key={i} style={{ color: isDark ? "#4ade80" : "#15803d", fontSize: "12px", lineHeight: "1.6" }}>• {s}</div>
            ))}
          </div>
          <div style={{ background: isDark ? "#2d1f00" : "#fffbeb", border: "1px solid #f59e0b44", borderRadius: "10px", padding: "12px" }}>
            <div style={{ color: "#f59e0b", fontSize: "10px", fontWeight: 700, marginBottom: "8px" }}>💡 IMPROVE</div>
            {result.improvements?.map((s, i) => (
              <div key={i} style={{ color: isDark ? "#fbbf24" : "#92400e", fontSize: "12px", lineHeight: "1.6" }}>• {s}</div>
            ))}
          </div>
        </div>

        <button onClick={onRestart} style={{
          width: "100%", padding: "13px",
          background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent1})`,
          color: "#fff", border: "none", borderRadius: "10px",
          fontSize: "14px", fontWeight: 700, cursor: "pointer",
          boxShadow: `0 4px 16px ${theme.primaryGlow}`,
        }}>Start New GD Session</button>
      </div>
    </div>
  );
}

export default function GDPage() {
  const { theme, isDark } = useTheme();
  const [phase, setPhase]         = useState("setup");    // setup | discussion | result
  const [topic, setTopic]         = useState("");
  const [customTopic, setCustomTopic] = useState("");
  const [messages, setMessages]   = useState([]);
  const [input, setInput]         = useState("");
  const [loading, setLoading]     = useState(false);
  const [userContributions, setUserContributions] = useState([]);
  const [evaluation, setEvaluation] = useState(null);
  const [listening, setListening] = useState(false);
  const [turnCount, setTurnCount] = useState(0);
  const MAX_TURNS = 6; // user gets 6 turns

  const recognitionRef = useRef(null);
  const bottomRef      = useRef(null);
  const inputRef       = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const card = {
    background: theme.surface, border: `1px solid ${theme.border}`,
    borderRadius: "16px", padding: "24px",
    boxShadow: isDark ? "none" : "0 2px 12px rgba(0,0,0,0.06)",
  };

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
      let t = "";
      for (let i = 0; i < e.results.length; i++) t += e.results[i][0].transcript;
      setInput(t);
    };
    r.start();
  }

  function stopVoice() { recognitionRef.current?.stop(); setListening(false); }

  async function startGD() {
    const finalTopic = customTopic.trim() || topic;
    if (!finalTopic) return;

    const intro = [
      { speaker: "Moderator", text: `Welcome to today's Group Discussion. The topic is: "${finalTopic}". We have three participants with different perspectives. The discussion will begin now.`, role: "system" },
    ];
    setMessages(intro);
    setPhase("discussion");

    // First AI participant speaks
    await getAIResponse(finalTopic, PARTICIPANTS[0], intro);
  }

  async function getAIResponse(currentTopic, participant, currentMessages) {
    setLoading(true);
    try {
      const history = currentMessages.map(m => ({ speaker: m.speaker, text: m.text }));
      const res = await fetch(`${API}/gd/respond`, {
        method: "POST", headers: authHeaders(),
        body: JSON.stringify({
          topic: currentTopic,
          participant: participant.role,
          stance: participant.stance,
          history,
        }),
      });
      const data = await res.json();
      const newMsg = { speaker: participant.name, role: participant.role, text: data.response, color: participant.color, avatar: participant.avatar };
      setMessages(prev => [...prev, newMsg]);
    } catch (e) {
      setMessages(prev => [...prev, { speaker: "System", role: "system", text: "AI participant failed to respond." }]);
    }
    setLoading(false);
  }

  async function submitUserMessage() {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const finalTopic = customTopic.trim() || topic;
    const userMsg = { speaker: "You", role: "user", text: trimmed, color: theme.primary, avatar: "Y" };
    const newMessages = [...messages, userMsg];

    setMessages(newMessages);
    setInput("");
    setUserContributions(prev => [...prev, trimmed]);
    const newTurnCount = turnCount + 1;
    setTurnCount(newTurnCount);

    if (newTurnCount >= MAX_TURNS) {
      // End session — evaluate
      await endSession(finalTopic, [...userContributions, trimmed]);
      return;
    }

    // Pick next AI participant (rotate)
    const nextParticipant = PARTICIPANTS[newTurnCount % PARTICIPANTS.length];
    await getAIResponse(finalTopic, nextParticipant, newMessages);
  }

  async function endSession(finalTopic, contributions) {
    setLoading(true);
    try {
      const res = await fetch(`${API}/gd/evaluate`, {
        method: "POST", headers: authHeaders(),
        body: JSON.stringify({ topic: finalTopic, contributions }),
      });
      const data = await res.json();
      setEvaluation(data);
      setPhase("result");
    } catch {
      setPhase("result");
      setEvaluation({ overall_score: 0, summary: "Could not evaluate.", strengths: [], improvements: [], clarity_score: 0, argument_score: 0, leadership_score: 0, communication_score: 0 });
    }
    setLoading(false);
  }

  function restart() {
    setPhase("setup"); setTopic(""); setCustomTopic("");
    setMessages([]); setInput(""); setLoading(false);
    setUserContributions([]); setEvaluation(null);
    setTurnCount(0); setListening(false);
  }

  // ── Setup screen ───────────────────────────────────────────────────────────
  if (phase === "setup") return (
    <div style={{ maxWidth: "680px", margin: "0 auto", padding: "36px 28px 80px", fontFamily: "'Inter','Segoe UI', sans-serif" }}>

      <div style={{ marginBottom: "28px" }}>
        <div style={{ display: "inline-block", background: theme.primaryGlow, color: theme.primary, border: `1px solid ${theme.primary}33`, padding: "3px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: 700, letterSpacing: "2px", marginBottom: "10px" }}>
          GD SIMULATOR
        </div>
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: theme.textPrimary, marginBottom: "6px", letterSpacing: "-0.5px" }}>
          Group Discussion Simulator
        </h1>
        <p style={{ color: theme.textSecondary, fontSize: "14px" }}>
          Practice GD with 3 AI participants — each with a different stance. Get evaluated on clarity, arguments, leadership, and communication.
        </p>
      </div>

      {/* Participants preview */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "12px", marginBottom: "24px" }}>
        {PARTICIPANTS.map(p => (
          <div key={p.name} style={{ ...card, textAlign: "center", padding: "16px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: p.color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: "16px", margin: "0 auto 8px" }}>
              {p.avatar}
            </div>
            <div style={{ color: theme.textPrimary, fontWeight: 700, fontSize: "13px" }}>{p.name}</div>
            <div style={{ color: p.color, fontSize: "10px", fontWeight: 600, marginTop: "2px" }}>{p.role}</div>
          </div>
        ))}
      </div>

      {/* Topic selection */}
      <div style={card}>
        <h3 style={{ color: theme.textPrimary, fontWeight: 700, fontSize: "15px", marginBottom: "16px" }}>Choose a Topic</h3>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
          {GD_TOPICS.map(t => (
            <div key={t} onClick={() => { setTopic(t); setCustomTopic(""); }} style={{
              padding: "11px 14px", borderRadius: "10px", cursor: "pointer",
              background: topic === t ? theme.primaryGlow : theme.bg,
              border: `1px solid ${topic === t ? theme.primary : theme.border}`,
              color: topic === t ? theme.primary : theme.textSecondary,
              fontSize: "13px", fontWeight: topic === t ? 600 : 400,
              transition: "all 0.15s",
            }}>{t}</div>
          ))}
        </div>

        <div style={{ borderTop: `1px solid ${theme.border}`, paddingTop: "16px" }}>
          <label style={{ color: theme.textMuted, fontSize: "11px", fontWeight: 700, letterSpacing: "1px", display: "block", marginBottom: "8px" }}>
            OR ENTER CUSTOM TOPIC
          </label>
          <input
            style={{
              width: "100%", background: theme.input, border: `1px solid ${theme.border}`,
              borderRadius: "10px", padding: "11px 14px", color: theme.textPrimary,
              fontSize: "13px", fontFamily: "inherit", outline: "none", boxSizing: "border-box",
            }}
            placeholder="Type your own GD topic…"
            value={customTopic}
            onChange={e => { setCustomTopic(e.target.value); setTopic(""); }}
          />
        </div>

        <button
          onClick={startGD}
          disabled={!topic && !customTopic.trim()}
          style={{
            width: "100%", marginTop: "16px", padding: "13px",
            background: !topic && !customTopic.trim() ? theme.border : `linear-gradient(135deg, ${theme.primary}, ${theme.accent1})`,
            color: !topic && !customTopic.trim() ? theme.textMuted : "#fff",
            border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: 700,
            cursor: !topic && !customTopic.trim() ? "not-allowed" : "pointer",
            boxShadow: !topic && !customTopic.trim() ? "none" : `0 4px 16px ${theme.primaryGlow}`,
          }}
        >🎙️ Start GD Session</button>
      </div>

      {/* Info */}
      <div style={{ ...card, marginTop: "16px", background: theme.bg }}>
        <div style={{ color: theme.textPrimary, fontSize: "13px", fontWeight: 700, marginBottom: "10px" }}>How it works</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {[
            "AI participants will speak first to set the context",
            "Type or speak your points when it's your turn",
            "You get 6 turns to contribute to the discussion",
            "After the session, get scored on 4 dimensions",
          ].map((tip, i) => (
            <div key={i} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
              <div style={{ width: "18px", height: "18px", borderRadius: "50%", background: theme.primaryGlow, color: theme.primary, fontSize: "10px", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "1px" }}>{i + 1}</div>
              <span style={{ color: theme.textSecondary, fontSize: "13px" }}>{tip}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── Discussion screen ──────────────────────────────────────────────────────
  const finalTopic = customTopic.trim() || topic;

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      height: "calc(100vh - 20px)",
      maxWidth: "780px", margin: "0 auto",
      padding: "0 20px 20px",
      fontFamily: "'Inter','Segoe UI', sans-serif",
    }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-5px)} }
      `}</style>

      {/* Header */}
      <div style={{ padding: "16px 0 12px", borderBottom: `1px solid ${theme.border}`, marginBottom: "12px", flexShrink: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ display: "inline-block", background: theme.primaryGlow, color: theme.primary, border: `1px solid ${theme.primary}33`, padding: "2px 10px", borderRadius: "20px", fontSize: "10px", fontWeight: 700, letterSpacing: "1px", marginBottom: "4px" }}>
              GD IN PROGRESS
            </div>
            <h1 style={{ color: theme.textPrimary, fontWeight: 800, fontSize: "16px", margin: 0, maxWidth: "500px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {finalTopic}
            </h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ color: theme.textMuted, fontSize: "10px", fontWeight: 600 }}>YOUR TURNS</div>
              <div style={{ color: theme.primary, fontSize: "16px", fontWeight: 800, fontFamily: "monospace" }}>
                {turnCount}/{MAX_TURNS}
              </div>
            </div>
            <button onClick={restart} style={{
              background: "transparent", color: theme.textSecondary,
              border: `1px solid ${theme.border}`, borderRadius: "8px",
              padding: "5px 11px", fontSize: "12px", cursor: "pointer",
            }}>↺ End</button>
          </div>
        </div>

        {/* Turn progress bar */}
        <div style={{ height: "3px", background: theme.border, borderRadius: "3px", marginTop: "10px", overflow: "hidden" }}>
          <div style={{ height: "100%", background: `linear-gradient(90deg, ${theme.primary}, ${theme.accent1})`, width: `${(turnCount / MAX_TURNS) * 100}%`, transition: "width 0.4s ease", borderRadius: "3px" }} />
        </div>
      </div>

      {/* Participants row */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "12px", flexShrink: 0 }}>
        {PARTICIPANTS.map(p => (
          <div key={p.name} style={{
            display: "flex", alignItems: "center", gap: "6px",
            background: theme.surface, border: `1px solid ${theme.border}`,
            borderRadius: "20px", padding: "4px 10px 4px 4px",
          }}>
            <div style={{ width: "22px", height: "22px", borderRadius: "50%", background: p.color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: "10px" }}>
              {p.avatar}
            </div>
            <div>
              <div style={{ color: theme.textPrimary, fontSize: "10px", fontWeight: 600 }}>{p.name}</div>
              <div style={{ color: p.color, fontSize: "9px" }}>{p.role}</div>
            </div>
          </div>
        ))}
        <div style={{
          display: "flex", alignItems: "center", gap: "6px",
          background: theme.primaryGlow, border: `1px solid ${theme.primary}33`,
          borderRadius: "20px", padding: "4px 10px 4px 4px",
        }}>
          <div style={{ width: "22px", height: "22px", borderRadius: "50%", background: theme.primary, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: "10px" }}>
            Y
          </div>
          <div style={{ color: theme.primary, fontSize: "10px", fontWeight: 700 }}>You</div>
        </div>
      </div>

      {/* Chat messages */}
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px", padding: "4px 0", minHeight: 0 }}>
        {messages.map((msg, i) => {
          const isUser   = msg.role === "user";
          const isSystem = msg.role === "system";

          if (isSystem) return (
            <div key={i} style={{ textAlign: "center" }}>
              <span style={{ color: theme.textMuted, fontSize: "11px", background: theme.surface, padding: "4px 14px", borderRadius: "20px", border: `1px solid ${theme.border}` }}>
                {msg.text}
              </span>
            </div>
          );

          return (
            <div key={i} style={{
              display: "flex", gap: "10px", alignItems: "flex-start",
              flexDirection: isUser ? "row-reverse" : "row",
              animation: "fadeUp 0.2s ease forwards",
            }}>
              {/* Avatar */}
              <div style={{
                width: "34px", height: "34px", borderRadius: "50%", flexShrink: 0,
                background: msg.color || theme.primary,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontWeight: 800, fontSize: "13px",
              }}>{msg.avatar || "?"}</div>

              <div style={{ maxWidth: "70%", display: "flex", flexDirection: "column", gap: "3px", alignItems: isUser ? "flex-end" : "flex-start" }}>
                <div style={{ color: theme.textMuted, fontSize: "10px", fontWeight: 600 }}>
                  {msg.speaker}{msg.role && msg.role !== "user" ? ` · ${msg.role}` : ""}
                </div>
                <div style={{
                  padding: "10px 14px", borderRadius: isUser ? "18px 4px 18px 18px" : "4px 18px 18px 18px",
                  background: isUser
                    ? isDark ? "#1a2f52" : theme.primaryGlow
                    : theme.surface,
                  border: `1px solid ${isUser ? theme.primary + "44" : theme.border}`,
                }}>
                  <p style={{ color: theme.textPrimary, fontSize: "13.5px", lineHeight: "1.65", margin: 0 }}>{msg.text}</p>
                </div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
            <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: theme.border, display: "flex", alignItems: "center", justifyContent: "center", color: theme.textMuted, fontSize: "12px" }}>...</div>
            <div style={{ padding: "10px 14px", background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: "4px 18px 18px 18px" }}>
              <div style={{ display: "flex", gap: "4px" }}>
                {[0,1,2].map(i => (
                  <span key={i} style={{ width: "6px", height: "6px", borderRadius: "50%", background: theme.textMuted, display: "inline-block", animation: "bounce 1.1s infinite", animationDelay: `${i * 0.18}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      {turnCount < MAX_TURNS && (
        <div style={{ borderTop: `1px solid ${theme.border}`, paddingTop: "12px", flexShrink: 0 }}>
          <div style={{ color: theme.textMuted, fontSize: "11px", marginBottom: "8px", textAlign: "center" }}>
            Your turn to speak — {MAX_TURNS - turnCount} contributions remaining
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "flex-end" }}>
            <textarea
              ref={inputRef}
              rows={2}
              style={{
                flex: 1, background: theme.input, border: `1px solid ${theme.border}`,
                borderRadius: "12px", padding: "11px 15px", color: theme.textPrimary,
                fontSize: "14px", resize: "none", fontFamily: "inherit", lineHeight: "1.5",
                outline: "none", transition: "border-color 0.2s",
              }}
              placeholder="Share your point of view… (Enter to send)"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submitUserMessage(); } }}
              disabled={loading}
            />

            {/* Mic button */}
            <button onClick={listening ? stopVoice : startVoice} disabled={loading} style={{
              width: "44px", height: "44px", borderRadius: "12px",
              background: listening ? "linear-gradient(135deg,#ef4444,#dc2626)" : theme.input,
              color: listening ? "#fff" : theme.textSecondary,
              fontSize: "16px", cursor: loading ? "not-allowed" : "pointer",
              border: `1px solid ${listening ? "transparent" : theme.border}`,
              flexShrink: 0, transition: "all 0.2s",
            }}>{listening ? "⏹" : "🎤"}</button>

            {/* Send button */}
            <button onClick={submitUserMessage} disabled={!input.trim() || loading} style={{
              width: "44px", height: "44px", borderRadius: "12px", border: "none",
              background: !input.trim() || loading ? theme.border : `linear-gradient(135deg, ${theme.primary}, ${theme.accent1})`,
              color: !input.trim() || loading ? theme.textMuted : "#fff",
              fontSize: "18px", cursor: !input.trim() || loading ? "not-allowed" : "pointer",
              flexShrink: 0,
            }}>↑</button>
          </div>

          {listening && (
            <div style={{ textAlign: "center", padding: "6px 0", color: "#ef4444", fontSize: "12px", fontWeight: 600 }}>
              🔴 Listening… speak your point, click ⏹ when done
            </div>
          )}
        </div>
      )}

      {/* Result modal */}
      {phase === "result" && evaluation && (
        <EvaluationModal result={evaluation} topic={finalTopic} onRestart={restart} theme={theme} isDark={isDark} />
      )}
    </div>
  );
}