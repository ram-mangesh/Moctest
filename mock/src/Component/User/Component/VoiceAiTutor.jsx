import { useState, useRef, useEffect } from "react";
import api from "../../Api/axios";

const SCREEN = { IDLE: "idle", CALLING: "calling", ACTIVE: "active" };
const MIC    = { IDLE: "idle", LISTENING: "listening", THINKING: "thinking", SPEAKING: "speaking" };

const fmtTime = (s) =>
  `${String(Math.floor(s / 60)).padStart(2,"0")}:${String(s % 60).padStart(2,"0")}`;

const fmtCallDate = (ts) => {
  if (!ts) return "";
  const d = new Date(ts), now = new Date(), yest = new Date(now);
  yest.setDate(yest.getDate() - 1);
  if (d.toDateString() === now.toDateString())
    return d.toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit" });
  if (d.toDateString() === yest.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-IN", { day:"numeric", month:"short" });
};

/* ── CSS injected once ── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,400&display=swap');

:root {
  --vat-bg:    linear-gradient(148deg,#f0f2ff 0%,#eaedff 28%,#f2ecff 60%,#fcedf6 88%,#f5f0ff 100%);
  --vat-glass: rgba(255,255,255,.86);
  --vat-glass2:rgba(255,255,255,.72);
  --vat-border:rgba(99,102,241,.14);
  --vat-border2:rgba(99,102,241,.22);
  --vat-ink:   #1a1740;
  --vat-ink2:  rgba(67,56,202,.65);
  --vat-ink3:  rgba(99,102,241,.42);
  --vat-a:     #4f46e5;
  --vat-grad:  linear-gradient(135deg,#4f46e5 0%,#7c3aed 55%,#0284c7 100%);
  --vat-sh:    0 8px 40px rgba(99,102,241,.14),inset 0 1px 0 rgba(255,255,255,.95);
  --vat-sh2:   0 20px 60px rgba(99,102,241,.18),inset 0 1px 0 rgba(255,255,255,.95);
}

@keyframes vat_fadeIn  { from{opacity:0}                             to{opacity:1} }
@keyframes vat_up      { from{opacity:0;transform:translateY(16px)}  to{opacity:1;transform:translateY(0)} }
@keyframes vat_pop     { from{opacity:0;transform:scale(.88)}        to{opacity:1;transform:scale(1)} }
@keyframes vat_float   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
@keyframes vat_pulse   { 0%{transform:scale(1);opacity:.6} 100%{transform:scale(1.8);opacity:0} }
@keyframes vat_pulse2  { 0%{transform:scale(1);opacity:.38} 100%{transform:scale(2.1);opacity:0} }
@keyframes vat_ring1   { 0%,100%{transform:scale(1);opacity:.5}  50%{transform:scale(1.38);opacity:0} }
@keyframes vat_ring2   { 0%,100%{transform:scale(1);opacity:.32} 50%{transform:scale(1.7);opacity:0} }
@keyframes vat_ring3   { 0%,100%{transform:scale(1);opacity:.18} 50%{transform:scale(2.0);opacity:0} }
@keyframes vat_wv_big  { 0%,100%{height:8px}  50%{height:28px} }
@keyframes vat_wv_med  { 0%,100%{height:8px}  50%{height:20px} }
@keyframes vat_wv_sml  { 0%,100%{height:8px}  50%{height:14px} }
@keyframes vat_wvl_big { 0%,100%{height:8px}  50%{height:22px} }
@keyframes vat_wvl_med { 0%,100%{height:8px}  50%{height:16px} }
@keyframes vat_gmic    { 0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,.48)} 50%{box-shadow:0 0 0 18px rgba(239,68,68,0)} }
@keyframes vat_online  { 0%,100%{box-shadow:0 0 0 0 rgba(52,211,153,.5)} 50%{box-shadow:0 0 0 5px rgba(52,211,153,0)} }
@keyframes vat_shimmer { 0%{background-position:-250% 0} 100%{background-position:250% 0} }
@keyframes vat_blink   { 0%,100%{opacity:1} 50%{opacity:0} }
@keyframes vat_orb1    { 0%{transform:translate(0,0)scale(1)} 100%{transform:translate(55px,70px)scale(1.1)} }
@keyframes vat_orb2    { 0%{transform:translate(0,0)scale(1)} 100%{transform:translate(-45px,55px)scale(1.08)} }
@keyframes vat_slideup { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
@keyframes vat_dots    { 0%,80%,100%{transform:scale(0);opacity:.35} 40%{transform:scale(1);opacity:1} }

/* waveform — speaking */
.vat-wave-spk .vb1{animation:vat_wv_big  .6s ease-in-out infinite}
.vat-wave-spk .vb2{animation:vat_wv_med  .6s ease-in-out infinite .08s}
.vat-wave-spk .vb3{animation:vat_wv_sml  .6s ease-in-out infinite .16s}
.vat-wave-spk .vb4{animation:vat_wv_big  .6s ease-in-out infinite .04s}
.vat-wave-spk .vb5{animation:vat_wv_sml  .6s ease-in-out infinite .12s}
.vat-wave-spk .vb6{animation:vat_wv_med  .6s ease-in-out infinite .2s}
.vat-wave-spk .vb7{animation:vat_wv_big  .6s ease-in-out infinite .06s}
/* waveform — listening */
.vat-wave-lis .vb1{animation:vat_wvl_big .45s ease-in-out infinite}
.vat-wave-lis .vb2{animation:vat_wvl_med .45s ease-in-out infinite .07s}
.vat-wave-lis .vb3{animation:vat_wvl_big .45s ease-in-out infinite .14s}
.vat-wave-lis .vb4{animation:vat_wvl_med .45s ease-in-out infinite .05s}
.vat-wave-lis .vb5{animation:vat_wvl_big .45s ease-in-out infinite .11s}
.vat-wave-lis .vb6{animation:vat_wvl_med .45s ease-in-out infinite .19s}
.vat-wave-lis .vb7{animation:vat_wvl_big .45s ease-in-out infinite .09s}

/* shared page root */
.vat-root {
  position:fixed; inset:0; z-index:9999;
  background:var(--vat-bg);
  font-family:'Plus Jakarta Sans',sans-serif;
  overflow:hidden;
}
/* background layer */
.vat-bglayer { position:absolute; inset:0; pointer-events:none; overflow:hidden; }
.vat-orb {
  position:absolute; border-radius:50%; filter:blur(72px);
}
.vat-orb1 { width:560px;height:560px;top:-160px;left:-100px; background:radial-gradient(circle,rgba(99,102,241,.18)0%,transparent 65%); animation:vat_orb1 22s ease-in-out infinite alternate; }
.vat-orb2 { width:460px;height:460px;bottom:-100px;right:-80px; background:radial-gradient(circle,rgba(168,85,247,.14)0%,transparent 65%); animation:vat_orb2 26s ease-in-out infinite alternate 5s; }
.vat-orb3 { width:320px;height:320px;top:38%;left:42%; background:radial-gradient(circle,rgba(236,72,153,.09)0%,transparent 65%); animation:vat_orb1 18s ease-in-out infinite alternate 9s; }
.vat-dotgrid {
  position:absolute;inset:0;
  background-image:radial-gradient(circle,rgba(99,102,241,.13) 1px,transparent 1px);
  background-size:30px 30px; opacity:.22;
}
/* glass card */
.vat-card {
  background:var(--vat-glass);
  backdrop-filter:blur(28px) saturate(200%);
  -webkit-backdrop-filter:blur(28px) saturate(200%);
  border:1.5px solid var(--vat-border);
  border-radius:24px;
  box-shadow:var(--vat-sh);
  position:relative; overflow:hidden;
}
.vat-card::before {
  content:''; position:absolute; top:0; left:0; right:0; height:3px;
  background:var(--vat-grad); border-radius:24px 24px 0 0;
}
/* pill badge */
.vat-pill {
  display:inline-flex;align-items:center;gap:6px;
  font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;
  background:rgba(99,102,241,.09);border:1.5px solid rgba(99,102,241,.18);
  border-radius:20px;padding:4px 13px;color:var(--vat-a);
}
/* glass button base */
.vat-glass-btn {
  background:var(--vat-glass2);
  backdrop-filter:blur(14px);
  border:1.5px solid var(--vat-border);
  border-radius:14px; cursor:pointer;
  font-family:'Plus Jakarta Sans',sans-serif;
  transition:all .2s;
  display:flex;align-items:center;justify-content:center;
}
.vat-glass-btn:hover { border-color:var(--vat-border2); transform:translateY(-1px); background:rgba(255,255,255,.92); }
/* gradient btn */
.vat-grad-btn {
  background:var(--vat-grad);
  border:none;border-radius:14px;cursor:pointer;color:#fff;
  font-family:'Plus Jakarta Sans',sans-serif;font-weight:700;
  box-shadow:0 4px 18px rgba(79,70,229,.36);
  transition:all .22s;position:relative;overflow:hidden;
}
.vat-grad-btn::before {
  content:'';position:absolute;inset:0;
  background:linear-gradient(120deg,transparent,rgba(255,255,255,.2),transparent);
  transform:translateX(-100%);transition:transform .5s;
}
.vat-grad-btn:hover::before { transform:translateX(100%); }
.vat-grad-btn:hover { transform:translateY(-2px);box-shadow:0 8px 28px rgba(79,70,229,.48); }
.vat-grad-btn:active { transform:scale(.97); }

/* ── IDLE FAB ── */
.vat-fab {
  position:fixed;bottom:88px;right:22px;z-index:40;
  width:60px;height:60px;border-radius:50%;border:none;cursor:pointer;
  background:var(--vat-grad);color:white;font-size:26px;
  display:flex;align-items:center;justify-content:center;
  box-shadow:0 6px 28px rgba(79,70,229,.5);
  transition:all .25s cubic-bezier(.34,1.56,.64,1);
  animation:vat_float 3.5s ease-in-out infinite;
  overflow:hidden; position:relative;
}
.vat-fab-shimmer {
  position:absolute;inset:0;border-radius:50%;
  background:linear-gradient(120deg,transparent,rgba(255,255,255,.24),transparent);
  background-size:250% 100%;
  animation:vat_shimmer 2.8s linear infinite;
}
.vat-fab:hover { transform:translateY(-3px) scale(1.1);box-shadow:0 10px 36px rgba(79,70,229,.62); }
.vat-fab-ring { position:fixed;bottom:88px;right:22px;z-index:39;width:60px;height:60px;border-radius:50%;border:2px solid rgba(99,102,241,.35);animation:vat_pulse 2.2s ease-out infinite;pointer-events:none; }
.vat-fab-ring2{ position:fixed;bottom:88px;right:22px;z-index:38;width:60px;height:60px;border-radius:50%;border:2px solid rgba(99,102,241,.18);animation:vat_pulse2 2.2s ease-out infinite .7s;pointer-events:none; }
.vat-hist-btn {
  position:fixed;bottom:160px;right:22px;z-index:40;
  width:46px;height:46px;border-radius:14px;cursor:pointer;font-size:18px;
  background:rgba(255,255,255,.82);backdrop-filter:blur(16px);
  border:1.5px solid rgba(99,102,241,.16);color:rgba(79,70,229,.7);
  display:flex;align-items:center;justify-content:center;
  box-shadow:0 4px 16px rgba(99,102,241,.12);transition:all .2s;
}
.vat-hist-btn:hover { background:rgba(238,240,255,.95);border-color:rgba(99,102,241,.34);transform:translateY(-1px); }

/* ── LOGS PANEL ── */
.vat-logs {
  position:fixed;bottom:218px;right:16px;z-index:50;width:310px;
  background:rgba(255,255,255,.94);
  backdrop-filter:blur(32px) saturate(220%);
  -webkit-backdrop-filter:blur(32px) saturate(220%);
  border:1.5px solid var(--vat-border);
  border-radius:22px;overflow:hidden;
  box-shadow:var(--vat-sh2);
  animation:vat_pop .3s cubic-bezier(.34,1.56,.64,1) both;
  font-family:'Plus Jakarta Sans',sans-serif;
}
.vat-logs-hdr {
  padding:14px 16px 10px;
  background:linear-gradient(135deg,rgba(238,240,255,.7),rgba(232,236,255,.5));
  border-bottom:1px solid rgba(99,102,241,.09);
  display:flex;align-items:center;justify-content:space-between;
}
.vat-logs-scroll { max-height:264px;overflow-y:auto; }
.vat-logs-scroll::-webkit-scrollbar { width:4px; }
.vat-logs-scroll::-webkit-scrollbar-track { background:transparent; }
.vat-logs-scroll::-webkit-scrollbar-thumb { background:rgba(99,102,241,.2);border-radius:4px; }
.vat-log-row {
  display:flex;align-items:center;gap:11px;
  padding:11px 16px;border-bottom:1px solid rgba(99,102,241,.06);
  cursor:pointer;transition:background .15s;
}
.vat-log-row:last-child { border-bottom:none; }
.vat-log-row:hover { background:rgba(99,102,241,.04); }
.vat-log-av {
  width:40px;height:40px;border-radius:13px;flex-shrink:0;
  background:var(--vat-grad);
  display:flex;align-items:center;justify-content:center;font-size:18px;
  box-shadow:0 3px 12px rgba(79,70,229,.28);
}

/* ── ACTIVE CALL — top bar ── */
.vat-topbar {
  display:flex;align-items:center;justify-content:space-between;
  padding:18px 22px 0; position:relative; z-index:1;
}
/* ── ACTIVE CALL — main body ── */
.vat-body {
  flex:1;display:flex;flex-direction:column;align-items:center;
  justify-content:center;width:100%;max-width:440px;
  padding:12px 22px 0;position:relative;z-index:1;margin:0 auto;
}
/* ── ACTIVE CALL — avatar card ── */
.vat-av-card {
  width:100%;padding:24px 28px;text-align:center;
  background:var(--vat-glass);
  backdrop-filter:blur(28px) saturate(200%);
  -webkit-backdrop-filter:blur(28px) saturate(200%);
  border:1.5px solid var(--vat-border);border-radius:24px;
  box-shadow:var(--vat-sh);position:relative;overflow:hidden;
  transition:box-shadow .5s;
}
.vat-av-card::before {
  content:'';position:absolute;top:0;left:0;right:0;height:3px;
  background:var(--vat-grad);border-radius:24px 24px 0 0;
}
.vat-av-ring {
  width:92px;height:92px;border-radius:50%;
  background:var(--vat-grad);
  display:flex;align-items:center;justify-content:center;font-size:44px;
  margin:0 auto 14px;position:relative;
  box-shadow:0 8px 28px rgba(79,70,229,.32);
  transition:box-shadow .5s;
}
/* info bubble */
.vat-info-bubble {
  background:rgba(255,255,255,.82);
  backdrop-filter:blur(14px);
  border:1.5px solid var(--vat-border);
  border-radius:15px;padding:12px 16px;width:100%;
  box-shadow:0 3px 16px rgba(99,102,241,.09);
  animation:vat_slideup .25s ease both;
}
.vat-info-label {
  font-size:10px;font-weight:700;letter-spacing:.09em;text-transform:uppercase;
  color:var(--vat-ink3);margin-bottom:5px;
}
/* waveform container */
.vat-wave-wrap {
  display:flex;align-items:center;gap:5px;height:38px;
}
.vat-bar {
  width:4px;border-radius:3px;height:8px;
  transition:background .3s;
}
/* ── CONTROLS ── */
.vat-ctrl-row {
  display:flex;justify-content:center;gap:18px;margin-bottom:18px;
}
.vat-ctrl-btn {
  display:flex;flex-direction:column;align-items:center;gap:6px;
  cursor:pointer;
}
.vat-ctrl-icon {
  width:56px;height:56px;border-radius:18px;
  display:flex;align-items:center;justify-content:center;font-size:22px;
  background:rgba(255,255,255,.78);
  backdrop-filter:blur(14px);
  border:1.5px solid rgba(99,102,241,.15);
  transition:all .2s;
  box-shadow:0 3px 14px rgba(99,102,241,.1);
}
.vat-ctrl-icon:hover { transform:translateY(-2px);box-shadow:0 6px 20px rgba(99,102,241,.18); }
.vat-ctrl-lbl { font-size:10.5px;font-weight:600;color:var(--vat-ink3);letter-spacing:.02em; }
/* mic + end */
.vat-action-row { display:flex;align-items:center;justify-content:center;gap:48px;padding:0 22px; }
.vat-mic-btn {
  width:80px;height:80px;border-radius:50%;border:none;
  display:flex;align-items:center;justify-content:center;font-size:32px;
  cursor:pointer;transition:all .25s;
  background:rgba(255,255,255,.82);
  backdrop-filter:blur(16px);
}
.vat-end-btn {
  width:80px;height:80px;border-radius:50%;border:none;cursor:pointer;
  display:flex;align-items:center;justify-content:center;font-size:32px;
  background:rgba(254,242,242,.9);
  backdrop-filter:blur(16px);
  outline:2px solid rgba(239,68,68,.28);
  box-shadow:0 6px 24px rgba(239,68,68,.18);
  transition:all .22s;color:#ef4444;
}
.vat-end-btn:hover { background:rgba(254,226,226,.95);transform:scale(1.07);box-shadow:0 10px 32px rgba(239,68,68,.3); }
/* typed input */
.vat-type-row { display:flex;gap:8px;width:100%;animation:vat_slideup .2s ease both; }
.vat-type-input {
  flex:1;background:rgba(255,255,255,.88);backdrop-filter:blur(14px);
  border:1.5px solid var(--vat-border);border-radius:14px;
  padding:11px 14px;color:var(--vat-ink);font-size:13.5px;font-weight:500;
  outline:none;font-family:'Plus Jakarta Sans',sans-serif;
  transition:border-color .2s,box-shadow .2s;
}
.vat-type-input:focus { border-color:var(--vat-a);box-shadow:0 0 0 3px rgba(99,102,241,.12); }
.vat-type-input::placeholder { color:var(--vat-ink3); }
/* settings panel */
.vat-settings {
  width:calc(100% - 44px);max-width:420px;margin:10px auto 0;
  background:rgba(255,255,255,.9);backdrop-filter:blur(22px);
  border:1.5px solid var(--vat-border);border-radius:18px;
  padding:16px 20px;
  box-shadow:var(--vat-sh);
  animation:vat_slideup .22s ease both;
  position:relative;z-index:2;
}
`;

const VoiceAiTutor = () => {
  const [screen,        setScreen]     = useState(SCREEN.IDLE);
  const [micState,      setMicState]   = useState(MIC.IDLE);
  const [open,          setOpen]       = useState(false);
  const [studentName,   setName]       = useState("");
  const [callTimer,     setCallTimer]  = useState(0);
  const [muted,         setMuted]      = useState(false);
  const [speakerOn,     setSpeaker]    = useState(true);
  const [transcript,    setTranscript] = useState("");
  const [lastResponse,  setLastResp]   = useState("");
  const [typedQ,        setTypedQ]     = useState("");
  const [showType,      setShowType]   = useState(false);
  const [volume,        setVolume]     = useState(1);
  const [rate,          setRate]       = useState(0.9);
  const [showSettings,  setShowSettings] = useState(false);
  const [callLogs,      setCallLogs]   = useState(() => {
    try { return JSON.parse(localStorage.getItem("ai_call_logs") || "[]"); } catch { return []; }
  });

  const recognitionRef = useRef(null);
  const synthRef       = useRef(window.speechSynthesis);
  const transcriptRef  = useRef("");
  const timerRef       = useRef(null);
  const speakerRef     = useRef(speakerOn);
  const volumeRef      = useRef(volume);
  const rateRef        = useRef(rate);
  const mutedRef       = useRef(muted);

  useEffect(() => { speakerRef.current = speakerOn; }, [speakerOn]);
  useEffect(() => { volumeRef.current  = volume;    }, [volume]);
  useEffect(() => { rateRef.current    = rate;      }, [rate]);
  useEffect(() => { mutedRef.current   = muted;     }, [muted]);

  useEffect(() => {
    const cached = localStorage.getItem("name");
    if (cached) setName(cached);
    api.get("/user/ai/teacher-context")
      .then(r => setName(r.data.name || cached || "Student"))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (screen === SCREEN.ACTIVE) {
      timerRef.current = setInterval(() => setCallTimer(t => t + 1), 1000);
    } else {
      clearInterval(timerRef.current);
      if (screen !== SCREEN.ACTIVE) setCallTimer(0);
    }
    return () => clearInterval(timerRef.current);
  }, [screen]);

  useEffect(() => () => stopAll(), []);

  const stopAll = () => {
    try { recognitionRef.current?.stop(); } catch {}
    synthRef.current?.cancel();
  };

  const speakFn = (text) => {
    if (!synthRef.current) return;
    synthRef.current.cancel();
    const clean = text.replace(/[*#_`~>]/g,"").replace(/\n+/g,". ").trim().substring(0,1200);
    const u = new SpeechSynthesisUtterance(clean);
    u.volume = volumeRef.current; u.rate = rateRef.current; u.pitch = 1.05; u.lang = "en-IN";
    const vs = synthRef.current.getVoices();
    const v  = vs.find(v=>v.lang==="en-IN") || vs.find(v=>v.name.toLowerCase().includes("india"))
             || vs.find(v=>v.lang.startsWith("en-GB")) || vs.find(v=>v.lang.startsWith("en"));
    if (v) u.voice = v;
    u.onstart = () => setMicState(MIC.SPEAKING);
    u.onend   = () => { setMicState(MIC.IDLE); setTranscript(""); };
    u.onerror = () => { setMicState(MIC.IDLE); setTranscript(""); };
    synthRef.current.speak(u);
    setMicState(MIC.SPEAKING);
  };
  const speakRef = useRef(speakFn); speakRef.current = speakFn;

  const askFn = async (text) => {
    if (!text.trim()) return;
    setMicState(MIC.THINKING); setTranscript(text);
    try {
      const res    = await api.post("/user/ai/teacher-call", text, { headers:{ "Content-Type":"text/plain" } });
      const answer = typeof res.data === "string" ? res.data : JSON.stringify(res.data);
      setLastResp(answer);
      if (speakerRef.current) speakRef.current(answer);
      else { setMicState(MIC.IDLE); setTranscript(""); }
    } catch { speakRef.current("Sorry, I could not connect. Please try again."); }
  };
  const askRef = useRef(askFn); askRef.current = askFn;

  const startListening = () => {
    if (mutedRef.current) return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert("Speech recognition not supported. Use keyboard."); return; }
    synthRef.current?.cancel(); transcriptRef.current = ""; setTranscript("");
    const rec = new SR(); rec.lang="en-IN"; rec.interimResults=true; rec.continuous=false;
    rec.onresult = e => { const t=Array.from(e.results).map(r=>r[0].transcript).join(" "); setTranscript(t); transcriptRef.current=t; };
    rec.onend    = () => { const f=transcriptRef.current.trim(); if (f) askRef.current(f); else setMicState(MIC.IDLE); };
    rec.onerror  = e => { if (e.error==="not-allowed") alert("Microphone access denied."); setMicState(MIC.IDLE); };
    recognitionRef.current = rec; rec.start(); setMicState(MIC.LISTENING);
  };
  const stopListening = () => { try { recognitionRef.current?.stop(); } catch {} setMicState(MIC.IDLE); };
  const toggleMic = () => {
    if (micState === MIC.LISTENING) { stopListening(); return; }
    if (micState === MIC.SPEAKING)  { synthRef.current?.cancel(); setMicState(MIC.IDLE); return; }
    if (micState === MIC.THINKING)  return;
    startListening();
  };

  const startCall = () => {
    setScreen(SCREEN.CALLING); setMicState(MIC.IDLE);
    setTranscript(""); setLastResp(""); setShowType(false);
    setTimeout(() => setScreen(SCREEN.ACTIVE), 1900);
  };

  const handleGreet = () => speakRef.current(
    `Hello ${studentName}! I am your personalised AI Teacher. I have already reviewed your exam history and performance. You can ask me about your weak topics, study plans, or any concept.`
  );

  const endCall = () => {
    stopAll();
    const log = { id:Date.now(), timestamp:Date.now(), duration:callTimer, lastTopic: lastResponse ? lastResponse.substring(0,65)+(lastResponse.length>65?"...":"") : "AI Teacher call" };
    const updated = [log,...callLogs].slice(0,20);
    setCallLogs(updated); localStorage.setItem("ai_call_logs",JSON.stringify(updated));
    setScreen(SCREEN.IDLE); setMicState(MIC.IDLE); setMuted(false); setTranscript(""); setShowType(false);
  };

  const handleTypedSend = () => {
    const t=typedQ.trim(); if (!t || micState===MIC.THINKING) return;
    setTypedQ(""); setShowType(false); askRef.current(t);
  };

  /* ── derived mic ui ── */
  const micColor  = micState===MIC.LISTENING?"rgba(239,68,68,.85)":micState===MIC.SPEAKING?"rgba(5,150,105,.85)":micState===MIC.THINKING?"rgba(217,119,6,.85)":"rgba(79,70,229,.75)";
  const micBgGlass= micState===MIC.LISTENING?"rgba(254,242,242,.88)":micState===MIC.SPEAKING?"rgba(240,253,244,.88)":micState===MIC.THINKING?"rgba(255,251,235,.88)":"rgba(255,255,255,.82)";
  const micOutline= micState===MIC.LISTENING?"rgba(239,68,68,.35)":micState===MIC.SPEAKING?"rgba(5,150,105,.3)":micState===MIC.THINKING?"rgba(217,119,6,.28)":"rgba(99,102,241,.2)";
  const micIcon   = micState===MIC.LISTENING?"🔴":micState===MIC.SPEAKING?"🔊":micState===MIC.THINKING?"⏳":"🎙️";
  const statusTxt = micState===MIC.LISTENING?"Listening… speak now":micState===MIC.THINKING?"AI Teacher is thinking…":micState===MIC.SPEAKING?"Speaking… tap to stop":"Tap the mic to ask a question";
  const statusColor=micState===MIC.LISTENING?"#dc2626":micState===MIC.THINKING?"#d97706":micState===MIC.SPEAKING?"#059669":"rgba(67,56,202,.5)";
  const waveClass = micState===MIC.SPEAKING?"vat-wave-spk":micState===MIC.LISTENING?"vat-wave-lis":"";
  const barColor  = micState===MIC.SPEAKING?"rgba(79,70,229,.7)":micState===MIC.LISTENING?"rgba(239,68,68,.65)":micState===MIC.THINKING?"rgba(217,119,6,.5)":"rgba(99,102,241,.2)";

  /* ============================================================
     CALLING SCREEN
  ============================================================ */
  if (screen === SCREEN.CALLING) return (
    <div className="vat-root" style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
      <style>{CSS}</style>
      <div className="vat-bglayer">
        <div className="vat-orb vat-orb1" /><div className="vat-orb vat-orb2" /><div className="vat-orb vat-orb3" />
        <div className="vat-dotgrid" />
      </div>

      {/* calling card */}
      <div className="vat-card" style={{ padding:"48px 56px 42px", textAlign:"center", maxWidth:360, width:"90%", animation:"vat_pop .45s cubic-bezier(.34,1.56,.64,1) both" }}>

        {/* rings + avatar */}
        <div style={{ position:"relative", width:128, height:128, margin:"0 auto 28px" }}>
          <div style={{ position:"absolute", inset:"-54px", borderRadius:"50%", background:"rgba(99,102,241,.06)", animation:"vat_ring3 2.5s ease-out infinite" }} />
          <div style={{ position:"absolute", inset:"-32px", borderRadius:"50%", background:"rgba(99,102,241,.1)",  animation:"vat_ring2 2.5s ease-out infinite .35s" }} />
          <div style={{ position:"absolute", inset:"-14px", borderRadius:"50%", background:"rgba(99,102,241,.15)", animation:"vat_ring1 2.5s ease-out infinite .7s" }} />
          <div style={{
            width:128, height:128, borderRadius:"50%",
            background:"linear-gradient(135deg,#4f46e5,#7c3aed)",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:58, position:"relative", zIndex:2,
            boxShadow:"0 12px 40px rgba(79,70,229,.42), 0 0 0 4px rgba(99,102,241,.16)",
          }}>🧑‍🏫</div>
        </div>

        {/* incoming label */}
        <div className="vat-pill" style={{ marginBottom:14 }}>
          <span style={{ width:6, height:6, borderRadius:"50%", background:"#4f46e5", display:"inline-block", animation:"vat_blink 1.2s ease-in-out infinite" }} />
          Incoming Call
        </div>

        <div style={{ fontSize:26, fontWeight:900, color:"var(--vat-ink)", letterSpacing:"-.03em", marginBottom:5 }}>AI Teacher</div>
        <div style={{ fontSize:13, color:"var(--vat-ink3)", fontWeight:500, marginBottom:22 }}>Personalised for {studentName}</div>

        {/* animated connecting dots */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:7 }}>
          {[0,1,2].map(i => (
            <div key={i} style={{ width:8, height:8, borderRadius:"50%", background:"#6366f1", animation:`vat_dots 1.3s ease-in-out ${i*.28}s infinite` }} />
          ))}
          <span style={{ fontSize:12, fontWeight:600, color:"var(--vat-ink3)", marginLeft:8, letterSpacing:".02em" }}>Connecting</span>
        </div>
      </div>

      {/* decline */}
      <div style={{ marginTop:36, textAlign:"center", animation:"vat_up .5s ease .25s both" }}>
        <button onClick={() => setScreen(SCREEN.IDLE)} style={{
          width:64, height:64, borderRadius:"50%",
          background:"rgba(254,242,242,.9)", backdropFilter:"blur(14px)",
          border:"2px solid rgba(239,68,68,.3)",
          cursor:"pointer", fontSize:28, display:"flex", alignItems:"center", justifyContent:"center",
          margin:"0 auto", boxShadow:"0 6px 22px rgba(239,68,68,.18)", transition:"all .2s", color:"#ef4444",
        }}
          onMouseEnter={e => { e.currentTarget.style.background="rgba(254,226,226,.95)"; e.currentTarget.style.transform="scale(1.08)"; }}
          onMouseLeave={e => { e.currentTarget.style.background="rgba(254,242,242,.9)";  e.currentTarget.style.transform="scale(1)"; }}
        >📵</button>
        <div style={{ fontSize:11, fontWeight:600, color:"rgba(239,68,68,.55)", marginTop:7, letterSpacing:".04em" }}>Decline</div>
      </div>
    </div>
  );

  /* ============================================================
     ACTIVE CALL SCREEN
  ============================================================ */
  if (screen === SCREEN.ACTIVE) return (
    <div className="vat-root" style={{ display:"flex", flexDirection:"column", alignItems:"stretch" }}>
      <style>{CSS}</style>
      <div className="vat-bglayer">
        <div className="vat-orb vat-orb1" /><div className="vat-orb vat-orb2" /><div className="vat-orb vat-orb3" />
        <div className="vat-dotgrid" />
      </div>

      {/* ── TOP BAR ── */}
      <div className="vat-topbar">
        {/* on-call pill */}
        <div style={{
          display:"flex", alignItems:"center", gap:7,
          background:"rgba(255,255,255,.78)", backdropFilter:"blur(14px)",
          border:"1.5px solid rgba(99,102,241,.14)", borderRadius:20,
          padding:"6px 15px", fontSize:11, fontWeight:700,
          letterSpacing:".07em", textTransform:"uppercase", color:"rgba(67,56,202,.65)",
        }}>
          <span style={{ width:7, height:7, borderRadius:"50%", background:"#34d399", boxShadow:"0 0 6px rgba(52,211,153,.6)", animation:"vat_online 2s ease-in-out infinite" }} />
          On Call
        </div>

        {/* timer */}
        <div style={{
          background:"rgba(255,255,255,.82)", backdropFilter:"blur(14px)",
          border:"1.5px solid rgba(99,102,241,.14)", borderRadius:20,
          padding:"6px 18px", display:"flex", alignItems:"center", gap:7,
        }}>
          <span style={{ fontSize:13, color:"var(--vat-ink3)" }}>⏱</span>
          <span style={{ fontSize:13, fontWeight:900, color:"var(--vat-a)", letterSpacing:".05em" }}>{fmtTime(callTimer)}</span>
        </div>

        {/* settings btn */}
        <button className="vat-glass-btn" onClick={() => setShowSettings(v=>!v)} style={{
          width:40, height:40,
          background: showSettings ? "rgba(238,240,255,.95)" : "rgba(255,255,255,.78)",
          border:`1.5px solid ${showSettings?"rgba(99,102,241,.32)":"rgba(99,102,241,.14)"}`,
          color: showSettings ? "var(--vat-a)" : "var(--vat-ink3)",
          fontSize:17, borderRadius:13,
        }}>⚙️</button>
      </div>

      {/* ── SETTINGS ── */}
      {showSettings && (
        <div className="vat-settings">
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
            {[
              { lbl:"Volume", val:volume, min:0,  max:1,   step:.1,  unit:`${Math.round(volume*100)}%`, set:setVolume },
              { lbl:"Speed",  val:rate,   min:.5, max:1.8, step:.05, unit:`${rate}x`,                  set:setRate   },
            ].map(f => (
              <div key={f.lbl}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                  <span style={{ fontSize:11, fontWeight:700, letterSpacing:".07em", textTransform:"uppercase", color:"var(--vat-ink3)" }}>{f.lbl}</span>
                  <span style={{ fontSize:12, fontWeight:900, color:"var(--vat-a)" }}>{f.unit}</span>
                </div>
                <input type="range" min={f.min} max={f.max} step={f.step} value={f.val}
                  onChange={e => f.set(+e.target.value)}
                  style={{ width:"100%", accentColor:"#4f46e5", cursor:"pointer" }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── BODY ── */}
      <div className="vat-body">

        {/* avatar card */}
        <div className="vat-av-card" style={{ boxShadow: micState===MIC.SPEAKING ? "0 0 0 6px rgba(79,70,229,.1), 0 16px 50px rgba(99,102,241,.18),inset 0 1px 0 rgba(255,255,255,.95)" : undefined }}>
          <div className="vat-av-ring" style={{ boxShadow: micState===MIC.SPEAKING?"0 0 0 10px rgba(99,102,241,.1),0 0 0 20px rgba(99,102,241,.06),0 8px 28px rgba(79,70,229,.32)":"0 8px 28px rgba(79,70,229,.32)", transition:"box-shadow .5s" }}>
            🧑‍🏫
            {/* online dot */}
            <div style={{ position:"absolute", bottom:5, right:5, width:15, height:15, borderRadius:"50%", background:"#34d399", border:"2.5px solid #fff", boxShadow:"0 0 8px rgba(52,211,153,.6)" }} />
          </div>
          <div style={{ fontSize:20, fontWeight:900, color:"var(--vat-ink)", letterSpacing:"-.025em", marginBottom:3 }}>AI Teacher</div>
          <div style={{ fontSize:12.5, color:"var(--vat-ink3)", fontWeight:500, marginBottom:16 }}>Personalised for {studentName}</div>

          {/* waveform */}
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:8 }}>
            <div className={`vat-wave-wrap ${waveClass}`}>
              {["vb1","vb2","vb3","vb4","vb5","vb6","vb7"].map(c => (
                <div key={c} className={`vat-bar ${c}`} style={{ background:barColor }} />
              ))}
            </div>
            <div style={{ fontSize:12.5, fontWeight:600, color:statusColor, letterSpacing:".01em" }}>{statusTxt}</div>
          </div>
        </div>

        {/* greet button */}
        {!lastResponse && micState===MIC.IDLE && (
          <button className="vat-glass-btn" onClick={handleGreet} style={{
            marginTop:12, padding:"8px 20px", borderRadius:20,
            fontSize:12.5, fontWeight:700, color:"rgba(67,56,202,.72)",
            animation:"vat_up .5s ease .15s both",
          }}>👋 Tap to hear greeting</button>
        )}

        {/* transcript bubble */}
        {transcript && (
          <div className="vat-info-bubble" style={{ marginTop:12 }}>
            <div className="vat-info-label">You said</div>
            <div style={{ fontSize:13, color:"var(--vat-ink)", fontStyle:"italic", lineHeight:1.65, fontWeight:500 }}>"{transcript}"</div>
          </div>
        )}

        {/* AI response bubble */}
        {lastResponse && micState!==MIC.SPEAKING && (
          <div className="vat-info-bubble" style={{ marginTop:10, background:"rgba(238,240,255,.75)", borderColor:"rgba(99,102,241,.18)" }}>
            <div className="vat-info-label" style={{ color:"rgba(79,70,229,.5)" }}>AI Teacher said</div>
            <div style={{ fontSize:13, color:"rgba(67,56,202,.75)", lineHeight:1.65, fontWeight:500 }}>
              {lastResponse.substring(0,130)}{lastResponse.length>130?"…":""}
            </div>
          </div>
        )}

        {/* typed input */}
        {showType && (
          <div className="vat-type-row" style={{ marginTop:10 }}>
            <input autoFocus type="text" value={typedQ}
              onChange={e => setTypedQ(e.target.value)}
              onKeyDown={e => e.key==="Enter" && handleTypedSend()}
              placeholder="Type your question…"
              className="vat-type-input"
            />
            <button onClick={handleTypedSend}
              disabled={!typedQ.trim() || micState===MIC.THINKING}
              className="vat-grad-btn"
              style={{ padding:"11px 18px", fontSize:13.5, opacity:!typedQ.trim()||micState===MIC.THINKING?.45:1 }}
            >Ask</button>
          </div>
        )}
      </div>

      {/* ── CONTROLS ── */}
      <div style={{ width:"100%", maxWidth:440, margin:"0 auto", padding:"12px 22px 32px", position:"relative", zIndex:1 }}>

        {/* secondary row */}
        <div className="vat-ctrl-row">
          {[
            { icon:muted?"🔇":"🎙️",    label:muted?"Unmute":"Mute",     active:muted,      activeColor:"rgba(239,68,68,.85)",   activeBg:"rgba(254,242,242,.88)", activeBorder:"rgba(239,68,68,.28)",   onClick:()=>setMuted(m=>!m) },
            { icon:speakerOn?"🔊":"🔈", label:"Speaker",                 active:speakerOn,  activeColor:"rgba(79,70,229,.85)",   activeBg:"rgba(238,240,255,.88)", activeBorder:"rgba(99,102,241,.28)",  onClick:()=>setSpeaker(s=>!s) },
            { icon:"⌨️",               label:"Keyboard",                active:showType,   activeColor:"rgba(5,150,105,.85)",   activeBg:"rgba(240,253,244,.88)", activeBorder:"rgba(16,185,129,.28)",  onClick:()=>setShowType(v=>!v) },
          ].map(b => (
            <div key={b.label} className="vat-ctrl-btn" onClick={b.onClick}>
              <div className="vat-ctrl-icon" style={{
                background: b.active ? b.activeBg : undefined,
                border: `1.5px solid ${b.active ? b.activeBorder : "rgba(99,102,241,.15)"}`,
                color: b.active ? b.activeColor : "rgba(79,70,229,.55)",
                boxShadow: b.active ? `0 4px 16px ${b.activeBg}` : undefined,
              }}>{b.icon}</div>
              <div className="vat-ctrl-lbl" style={{ color: b.active ? b.activeColor : undefined }}>{b.label}</div>
            </div>
          ))}
        </div>

        {/* mic + end */}
        <div className="vat-action-row" style={{ marginBottom:14 }}>
          {/* mic */}
          <button className="vat-mic-btn" onClick={toggleMic}
            disabled={micState===MIC.THINKING}
            style={{
              background:micBgGlass, backdropFilter:"blur(16px)",
              outline:`2.5px solid ${micOutline}`,
              color:micColor,
              boxShadow: micState===MIC.LISTENING
                ? "0 0 0 0 rgba(239,68,68,.45), 0 8px 28px rgba(239,68,68,.16)"
                : micState===MIC.SPEAKING
                ? "0 8px 28px rgba(5,150,105,.16)"
                : "0 6px 22px rgba(99,102,241,.14)",
              cursor:micState===MIC.THINKING?"not-allowed":"pointer",
              animation:micState===MIC.LISTENING?"vat_gmic 1.5s ease-in-out infinite":"none",
              transition:"all .25s",
            }}
          >{micIcon}</button>

          {/* end call */}
          <button className="vat-end-btn" onClick={endCall}>📵</button>
        </div>

        <div style={{ textAlign:"center", fontSize:11, fontWeight:600, color:"rgba(99,102,241,.32)", letterSpacing:".04em" }}>
          Tap 🎙️ to speak · Tap 📵 to end call
        </div>
      </div>
    </div>
  );

  /* ============================================================
     IDLE SCREEN
  ============================================================ */
  return (
    <>
      <style>{CSS}</style>

      {/* FAB */}
      <button className="vat-fab" onClick={startCall} title="Call AI Teacher" style={{ position:"fixed", bottom:88, right:22, zIndex:40 }}>
        <div className="vat-fab-shimmer" />
        📞
      </button>
      <div className="vat-fab-ring"  />
      <div className="vat-fab-ring2" />

      {/* history btn */}
      <button className="vat-hist-btn" onClick={() => setOpen(v=>!v)} title="Call History">🕐</button>

      {/* logs panel */}
      {open && (
        <div className="vat-logs">
          {/* header */}
          <div className="vat-logs-hdr">
            <div>
              <div style={{ fontSize:14, fontWeight:800, color:"var(--vat-ink)", margin:0, letterSpacing:"-.01em" }}>Recent Calls</div>
              <div style={{ fontSize:11, color:"var(--vat-ink3)", margin:0, marginTop:2, fontWeight:500 }}>AI Teacher · {studentName}</div>
            </div>
            <button onClick={() => setOpen(false)} style={{
              width:28, height:28, borderRadius:9,
              background:"rgba(99,102,241,.08)", border:"none", cursor:"pointer",
              color:"var(--vat-ink3)", fontSize:17, display:"flex", alignItems:"center", justifyContent:"center",
              transition:"all .15s",
            }}
              onMouseEnter={e => { e.currentTarget.style.background="rgba(99,102,241,.16)"; e.currentTarget.style.color="var(--vat-a)"; }}
              onMouseLeave={e => { e.currentTarget.style.background="rgba(99,102,241,.08)"; e.currentTarget.style.color="var(--vat-ink3)"; }}
            >×</button>
          </div>

          {/* new call btn */}
          <div style={{ padding:"10px 12px 4px" }}>
            <button className="vat-grad-btn" onClick={() => { setOpen(false); startCall(); }}
              style={{ width:"100%", padding:"10px 16px", borderRadius:14, fontSize:13, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}
            >📞 Start New Call</button>
          </div>

          {/* list */}
          <div className="vat-logs-scroll" style={{ padding:"4px 0" }}>
            {callLogs.length === 0 ? (
              <div style={{ textAlign:"center", padding:"28px 16px" }}>
                <div style={{ fontSize:34, marginBottom:9 }}>📭</div>
                <div style={{ fontSize:12.5, color:"var(--vat-ink3)", fontWeight:500 }}>No call history yet</div>
              </div>
            ) : (
              callLogs.map(log => (
                <div key={log.id} className="vat-log-row" onClick={() => { setOpen(false); startCall(); }}>
                  <div className="vat-log-av">🧑‍🏫</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:13, fontWeight:700, color:"var(--vat-ink)", marginBottom:2 }}>AI Teacher</div>
                    <div style={{ fontSize:11, color:"var(--vat-ink3)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", fontWeight:500 }}>{log.lastTopic}</div>
                  </div>
                  <div style={{ textAlign:"right", flexShrink:0 }}>
                    <div style={{ fontSize:11, color:"var(--vat-ink3)", fontWeight:500 }}>{fmtCallDate(log.timestamp)}</div>
                    <div style={{ fontSize:11.5, color:"var(--vat-a)", fontWeight:800, marginTop:2 }}>{fmtTime(log.duration)}</div>
                  </div>
                </div>
              ))
            )}
          </div>

          {callLogs.length > 0 && (
            <div style={{ padding:"4px 12px 10px", borderTop:"1px solid rgba(99,102,241,.08)" }}>
              <button onClick={() => { setCallLogs([]); localStorage.removeItem("ai_call_logs"); }}
                style={{ background:"none", border:"none", cursor:"pointer", color:"rgba(239,68,68,.45)", fontSize:12, fontWeight:600, width:"100%", fontFamily:"'Plus Jakarta Sans',sans-serif", transition:"color .15s", padding:"4px 0" }}
                onMouseEnter={e => e.currentTarget.style.color="#ef4444"}
                onMouseLeave={e => e.currentTarget.style.color="rgba(239,68,68,.45)"}
              >Clear history</button>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default VoiceAiTutor;