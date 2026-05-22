import React, { useState, useEffect, useRef, useCallback } from "react";
import api from "../Api/axios";
import { ArrowLeft, Play, RefreshCw, Zap, Shield } from "lucide-react";

/**
 * SPACE DEFENDER — UPGRADED 🚀
 * Full vertical space shooter with:
 * - Animated starfield parallax (3 layers)
 * - SVG spaceship with thruster glow
 * - Waves of asteroids + alien ships
 * - Laser blast on correct answer
 * - Shield system & explosion effects
 * - Combo multiplier
 */

export default function SpaceDefender({ onBack }) {
  const [exams, setExams]       = useState([]);
  const [questions, setQuestions] = useState([]);
  const [qIndex, setQIndex]     = useState(0);
  const [state, setState]       = useState("MENU");
  const [score, setScore]       = useState(0);
  const [shields, setShields]   = useState(3);
  const [combo, setCombo]       = useState(0);
  const [wave, setWave]         = useState(1);
  const [selectedExam, setSelectedExam] = useState(null);

  // Visual fx state
  const [lasers, setLasers]         = useState([]);   // [{id,x,y}]
  const [explosions, setExplosions] = useState([]);   // [{id,x,y}]
  const [asteroids, setAsteroids]   = useState([]);   // [{id,x,y,size,speed,type}]
  const [shieldFlash, setShieldFlash] = useState(false);
  const [comboFlash, setComboFlash]   = useState(false);

  const raf = useRef(null);
  const tickRef = useRef(0);
  const idRef = useRef(0);
  const uid = () => ++idRef.current;

  useEffect(() => {
    api.get("/user/exams").then(r => setExams(r.data || [])).catch(() => {});
  }, []);

  // Asteroid spawner
  useEffect(() => {
    if (state !== "PLAYING") return;
    const interval = setInterval(() => {
      const types = ["asteroid", "asteroid", "asteroid", "alien"];
      const type = types[Math.floor(Math.random() * types.length)];
      setAsteroids(a => [
        ...a.slice(-12), // max 12 at once
        { id: uid(), x: Math.random() * 85 + 5, y: -8, size: Math.random() * 30 + 20, speed: Math.random() * 2 + 1 + wave * 0.3, type }
      ]);
    }, Math.max(600, 1800 - wave * 150));
    return () => clearInterval(interval);
  }, [state, wave]);

  // Animate asteroids falling
  useEffect(() => {
    if (state !== "PLAYING") return;
    const tick = () => {
      setAsteroids(a =>
        a.map(ast => ({ ...ast, y: ast.y + ast.speed * 0.25 }))
          .filter(ast => ast.y < 105)
      );
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [state]);

  const startGame = async (exam) => {
    setSelectedExam(exam);
    setState("LOADING");
    try {
      const res = await api.get(`/user/questions?topicId=${exam.id}`);
      const qs = (res.data || []).sort(() => Math.random() - 0.5).slice(0, 25);
      if (!qs.length) throw new Error("No questions");
      setQuestions(qs);
      setQIndex(0); setScore(0); setShields(3); setCombo(0); setWave(1);
      setAsteroids([]); setLasers([]); setExplosions([]);
      setState("PLAYING");
    } catch (e) { alert(e.message); setState("MENU"); }
  };

  const fireAndDestroy = useCallback(() => {
    // Fire laser from ship (center)
    const lId = uid();
    setLasers(l => [...l, { id: lId, x: 50, y: 85 }]);
    setTimeout(() => setLasers(l => l.filter(x => x.id !== lId)), 600);

    // Destroy first visible asteroid
    setAsteroids(prev => {
      if (!prev.length) return prev;
      const target = prev.reduce((a, b) => (b.y > a.y ? b : a));
      const eId = uid();
      setExplosions(e => [...e, { id: eId, x: target.x, y: target.y }]);
      setTimeout(() => setExplosions(e => e.filter(x => x.id !== eId)), 800);
      return prev.filter(a => a.id !== target.id);
    });
  }, []);

  const handleAnswer = (choiceIdx) => {
    if (state !== "PLAYING") return;
    const q = questions[qIndex % questions.length];
    const correct =
      choiceIdx === q.correct ||
      String(choiceIdx) === String(q.correct) ||
      q.options?.[choiceIdx] === q.correct ||
      choiceIdx === q.correctAnswer ||
      String(choiceIdx) === String(q.correctAnswer);

    const nextIdx = qIndex + 1;
    setQIndex(nextIdx);

    if (correct) {
      const newCombo = combo + 1;
      setCombo(newCombo);
      const multiplier = Math.min(5, 1 + Math.floor(newCombo / 3));
      setScore(s => s + 500 * multiplier);
      if (newCombo % 3 === 0) { setComboFlash(true); setTimeout(() => setComboFlash(false), 800); }
      fireAndDestroy();
      if (newCombo > 0 && newCombo % 5 === 0) setWave(w => w + 1);
    } else {
      setCombo(0);
      setShields(s => {
        const ns = s - 1;
        setShieldFlash(true);
        setTimeout(() => setShieldFlash(false), 600);
        if (ns <= 0) setTimeout(() => setState("GAMEOVER"), 700);
        return ns;
      });
    }

    if (nextIdx >= questions.length) setTimeout(() => setState("WIN"), 1000);
  };

  // ============= MENU =============
  if (state === "MENU") return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center p-8 text-white relative overflow-hidden"
      style={{ background: "radial-gradient(ellipse at center, #0c1445 0%, #020617 100%)" }}>
      <Starfield />
      <button onClick={onBack} className="absolute top-6 left-6 text-indigo-400 hover:text-white flex items-center gap-2 font-bold z-10">
        <ArrowLeft size={20} /> Arcade
      </button>
      <div className="z-10 flex flex-col items-center">
        <ShipSVG size={160} thrusting={true} />
        <h1 className="text-5xl font-black mt-4 mb-1 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500"
          style={{ textShadow: "none", filter: "drop-shadow(0 0 20px #818cf8)" }}>
          SPACE DEFENDER
        </h1>
        <p className="text-indigo-400 font-bold mb-2 text-center text-sm">UPGRADED EDITION</p>
        <p className="text-slate-400 font-bold mb-10 text-center text-sm max-w-md">
          Destroy asteroids with correct answers! Build combos for bonus score. 3 shields = 3 lives.
        </p>
        <h2 className="text-white font-black text-lg mb-4 uppercase tracking-widest">Choose Galaxy</h2>
        <div className="grid grid-cols-1 gap-3 w-full max-w-md">
          {exams.length === 0 && <p className="text-indigo-400 animate-pulse text-center">Scanning galaxies...</p>}
          {exams.map(ex => (
            <button key={ex.id} onClick={() => startGame(ex)}
              className="w-full p-4 border border-indigo-800 hover:border-cyan-500 bg-indigo-950/40 hover:bg-indigo-900/50 text-indigo-200 font-black text-left rounded-xl flex items-center justify-between transition-all active:scale-95"
              style={{ boxShadow: "0 0 10px rgba(99,102,241,0.2)" }}>
              <span>🌌 {ex.name}</span>
              <Play size={18} className="text-cyan-400" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  if (state === "LOADING") return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center" style={{ background: "#020617" }}>
      <div className="text-6xl animate-spin mb-4">🌌</div>
      <p className="text-cyan-400 font-black text-2xl animate-pulse">Entering warp speed...</p>
    </div>
  );

  if (state === "WIN") return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center p-8 text-center relative overflow-hidden"
      style={{ background: "radial-gradient(ellipse at center, #1e1b4b 0%, #020617 100%)" }}>
      <Starfield />
      <div className="z-10 flex flex-col items-center">
        <div className="text-[100px] mb-4">🏆</div>
        <h1 className="text-6xl font-black text-cyan-400 mb-3" style={{ textShadow: "0 0 40px #06b6d4" }}>GALAXY SAVED!</h1>
        <div className="border border-indigo-700 bg-indigo-950/50 rounded-2xl p-6 mb-6 text-left w-full max-w-sm">
          <div className="text-indigo-400 font-black text-xs mb-1 uppercase">Final Score</div>
          <div className="text-cyan-300 font-black text-4xl mb-3">{score.toLocaleString()}</div>
          <div className="text-slate-400 text-sm font-bold">Waves Survived: {wave}</div>
          <div className="text-slate-400 text-sm font-bold">Shields Remaining: {shields}/3</div>
          <div className="text-slate-400 text-sm font-bold">Combo Peak: {combo}x</div>
        </div>
        <div className="flex gap-4 w-full max-w-sm">
          <button onClick={() => startGame(selectedExam)} className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl flex items-center justify-center gap-2">
            <RefreshCw size={18} /> New Mission
          </button>
          <button onClick={onBack} className="flex-1 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl flex items-center justify-center gap-2">
            <ArrowLeft size={18} /> Menu
          </button>
        </div>
      </div>
    </div>
  );

  if (state === "GAMEOVER") return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center p-8 text-center relative overflow-hidden"
      style={{ background: "radial-gradient(ellipse at center, #450a0a 0%, #020617 100%)" }}>
      <div className="z-10 flex flex-col items-center">
        <div className="text-[100px] mb-4">💥</div>
        <h1 className="text-6xl font-black text-red-500 mb-3" style={{ textShadow: "0 0 40px red" }}>SHIP DESTROYED!</h1>
        <p className="text-red-400 font-bold mb-6">Your shields couldn't hold</p>
        <p className="text-white font-black text-3xl mb-8">Score: {score.toLocaleString()}</p>
        <div className="flex gap-4 w-full max-w-sm">
          <button onClick={() => startGame(selectedExam)} className="flex-1 py-4 bg-red-700 hover:bg-red-600 text-white font-black rounded-2xl flex items-center justify-center gap-2">
            <RefreshCw size={18} /> Retry
          </button>
          <button onClick={onBack} className="flex-1 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl flex items-center justify-center gap-2">
            <ArrowLeft size={18} /> Abort
          </button>
        </div>
      </div>
    </div>
  );

  // ============= MAIN GAME =============
  const currentQ = questions[qIndex % questions.length];
  const multiplier = Math.min(5, 1 + Math.floor(combo / 3));

  return (
    <div className="w-full min-h-screen flex flex-col overflow-hidden"
      style={{ background: "#020617" }}>
      <style>{`
        @keyframes laserBeam { 0%{transform:scaleY(1) translateY(0);opacity:1;} 100%{transform:scaleY(0.1) translateY(-800px);opacity:0;} }
        @keyframes explode { 0%{transform:scale(0.2);opacity:1;} 60%{transform:scale(1.8);opacity:0.8;} 100%{transform:scale(2.5);opacity:0;} }
        @keyframes asteroidPulse { 0%,100%{filter:drop-shadow(0 0 4px #f97316);} 50%{filter:drop-shadow(0 0 12px #f97316);} }
        @keyframes alienPulse { 0%,100%{filter:drop-shadow(0 0 4px #a855f7);} 50%{filter:drop-shadow(0 0 14px #a855f7);} }
        @keyframes thrusterGlow { 0%,100%{height:24px;opacity:0.8;} 50%{height:40px;opacity:1;} }
        @keyframes shieldHit { 0%,100%{box-shadow:0 0 0 rgba(239,68,68,0);} 50%{box-shadow:0 0 60px rgba(239,68,68,0.8);} }
        @keyframes comboShine { 0%{filter:brightness(1);} 50%{filter:brightness(2) drop-shadow(0 0 30px #fbbf24);} 100%{filter:brightness(1);} }
        @keyframes starTwinkle { 0%,100%{opacity:0.3;} 50%{opacity:1;} }
        @keyframes float { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-6px);} }
        .laser-beam { animation: laserBeam 0.5s ease-out forwards; }
        .explosion { animation: explode 0.8s ease-out forwards; }
        .asteroid-obj { animation: asteroidPulse 2s ease-in-out infinite; }
        .alien-obj { animation: alienPulse 1.5s ease-in-out infinite; }
        .ship-float { animation: float 2s ease-in-out infinite; }
        .shield-hit { animation: shieldHit 0.6s ease-out; }
        .combo-shine { animation: comboShine 0.8s ease-out; }
      `}</style>

      {/* ─── SPACE VIEWPORT ─── */}
      <div
        className={`relative flex-none overflow-hidden transition-all ${shieldFlash ? 'shield-hit' : ''}`}
        style={{ height: "55vh", background: "radial-gradient(ellipse at center bottom, #0c1445 0%, #020617 100%)" }}>

        {/* Starfield */}
        <Starfield />

        {/* WAVE indicator */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-indigo-900/60 border border-indigo-600 text-indigo-300 text-xs font-black px-4 py-1 rounded-full tracking-widest z-20">
          WAVE {wave}
        </div>

        {/* HUD top-left: Shields */}
        <div className="absolute top-3 left-3 flex items-center gap-2 z-20">
          {[0,1,2].map(i => (
            <Shield key={i} size={24}
              className={`transition-all ${i < shields ? 'text-cyan-400 drop-shadow-[0_0_8px_#06b6d4]' : 'text-slate-700'}`}
              fill={i < shields ? "#164e63" : "none"} />
          ))}
        </div>

        {/* HUD top-right: Score + Combo */}
        <div className="absolute top-3 right-3 flex flex-col items-end gap-1 z-20">
          <div className="text-cyan-300 font-black text-xl drop-shadow-[0_0_8px_#06b6d4]">
            {score.toLocaleString()}
          </div>
          {combo > 0 && (
            <div className={`text-yellow-400 font-black text-sm px-3 py-0.5 rounded-full bg-yellow-900/40 border border-yellow-700 ${comboFlash ? 'combo-shine' : ''}`}>
              🔥 {combo}x COMBO {multiplier > 1 ? `(×${multiplier})` : ''}
            </div>
          )}
        </div>

        {/* ASTEROIDS */}
        {asteroids.map(ast => (
          <div key={ast.id}
            className={`absolute ${ast.type === 'alien' ? 'alien-obj' : 'asteroid-obj'} text-center transition-none pointer-events-none`}
            style={{ left: `${ast.x}%`, top: `${ast.y}%`, transform: "translate(-50%,-50%)", fontSize: `${ast.size}px`, zIndex: 10 }}>
            {ast.type === 'alien' ? '👾' : ast.size > 38 ? '☄️' : '🪨'}
          </div>
        ))}

        {/* EXPLOSIONS */}
        {explosions.map(ex => (
          <div key={ex.id} className="explosion absolute pointer-events-none"
            style={{ left: `${ex.x}%`, top: `${ex.y}%`, transform: "translate(-50%,-50%)", fontSize: "50px", zIndex: 30 }}>
            💥
          </div>
        ))}

        {/* LASERS */}
        {lasers.map(laser => (
          <div key={laser.id} className="laser-beam absolute pointer-events-none"
            style={{ left: `${laser.x}%`, top: "20%", bottom: "15%", width: "4px", transform: "translateX(-50%)", background: "linear-gradient(#fff, #00ffff, #00ffff00)", borderRadius: "2px", boxShadow: "0 0 10px #06b6d4, 0 0 20px #0891b2", zIndex: 25 }} />
        ))}

        {/* SPACESHIP */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 ship-float z-20">
          <ShipSVG size={100} thrusting={true} />
        </div>

        {/* Shield flash overlay */}
        {shieldFlash && <div className="absolute inset-0 bg-red-500/20 pointer-events-none z-40 rounded" />}
      </div>

      {/* ─── QUESTION PANEL ─── */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 pt-3 flex flex-col gap-3"
        style={{ background: "linear-gradient(#020617, #0c1445)" }}>

        {/* Divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-cyan-800 to-transparent" />

        {currentQ && (
          <div className="w-full max-w-2xl mx-auto">
            {/* Question */}
            <div className="rounded-2xl border border-indigo-800 bg-indigo-950/40 p-5 mb-3"
              style={{ backdropFilter: "blur(8px)" }}
              key={qIndex}>
              <div className="flex items-start gap-3 mb-4">
                <span className="bg-cyan-900 text-cyan-300 font-black px-3 py-1 rounded-full text-sm shrink-0 border border-cyan-700">
                  Q.{qIndex+1}/{questions.length}
                </span>
                <p className="font-bold text-white leading-relaxed">{currentQ.question}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentQ.options?.map((opt, i) => (
                  <button key={i} onClick={() => handleAnswer(i)}
                    className="w-full p-4 text-left border border-indigo-700 hover:border-cyan-500 bg-indigo-950/50 hover:bg-indigo-800/60 text-indigo-100 font-bold rounded-xl flex items-center gap-3 transition-all active:scale-95 group"
                    style={{ boxShadow: "0 0 5px rgba(99,102,241,0.1)" }}>
                    <span className="text-cyan-600 group-hover:text-cyan-400 font-black text-lg w-6 transition-colors">{String.fromCharCode(65+i)}.</span>
                    <span className="text-sm">{opt}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Info bar */}
            <div className="flex items-center justify-between text-xs text-indigo-500 font-bold px-1">
              <span>🚀 {asteroids.length} threats detected</span>
              <span>🔥 Combo: {combo} | Wave: {wave}</span>
              <span>⚡ ×{multiplier} bonus active</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────── SVG SHIP ─────────────────────── */
function ShipSVG({ size, thrusting }) {
  const w = size, h = size * 1.2;
  return (
    <svg width={w} height={h} viewBox="0 0 100 120" style={{ overflow: "visible" }}>
      {/* Engine glow */}
      {thrusting && (
        <ellipse cx={50} cy={108} rx={12} ry={20} fill="#06b6d4" opacity={0.35}
          style={{ filter: "blur(8px)", animation: "thrusterGlow 0.3s ease-in-out infinite" }} />
      )}
      {/* Thruster flame */}
      {thrusting && (
        <>
          <path d="M42 100 Q50 125 58 100 Q50 110 42 100Z" fill="#fbbf24" opacity={0.9}
            style={{ animation: "thrusterGlow 0.2s ease-in-out infinite" }} />
          <path d="M45 100 Q50 118 55 100 Q50 108 45 100Z" fill="white" opacity={0.8} />
        </>
      )}
      {/* Wings */}
      <path d="M20 80 L0 100 L25 95 Z" fill="#1e40af" />
      <path d="M80 80 L100 100 L75 95 Z" fill="#1e40af" />
      {/* Wing accent */}
      <path d="M22 82 L8 96 L26 92 Z" fill="#3b82f6" opacity={0.7} />
      <path d="M78 82 L92 96 L74 92 Z" fill="#3b82f6" opacity={0.7} />
      {/* Main body */}
      <path d="M50 5 L70 85 L50 75 L30 85 Z" fill="#1e3a8a" />
      {/* Body gradient overlay */}
      <path d="M50 5 L62 60 L50 52 L38 60 Z" fill="#2563eb" opacity={0.7} />
      {/* Cockpit */}
      <ellipse cx={50} cy={38} rx={14} ry={20} fill="#164e63" />
      <ellipse cx={50} cy={36} rx={10} ry={15} fill="#06b6d4" opacity={0.7}
        style={{ filter: "drop-shadow(0 0 6px #06b6d4)" }} />
      <ellipse cx={46} cy={32} rx={4} ry={5} fill="white" opacity={0.25} />
      {/* Engine pod */}
      <rect x={37} y={80} width={26} height={14} rx={6} fill="#1e3a8a" />
      <rect x={42} y={82} width={16} height={10} rx={4} fill="#1d4ed8" />
      {/* Laser cannon */}
      <rect x={47} y={2} width={6} height={14} rx={2} fill="#06b6d4"
        style={{ filter: "drop-shadow(0 0 4px #06b6d4)" }} />
      {/* Side lights */}
      <circle cx={28} cy={78} r={3} fill="#f97316"
        style={{ animation: "thrusterGlow 0.5s ease-in-out infinite" }} />
      <circle cx={72} cy={78} r={3} fill="#f97316"
        style={{ animation: "thrusterGlow 0.5s ease-in-out infinite" }} />
    </svg>
  );
}

/* ─────────────────────── STARFIELD ─────────────────────── */
function Starfield() {
  const stars = useRef(
    Array.from({ length: 80 }, (_, i) => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      r: Math.random() * 1.8 + 0.4,
      dur: Math.random() * 3 + 2,
      delay: Math.random() * 4,
    }))
  );

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
      {stars.current.map((s, i) => (
        <circle key={i} cx={`${s.x}%`} cy={`${s.y}%`} r={s.r} fill="white"
          style={{ opacity: 0.6, animation: `starTwinkle ${s.dur}s ${s.delay}s ease-in-out infinite` }} />
      ))}
      {/* Nebula */}
      <ellipse cx="70%" cy="30%" rx="20%" ry="15%" fill="#4f46e5" opacity={0.06} />
      <ellipse cx="20%" cy="60%" rx="15%" ry="10%" fill="#7c3aed" opacity={0.05} />
    </svg>
  );
}
