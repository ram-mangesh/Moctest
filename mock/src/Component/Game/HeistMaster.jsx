import React, { useState, useEffect, useRef } from "react";
import api from "../Api/axios";
import { ArrowLeft, Play, RefreshCw, AlertTriangle } from "lucide-react";

/**
 * HEIST MASTER 🔐
 * A unique safe-cracking Bank Heist game.
 * - Each question = one vault tumbler to crack
 * - Correct → tumbler clicks into place ✅
 * - Wrong  → alarm triggered, timer penalty ⚠️
 * - Crack all 6 tumblers = VAULT OPENS = WIN!
 */

const TOTAL_TUMBLERS = 6;

export default function HeistMaster({ onBack }) {
  const [exams, setExams] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [qIndex, setQIndex] = useState(0);
  const [tumblers, setTumblers] = useState(Array(TOTAL_TUMBLERS).fill(false)); // locked/unlocked
  const [state, setState] = useState("MENU"); // MENU | PLAYING | ALARM | WIN | DEAD
  const [alarmCount, setAlarmCount] = useState(0);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(30);
  const [penaltyTime, setPenaltyTime] = useState(0);
  const timerRef = useRef(null);
  const alarmRef = useRef(null);
  const [selectedExam, setSelectedExam] = useState(null);
  const [spinningTumbler, setSpinningTumbler] = useState(null);

  useEffect(() => {
    api.get("/user/exams").then(r => setExams(r.data || [])).catch(() => {});
  }, []);

  // Timer countdown
  useEffect(() => {
    if (state === "PLAYING") {
      timerRef.current = setInterval(() => {
        setTimer(t => {
          if (t <= 1) {
            clearInterval(timerRef.current);
            setState("DEAD");
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [state]);

  // Alarm flash effect
  useEffect(() => {
    if (state === "ALARM") {
      let flashes = 0;
      alarmRef.current = setInterval(() => {
        flashes++;
        if (flashes >= 6) {
          clearInterval(alarmRef.current);
          setState("PLAYING");
        }
      }, 200);
    }
    return () => clearInterval(alarmRef.current);
  }, [state]);

  const startGame = async (exam) => {
    setSelectedExam(exam);
    setState("LOADING");
    try {
      const res = await api.get(`/user/questions?topicId=${exam.id}`);
      const qs = (res.data || []).sort(() => Math.random() - 0.5).slice(0, 20);
      if (!qs.length) throw new Error("No questions");
      setQuestions(qs);
      setQIndex(0);
      setTumblers(Array(TOTAL_TUMBLERS).fill(false));
      setAlarmCount(0);
      setScore(0);
      setTimer(90);
      setState("PLAYING");
    } catch (e) {
      alert("Error: " + e.message);
      setState("MENU");
    }
  };

  const handleAnswer = (choiceIdx) => {
    if (state !== "PLAYING") return;
    const q = questions[qIndex % questions.length];
    const isCorrect =
      choiceIdx === q.correct ||
      String(choiceIdx) === String(q.correct) ||
      q.options?.[choiceIdx] === q.correct ||
      choiceIdx === q.correctAnswer ||
      String(choiceIdx) === String(q.correctAnswer);

    const nextQIdx = qIndex + 1;
    setQIndex(nextQIdx);

    if (isCorrect) {
      // Find the next unlocked tumbler
      const nextTumblerIdx = tumblers.findIndex(t => !t);
      if (nextTumblerIdx === -1) { setState("WIN"); return; }

      setSpinningTumbler(nextTumblerIdx);
      setScore(s => s + Math.ceil(timer * 10));

      setTimeout(() => {
        setTumblers(prev => {
          const next = [...prev];
          next[nextTumblerIdx] = true;
          return next;
        });
        setSpinningTumbler(null);
        const newTumblers = [...tumblers];
        newTumblers[nextTumblerIdx] = true;
        if (newTumblers.every(Boolean)) {
          setTimeout(() => setState("WIN"), 600);
        }
      }, 700);
    } else {
      // Alarm!
      setAlarmCount(a => a + 1);
      setTimer(t => Math.max(0, t - 10)); // -10 seconds penalty
      setState("ALARM");
      if (alarmCount + 1 >= 3) {
        setTimeout(() => setState("DEAD"), 1500);
      }
    }
  };

  const crackedCount = tumblers.filter(Boolean).length;
  const crackPercent = Math.round((crackedCount / TOTAL_TUMBLERS) * 100);

  // ===================== MENU =====================
  if (state === "MENU") {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center p-8 text-white relative overflow-hidden"
        style={{ background: "linear-gradient(135deg,#0a0a0a,#1c1917,#0c0a09)" }}>
        {/* Scanlines overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-10"
          style={{ backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 2px,#000 2px,#000 4px)" }} />

        <button onClick={onBack} className="absolute top-6 left-6 text-yellow-500 hover:text-yellow-300 flex items-center gap-2 font-bold z-10">
          <ArrowLeft size={20} /> Arcade
        </button>

        <div className="z-10 flex flex-col items-center">
          {/* Vault door SVG logo */}
          <VaultDoor cracked={false} size={160} tumblers={Array(6).fill(false)} spinningTumbler={null} />
          <h1 className="text-5xl font-black mt-6 mb-2 tracking-tighter" style={{ color: "#fbbf24", textShadow: "0 0 30px #f59e0b" }}>
            HEIST MASTER
          </h1>
          <p className="text-yellow-600/70 font-bold mb-2 tracking-widest text-sm uppercase">Answer to Crack the Vault</p>
          <ul className="text-slate-400 text-sm font-bold mb-10 space-y-1 text-center">
            <li>✅ Correct answer → Tumbler clicks (6 needed)</li>
            <li>⚠️ Wrong answer → Alarm fires! -10 sec penalty</li>
            <li>🚨 3 alarms → Guards catch you!</li>
            <li>⏱️ Time runs out → Game over</li>
          </ul>

          <h2 className="text-white font-black text-lg mb-4 uppercase tracking-widest">Select Heist Target</h2>
          <div className="grid grid-cols-1 gap-3 w-full max-w-md">
            {exams.length === 0 && <p className="text-yellow-600 animate-pulse text-center">Scanning targets...</p>}
            {exams.map(ex => (
              <button key={ex.id} onClick={() => startGame(ex)}
                className="w-full p-4 border border-yellow-800 hover:border-yellow-500 bg-yellow-950/30 hover:bg-yellow-900/40 text-yellow-300 font-black text-left rounded-xl flex items-center justify-between transition-all active:scale-95">
                <span>{ex.name}</span>
                <Play size={18} className="text-yellow-500" />
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (state === "LOADING") {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center" style={{ background: "#0a0a0a" }}>
        <div className="text-6xl animate-spin mb-4">🔐</div>
        <p className="text-yellow-400 font-black text-2xl animate-pulse">Casing the joint...</p>
      </div>
    );
  }

  if (state === "WIN") {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center p-8 text-center relative overflow-hidden"
        style={{ background: "radial-gradient(circle at center, #78350f, #0a0a0a 70%)" }}>
        <div className="text-[100px] mb-4">💰</div>
        <h1 className="text-6xl font-black text-yellow-400 mb-3" style={{ textShadow: "0 0 40px gold" }}>VAULT CRACKED!</h1>
        <p className="text-yellow-600 font-bold mb-2 text-xl">You outsmarted the security system!</p>
        <div className="my-6 border border-yellow-800 bg-yellow-950/30 rounded-2xl p-6 text-left w-full max-w-sm">
          <div className="text-yellow-400 font-black text-xs mb-1 uppercase tracking-widest">Loot Collected:</div>
          <div className="text-yellow-300 font-black text-4xl mb-4">${score.toLocaleString()}</div>
          <div className="text-slate-400 font-bold text-sm">Time Remaining: {timer}s</div>
          <div className="text-slate-400 font-bold text-sm">Alarms Triggered: {alarmCount}/3</div>
        </div>
        <div className="flex gap-4 w-full max-w-sm">
          <button onClick={() => startGame(selectedExam)}
            className="flex-1 py-4 bg-yellow-500 hover:bg-yellow-400 text-black font-black rounded-2xl flex items-center justify-center gap-2">
            <RefreshCw size={18} /> New Heist
          </button>
          <button onClick={onBack}
            className="flex-1 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl flex items-center justify-center gap-2">
            <ArrowLeft size={18} /> Menu
          </button>
        </div>
      </div>
    );
  }

  if (state === "DEAD") {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center p-8 text-center"
        style={{ background: "radial-gradient(circle, #450a0a, #0a0a0a 70%)" }}>
        <div className="text-[100px] mb-4">🚔</div>
        <h1 className="text-6xl font-black text-red-500 mb-3" style={{ textShadow: "0 0 40px red" }}>BUSTED!</h1>
        <p className="text-red-400 font-bold mb-8 text-xl">{alarmCount >= 3 ? "Too many alarms! Guards caught you." : "Time ran out!"}</p>
        <div className="flex gap-4 w-full max-w-sm">
          <button onClick={() => startGame(selectedExam)}
            className="flex-1 py-4 bg-red-700 hover:bg-red-600 text-white font-black rounded-2xl flex items-center justify-center gap-2">
            <RefreshCw size={18} /> Try Again
          </button>
          <button onClick={onBack}
            className="flex-1 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl flex items-center justify-center gap-2">
            <ArrowLeft size={18} /> Abort
          </button>
        </div>
      </div>
    );
  }

  // ===================== MAIN GAME =====================
  const currentQ = questions[qIndex % questions.length];
  const isAlarm = state === "ALARM";
  const timerWarning = timer < 20;

  return (
    <div className="w-full min-h-screen flex flex-col items-center p-4 overflow-y-auto relative"
      style={{ background: isAlarm ? "#450a0a" : "linear-gradient(160deg,#0a0a0a,#1c1917)" }}>

      {/* Alarm overlay flash */}
      {isAlarm && (
        <div className="fixed inset-0 z-50 pointer-events-none" style={{ background: "rgba(239,68,68,0.3)", animation: "alarmFlash 0.2s linear infinite" }} />
      )}

      <style>{`
        @keyframes alarmFlash { 0%,100%{opacity:1;} 50%{opacity:0;} }
        @keyframes tumblerSpin { 0%{transform:rotate(0deg);} 100%{transform:rotate(360deg);} }
        @keyframes vaultShake { 0%,100%{transform:translateX(0);} 25%{transform:translateX(-6px);} 75%{transform:translateX(6px);} }
        @keyframes doorOpen { 0%{transform:perspective(600px) rotateY(0deg);} 100%{transform:perspective(600px) rotateY(-75deg);} }
      `}</style>

      {/* ---- TOP HUD ---- */}
      <div className="w-full max-w-2xl flex items-center justify-between mb-4 mt-2">
        <button onClick={onBack} className="text-yellow-700 hover:text-yellow-400"><ArrowLeft size={22} /></button>
        <div className="flex gap-4 items-center">
          {/* Alarm indicators */}
          <div className="flex gap-1">
            {[0,1,2].map(i => (
              <div key={i} className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs ${i < alarmCount ? 'bg-red-600 border-red-400 animate-pulse' : 'bg-slate-800 border-slate-600'}`}>
                {i < alarmCount ? '🚨' : ''}
              </div>
            ))}
            <span className="text-slate-500 text-xs font-bold ml-1 self-center">ALARMS</span>
          </div>
          {/* Timer */}
          <div className={`px-4 py-1 rounded-full font-black text-lg border-2 ${timerWarning ? 'border-red-500 text-red-400 animate-pulse bg-red-950/40' : 'border-yellow-700 text-yellow-400 bg-yellow-950/30'}`}>
            ⏱️ {timer}s
          </div>
          {/* Score */}
          <div className="px-4 py-1 rounded-full font-black text-lg border-2 border-yellow-800 text-yellow-400 bg-yellow-950/30">
            ${score.toLocaleString()}
          </div>
        </div>
      </div>

      {/* ---- VAULT DOOR ---- */}
      <div className={`flex flex-col items-center mb-6 ${isAlarm ? 'vault-shake' : ''}`}
        style={{ animation: isAlarm ? 'vaultShake 0.15s linear infinite' : '' }}>
        <VaultDoor
          cracked={crackedCount === TOTAL_TUMBLERS}
          size={220}
          tumblers={tumblers}
          spinningTumbler={spinningTumbler}
        />
        <div className="mt-2 text-yellow-500 font-black text-sm uppercase tracking-widest">
          {crackedCount}/{TOTAL_TUMBLERS} Tumblers Cracked
        </div>
        {/* Crack progress bar */}
        <div className="w-full max-w-xs mt-2 bg-slate-800 rounded-full h-3 border border-slate-700 overflow-hidden">
          <div className="h-full rounded-full transition-all duration-700"
            style={{ width: `${crackPercent}%`, background: "linear-gradient(90deg,#f59e0b,#fbbf24)", boxShadow: crackPercent > 0 ? "0 0 10px #f59e0b" : "none" }} />
        </div>
      </div>

      {/* ---- QUESTION PANEL ---- */}
      {isAlarm ? (
        <div className="w-full max-w-xl text-center py-8">
          <div className="text-[80px] animate-bounce">🚨</div>
          <h2 className="text-4xl font-black text-red-400 mb-2 animate-pulse">ALARM TRIGGERED!</h2>
          <p className="text-red-300 font-bold">-10 seconds penalty! Stay cool...</p>
        </div>
      ) : (
        currentQ && (
          <div className="w-full max-w-xl rounded-2xl p-6 border border-yellow-900 bg-yellow-950/20 text-white"
            style={{ backdropFilter: "blur(10px)" }}>
            {/* Question */}
            <div className="flex gap-3 mb-5 border-b border-yellow-900 pb-4 items-start">
              <span className="bg-yellow-600 text-black font-black px-3 py-1 rounded-full text-sm shrink-0">Q.{qIndex + 1}</span>
              <p className="font-bold leading-relaxed text-base text-yellow-100">{currentQ.question}</p>
            </div>
            {/* Options */}
            <div className="grid grid-cols-1 gap-3">
              {currentQ.options?.map((opt, i) => (
                <button key={i} onClick={() => handleAnswer(i)}
                  className="w-full p-4 text-left border border-yellow-900 hover:border-yellow-500 bg-yellow-950/30 hover:bg-yellow-900/50 text-yellow-100 font-bold rounded-xl flex items-center gap-3 transition-all active:scale-95">
                  <span className="text-yellow-600 font-black text-lg w-6">{String.fromCharCode(65+i)}.</span>
                  <span className="text-sm leading-snug">{opt}</span>
                </button>
              ))}
            </div>
            <p className="mt-4 text-yellow-800 text-xs font-bold text-center">
              🔐 Crack all {TOTAL_TUMBLERS} tumblers to open the vault!
            </p>
          </div>
        )
      )}
    </div>
  );
}

/* ===================== SVG VAULT DOOR ===================== */
function VaultDoor({ cracked, size, tumblers, spinningTumbler }) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.45;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ filter: "drop-shadow(0 0 20px rgba(251,191,36,0.3))" }}>
      {/* Vault body */}
      <rect x={size*0.05} y={size*0.05} width={size*0.9} height={size*0.9} rx={size*0.08} fill="#1c1917" stroke="#78350f" strokeWidth={3} />
      {/* Bolts (corners) */}
      {[[0.12,0.12],[0.88,0.12],[0.12,0.88],[0.88,0.88]].map(([px,py],i) => (
        <circle key={i} cx={px*size} cy={py*size} r={size*0.04} fill="#292524" stroke="#57534e" strokeWidth={2} />
      ))}
      {/* Door circle */}
      <circle cx={cx} cy={cy} r={r} fill="#292524" stroke="#78350f" strokeWidth={4} />
      {/* Tumblers */}
      {tumblers.map((crk, i) => {
        const angle = (i / tumblers.length) * 2 * Math.PI - Math.PI / 2;
        const tr = r * 0.62;
        const tx = cx + tr * Math.cos(angle);
        const ty = cy + tr * Math.sin(angle);
        const isSpinning = spinningTumbler === i;
        return (
          <g key={i} transform={`translate(${tx},${ty})`}>
            <circle r={r * 0.18} fill={crk ? "#16a34a" : "#1c1917"}
              stroke={crk ? "#22c55e" : "#57534e"} strokeWidth={2}
              style={isSpinning ? { animation: "tumblerSpin 0.4s linear infinite", transformOrigin: "center" } : {}} />
            {crk ? (
              <text fontSize={r*0.16} textAnchor="middle" dominantBaseline="middle" fill="white">✓</text>
            ) : (
              <line x1={0} y1={-r*0.12} x2={0} y2={r*0.12} stroke="#78350f" strokeWidth={3} strokeLinecap="round"
                style={isSpinning ? { animation: "tumblerSpin 0.4s linear infinite", transformOrigin: "center" } : {}} />
            )}
          </g>
        );
      })}
      {/* Center handle */}
      <circle cx={cx} cy={cy} r={r*0.22} fill={cracked ? "#15803d" : "#292524"} stroke={cracked ? "#22c55e" : "#57534e"} strokeWidth={3}
        style={{ filter: cracked ? "drop-shadow(0 0 15px #22c55e)" : "none", transition: "all 0.5s ease" }} />
      <text x={cx} y={cy+4} fontSize={cracked ? r*0.22 : r*0.18} textAnchor="middle" dominantBaseline="middle">
        {cracked ? "💰" : "🔐"}
      </text>
      {/* Crack lines when opened */}
      {cracked && (
        <>
          <line x1={cx} y1={size*0.05} x2={cx} y2={size*0.95} stroke="#22c55e" strokeWidth={1} strokeDasharray="4 4" opacity={0.4} />
          <line x1={size*0.05} y1={cy} x2={size*0.95} y2={cy} stroke="#22c55e" strokeWidth={1} strokeDasharray="4 4" opacity={0.4} />
        </>
      )}
    </svg>
  );
}
