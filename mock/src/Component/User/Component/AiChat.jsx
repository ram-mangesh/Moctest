import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "../translation";
import api from "../../Api/axios";
import { Gamepad2 } from "lucide-react";
import ExamQuestGame from "../../Game/ExamQuestGame";

/* ─────────────────────────────────────────────
   FAB  — floating action button + label bubble
───────────────────────────────────────────── */
export function AiChatIcon({ onClick }) {
  const { t } = useTranslation();
  const [hovered, setHovered] = useState(false);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');

        @keyframes fab_float {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(-6px); }
        }
        @keyframes fab_pulse_ring {
          0%   { transform: scale(1);   opacity: .7; }
          100% { transform: scale(1.7); opacity: 0;  }
        }
        @keyframes fab_label_in {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0);   }
        }
        @keyframes fab_shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }

        .aifab-root {
          position: fixed; bottom: 28px; right: 28px;
          display: flex; flex-direction: column; align-items: center; gap: 8px;
          z-index: 300; font-family: 'Plus Jakarta Sans', sans-serif;
        }

        /* label bubble */
        .aifab-label {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: #fff; font-size: 11.5px; font-weight: 700;
          padding: 5px 14px; border-radius: 20px;
          box-shadow: 0 4px 18px rgba(99,102,241,.42);
          white-space: nowrap;
          transition: opacity .2s, transform .2s;
          animation: fab_float 3s ease-in-out infinite, fab_label_in .3s ease both;
          pointer-events: none;
          letter-spacing: .01em;
        }

        /* main FAB */
        .aifab-btn {
          width: 56px; height: 56px; border-radius: 50%;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 60%, #06b6d4 100%);
          background-size: 200% 200%;
          border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          font-size: 26px;
          box-shadow: 0 6px 28px rgba(99,102,241,.52);
          transition: transform .25s cubic-bezier(.34,1.56,.64,1), box-shadow .25s;
          animation: fab_float 3s ease-in-out infinite;
          position: relative; overflow: hidden;
        }
        .aifab-btn::before {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(120deg, transparent, rgba(255,255,255,.22), transparent);
          background-size: 200% 100%;
          animation: fab_shimmer 2.5s linear infinite;
        }
        .aifab-btn:hover {
          transform: scale(1.13) translateY(-3px);
          box-shadow: 0 10px 36px rgba(99,102,241,.6);
        }
        .aifab-btn:active { transform: scale(.96); }

        /* pulse ring */
        .aifab-ring {
          position: absolute; bottom: 0; right: 0;
          width: 56px; height: 56px; border-radius: 50%;
          border: 2px solid rgba(99,102,241,.38);
          animation: fab_pulse_ring 2.2s ease-out infinite;
          pointer-events: none;
        }
        .aifab-ring-2 {
          position: absolute; bottom: 0; right: 0;
          width: 56px; height: 56px; border-radius: 50%;
          border: 2px solid rgba(99,102,241,.22);
          animation: fab_pulse_ring 2.2s ease-out infinite .7s;
          pointer-events: none;
        }
      `}</style>

      <div className="aifab-root">
        <div
          className="aifab-label"
          style={{ opacity: hovered ? 1 : 0.88 }}
        >
          {t("ai.iconText", "Ask AI")} ✨
        </div>

        <div style={{ position: "relative" }}>
          <button
            className="aifab-btn"
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            title={t("ai.title", "AI Study Assistant")}
          >
            🤖
          </button>
          <div className="aifab-ring" />
          <div className="aifab-ring-2" />
        </div>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────
   SLIDER PANEL
───────────────────────────────────────────── */
export function AiChatSlider({ open, onClose }) {
  const { t } = useTranslation();

  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState("");
  const [showGame, setShowGame] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const username = localStorage.getItem("name") || "Student";
  const initial = username.charAt(0).toUpperCase();

  /* Welcome message */
  useEffect(() => {
    if (!open) return;
    const welcomed = localStorage.getItem("ai_welcomed");
    const welcome = !welcomed
      ? t("ai.welcomeFirst", { name: username })
      : t("ai.welcomeBack", { name: username });
    if (!welcomed) localStorage.setItem("ai_welcomed", "true");
    setMessages([{
      role: "ai", text: welcome,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }]);
    // focus input when panel opens
    setTimeout(() => inputRef.current?.focus(), 400);
  }, [open]);

  /* Auto-scroll */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing, loading]);

  const sendPrompt = async () => {
    if (!prompt.trim() || loading) return;
    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userMsg = { role: "user", text: prompt, time: now };
    setMessages(prev => [...prev, userMsg]);
    const sent = prompt;
    setPrompt("");
    setLoading(true);

    try {
      const res = await api.post("/user/ai/chat", sent, { headers: { "Content-Type": "text/plain" } });
      const fullText = res.data || t("ai.unavailable", "⚠️ AI unavailable");
      setLoading(false);
      setTyping("");
      let i = 0;
      const iv = setInterval(() => {
        i++;
        setTyping(fullText.slice(0, i));
        if (i >= fullText.length) {
          clearInterval(iv);
          setMessages(prev => [...prev, {
            role: "ai", text: fullText,
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          }]);
          setTyping("");
        }
      }, 11);
    } catch {
      setLoading(false);
      setMessages(prev => [...prev, {
        role: "ai",
        text: t("ai.unavailable", "⚠️ AI temporarily unavailable. Please try again."),
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }]);
    }
  };

  const quickPrompts = [
    { icon: "📚", text: "Explain percentage formula" },
    { icon: "🎯", text: "Give me 3 practice tips" },
    { icon: "📊", text: "What are my weak topics?" },
    { icon: "⚡", text: "Quick revision plan" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');

        /* keyframes */
        @keyframes aic_fadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes aic_fadeUp  { from{opacity:0;transform:translateY(9px)} to{opacity:1;transform:translateY(0)} }
        @keyframes aic_wiggle  { 0%,100%{transform:rotate(0)} 25%{transform:rotate(-7deg)} 75%{transform:rotate(7deg)} }
        @keyframes aic_blink   { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes aic_dot     { 0%,80%,100%{transform:scale(0);opacity:.35} 40%{transform:scale(1);opacity:1} }
        @keyframes aic_online  { 0%,100%{box-shadow:0 0 0 0 rgba(74,222,128,.5)} 50%{box-shadow:0 0 0 4px rgba(74,222,128,0)} }
        @keyframes aic_shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes aic_panel_in { from{transform:translateX(100%)} to{transform:translateX(0)} }

        /* ── backdrop ── */
        .aic-backdrop {
          position: fixed; inset: 0; z-index: 298;
          background: rgba(30,27,75,.3);
          backdrop-filter: blur(6px) saturate(140%);
          -webkit-backdrop-filter: blur(6px) saturate(140%);
          animation: aic_fadeIn .22s ease;
        }

        /* ── panel ── */
        .aic-panel {
          position: fixed; top: 0; right: 0; bottom: 0;
          width: 390px; z-index: 299;
          display: flex; flex-direction: column;
          background: rgba(248,249,255,.96);
          backdrop-filter: blur(32px) saturate(220%);
          -webkit-backdrop-filter: blur(32px) saturate(220%);
          border-left: 1.5px solid rgba(99,102,241,.15);
          box-shadow: -12px 0 60px rgba(99,102,241,.2), -2px 0 0 rgba(99,102,241,.06);
          transition: transform .38s cubic-bezier(.4,0,.2,1);
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .aic-panel.open  { transform: translateX(0); }
        .aic-panel.closed{ transform: translateX(100%); }

        /* ── header ── */
        .aic-header {
          padding: 16px 18px; flex-shrink: 0;
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 55%, #0284c7 100%);
          display: flex; align-items: center; justify-content: space-between;
          position: relative; overflow: hidden;
        }
        .aic-header::before {
          content: ''; position: absolute; right: -30px; top: -30px;
          width: 100px; height: 100px; border-radius: 50%;
          background: rgba(255,255,255,.07); pointer-events: none;
        }
        .aic-header::after {
          content: ''; position: absolute; right: 40px; bottom: -20px;
          width: 60px; height: 60px; border-radius: 50%;
          background: rgba(255,255,255,.05); pointer-events: none;
        }
        .aic-header-left { display:flex;align-items:center;gap:11px;position:relative; }
        .aic-bot-icon {
          width: 40px; height: 40px; border-radius: 12px;
          background: rgba(255,255,255,.18);
          border: 1.5px solid rgba(255,255,255,.28);
          display: flex; align-items: center; justify-content: center;
          font-size: 22px; animation: aic_wiggle 3s ease-in-out infinite;
          backdrop-filter: blur(6px);
        }
        .aic-header-name  { font-weight:800;color:#fff;font-size:14px;letter-spacing:-.01em; }
        .aic-header-status{
          font-size:11px;color:rgba(255,255,255,.78);
          display:flex;align-items:center;gap:5px;margin-top:2px;
        }
        .aic-online-dot {
          width:6px;height:6px;border-radius:50%;background:#4ade80;
          animation:aic_online 2s ease-in-out infinite;
        }
        .aic-close-btn {
          position: relative; z-index:1;
          width:30px;height:30px;border-radius:9px;
          background:rgba(255,255,255,.18);border:1.5px solid rgba(255,255,255,.22);
          cursor:pointer;color:#fff;font-size:16px;font-weight:300;
          display:flex;align-items:center;justify-content:center;
          transition:background .15s,transform .15s;
          line-height:1;
        }
        .aic-close-btn:hover {
          background:rgba(255,255,255,.3);
          transform:scale(1.08);
        }
        .aic-game-btn {
            background: rgba(255,255,255,.18);
            border: 1.5px solid rgba(255,255,255,.22);
            padding: 4px 8px; border-radius: 8px;
            color: #fff; font-size: 11px; font-weight: 700;
            display: flex; align-items: center; gap: 6px;
            transition: all .2s; cursor: pointer;
        }
        .aic-game-btn:hover {
            background: #fff; color: #4f46e5;
            transform: translateY(-1px);
        }

        /* ── messages area ── */
        .aic-messages {
          flex:1;overflow-y:auto;padding:18px 16px;
          display:flex;flex-direction:column;gap:14px;
          scroll-behavior:smooth;
        }
        .aic-messages::-webkit-scrollbar { width:4px; }
        .aic-messages::-webkit-scrollbar-track { background:transparent; }
        .aic-messages::-webkit-scrollbar-thumb { background:rgba(99,102,241,.2);border-radius:4px; }
        .aic-messages::-webkit-scrollbar-thumb:hover { background:rgba(99,102,241,.38); }

        /* message row */
        .aic-msg-row {
          display:flex;gap:9px;align-items:flex-end;
          animation:aic_fadeUp .28s ease both;
        }
        .aic-msg-row.user { flex-direction:row-reverse; }

        /* avatar */
        .aic-avatar {
          width:28px;height:28px;border-radius:50%;flex-shrink:0;
          display:flex;align-items:center;justify-content:center;
          font-size:13px;font-weight:800;color:#fff;
        }
        .aic-avatar.ai   { background:linear-gradient(135deg,#7c3aed,#06b6d4); }
        .aic-avatar.user { background:linear-gradient(135deg,#4f46e5,#7c3aed); }

        /* bubble */
        .aic-bubble {
          max-width:79%;padding:11px 14px;
          font-size:13px;line-height:1.68;font-weight:500;
          white-space:pre-wrap;word-break:break-word;
        }
        .aic-bubble.ai {
          background:rgba(238,240,255,.75);
          border:1.5px solid rgba(99,102,241,.14);
          border-radius:18px 18px 18px 4px;
          color:#1e1b4b;
          backdrop-filter:blur(10px);
          box-shadow:0 2px 10px rgba(99,102,241,.07);
        }
        .aic-bubble.user {
          background:linear-gradient(135deg,#4f46e5,#7c3aed);
          border-radius:18px 18px 4px 18px;
          color:#fff;
          box-shadow:0 4px 14px rgba(79,70,229,.35);
        }

        .aic-time {
          font-size:10px;color:rgba(99,102,241,.38);margin-top:4px;font-weight:500;
        }
        .aic-time.right { text-align:right; }

        /* typing bubble */
        .aic-typing-bubble {
          max-width:79%;padding:11px 14px;
          background:rgba(238,240,255,.75);
          border:1.5px solid rgba(99,102,241,.14);
          border-radius:18px 18px 18px 4px;
          font-size:13px;line-height:1.68;color:#1e1b4b;
          backdrop-filter:blur(10px);white-space:pre-wrap;word-break:break-word;
        }
        .aic-cursor {
          display:inline-block;margin-left:2px;color:#6366f1;
          animation:aic_blink .7s step-end infinite;
        }

        /* loading dots */
        .aic-dots-bubble {
          padding:12px 16px;
          background:rgba(238,240,255,.75);
          border:1.5px solid rgba(99,102,241,.14);
          border-radius:18px 18px 18px 4px;
          backdrop-filter:blur(10px);
          display:flex;gap:5px;align-items:center;
        }
        .aic-dot {
          width:7px;height:7px;border-radius:50%;background:#6366f1;
        }

        /* ── quick prompts ── */
        .aic-quick-wrap {
          padding:10px 14px;
          border-top:1.5px solid rgba(99,102,241,.1);
          display:flex;gap:6px;flex-wrap:wrap;flex-shrink:0;
          background:rgba(255,255,255,.6);backdrop-filter:blur(12px);
        }
        .aic-quick-eyebrow {
          width:100%;font-size:10px;font-weight:700;letter-spacing:.08em;
          text-transform:uppercase;color:rgba(99,102,241,.4);margin-bottom:2px;
        }
        .aic-quick-btn {
          font-size:11.5px;padding:5px 12px;border-radius:20px;
          background:rgba(238,240,255,.9);
          border:1.5px solid rgba(99,102,241,.15);
          color:rgba(67,56,202,.65);cursor:pointer;
          font-weight:600;font-family:'Plus Jakarta Sans',sans-serif;
          transition:all .18s;white-space:nowrap;
          box-shadow:0 1px 6px rgba(99,102,241,.07);
        }
        .aic-quick-btn:hover {
          border-color:#6366f1;color:#4f46e5;
          background:rgba(99,102,241,.1);
          transform:translateY(-1px);
          box-shadow:0 3px 12px rgba(99,102,241,.18);
        }

        /* ── input area ── */
        .aic-input-area {
          padding:12px 14px;
          border-top:1.5px solid rgba(99,102,241,.1);
          display:flex;gap:9px;align-items:flex-end;flex-shrink:0;
          background:rgba(255,255,255,.82);
          backdrop-filter:blur(18px);
        }
        .aic-textarea {
          flex:1;
          background:rgba(238,240,255,.65);
          border:1.5px solid rgba(99,102,241,.16);
          border-radius:14px;
          padding:9px 13px;
          color:#1e1b4b;font-family:'Plus Jakarta Sans',sans-serif;
          font-size:13px;font-weight:500;
          outline:none;resize:none;
          max-height:100px;overflow-y:auto;
          transition:border-color .2s,box-shadow .2s,background .2s;
          line-height:1.55;
        }
        .aic-textarea:focus {
          border-color:#6366f1;
          background:rgba(255,255,255,.9);
          box-shadow:0 0 0 3px rgba(99,102,241,.12);
        }
        .aic-textarea::placeholder { color:rgba(99,102,241,.38); }

        .aic-send-btn {
          width:40px;height:40px;border-radius:12px;border:none;
          display:flex;align-items:center;justify-content:center;
          flex-shrink:0;cursor:pointer;transition:all .22s;
          font-size:16px;font-weight:700;color:#fff;
          position:relative;overflow:hidden;
        }
        .aic-send-btn.active {
          background:linear-gradient(135deg,#4f46e5,#7c3aed);
          box-shadow:0 4px 16px rgba(79,70,229,.42);
        }
        .aic-send-btn.active::before {
          content:'';position:absolute;inset:0;
          background:linear-gradient(120deg,transparent,rgba(255,255,255,.22),transparent);
          transform:translateX(-100%);transition:transform .5s;
        }
        .aic-send-btn.active:hover::before { transform:translateX(100%); }
        .aic-send-btn.active:hover {
          transform:translateY(-2px) scale(1.05);
          box-shadow:0 6px 22px rgba(79,70,229,.5);
        }
        .aic-send-btn.active:active { transform:scale(.96); }
        .aic-send-btn.disabled {
          background:rgba(99,102,241,.14);cursor:not-allowed;color:rgba(99,102,241,.38);
        }

        /* char counter */
        .aic-char-count {
          font-size:10px;color:rgba(99,102,241,.32);
          text-align:right;margin-top:3px;font-weight:600;
          padding:0 2px;
        }
      `}</style>

      {/* Backdrop */}
      {open && <div className="aic-backdrop" onClick={onClose} />}

      {/* Panel */}
      <div className={`aic-panel ${open ? "open" : "closed"}`}>

        {showGame ? (
          <ExamQuestGame onClose={() => setShowGame(false)} />
        ) : (
          <>
            {/* ── Header ── */}
            <div className="aic-header">
              <div className="aic-header-left">
                <div className="aic-bot-icon">🤖</div>
                <div>
                  <div className="aic-header-name">{t("ai.title", "AI Study Assistant")}</div>
                  <div className="aic-header-status">
                    <span className="aic-online-dot" />
                    Online & Ready
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  className="aic-game-btn"
                  onClick={() => setShowGame(true)}
                  title="Boost Focus Game"
                >
                  <Gamepad2 size={14} /> Focus
                </button>
                <button
                  className="aic-close-btn"
                  onClick={onClose}
                  aria-label="Close"
                >✕</button>
              </div>
            </div>

            {/* ── Messages ── */}
            <div className="aic-messages">
              {messages.map((m, i) => (
                <div key={i} className={`aic-msg-row${m.role === "user" ? " user" : ""}`}>
                  <div className={`aic-avatar ${m.role}`}>
                    {m.role === "user" ? initial : "🤖"}
                  </div>
                  <div>
                    <div className={`aic-bubble ${m.role}`}>{m.text}</div>
                    <div className={`aic-time${m.role === "user" ? " right" : ""}`}>
                      {m.time}
                    </div>
                  </div>
                </div>
              ))}

              {/* Typing effect */}
              {typing && (
                <div className="aic-msg-row" style={{ animation: "aic_fadeUp .2s ease" }}>
                  <div className="aic-avatar ai">🤖</div>
                  <div>
                    <div className="aic-typing-bubble">
                      {typing}<span className="aic-cursor">▌</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Loading dots */}
              {loading && !typing && (
                <div className="aic-msg-row" style={{ animation: "aic_fadeUp .2s ease" }}>
                  <div className="aic-avatar ai">🤖</div>
                  <div className="aic-dots-bubble">
                    {[0, 1, 2].map(i => (
                      <div
                        key={i}
                        className="aic-dot"
                        style={{ animation: `aic_dot 1.2s ease-in-out ${i * 0.2}s infinite` }}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* ── Quick prompts ── */}
            {messages.length <= 1 && (
              <div className="aic-quick-wrap">
                <div className="aic-quick-eyebrow">Quick prompts</div>
                {quickPrompts.map((q, i) => (
                  <button
                    key={i}
                    className="aic-quick-btn"
                    onClick={() => {
                      setPrompt(q.text);
                      inputRef.current?.focus();
                    }}
                  >
                    {q.icon} {q.text}
                  </button>
                ))}
              </div>
            )}

            {/* ── Input ── */}
            <div className="aic-input-area">
              <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                <textarea
                  ref={inputRef}
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendPrompt();
                    }
                  }}
                  placeholder={t("ai.placeholder", "Ask anything about your exam…")}
                  rows={1}
                  className="aic-textarea"
                />
                {prompt.length > 80 && (
                  <div className="aic-char-count">{prompt.length} chars</div>
                )}
              </div>
              <button
                onClick={sendPrompt}
                disabled={loading || !prompt.trim()}
                className={`aic-send-btn ${loading || !prompt.trim() ? "disabled" : "active"}`}
                title="Send (Enter)"
              >
                {loading ? (
                  <div style={{
                    width: 14, height: 14, borderRadius: "50%",
                    border: "2px solid rgba(99,102,241,.3)",
                    borderTopColor: "#6366f1",
                    animation: "aic_dot 0.7s linear infinite",
                  }} />
                ) : "➤"}
              </button>
            </div>
          </>
        )}

      </div>
    </>
  );
}