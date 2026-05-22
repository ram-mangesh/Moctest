import React, { useState, useEffect, useRef } from "react";
import api from "../Api/axios";
import { ArrowLeft, Play, RefreshCw } from "lucide-react";

/**
 * ✨ MAGIC POTION — WITCH'S CAULDRON GAME ✨
 * For Girls — Magical, Beautiful, Fun!
 *
 * Gameplay:
 * 🔮 Answer correctly → Ingredient drops into cauldron
 * 🫧 Cauldron fills up and changes color
 * ❌ Wrong answer → Explosion! Potion level drops
 * 🏆 Fill the cauldron 100% = Brew a Magic Spell!
 */

const INGREDIENTS = [
  { emoji: "🌸", label: "Rose Petals" },
  { emoji: "⭐", label: "Star Dust" },
  { emoji: "🦋", label: "Butterfly Wing" },
  { emoji: "🌙", label: "Moonbeam" },
  { emoji: "💎", label: "Crystal Shard" },
  { emoji: "🌈", label: "Rainbow Drop" },
  { emoji: "✨", label: "Fairy Dust" },
  { emoji: "🍄", label: "Magic Mushroom" },
];

const POTION_COLORS = [
  { bg: "#fce7f3", liquid: "#ec4899", glow: "#f9a8d4", name: "Love Potion" },
  { bg: "#f3e8ff", liquid: "#a855f7", glow: "#d8b4fe", name: "Dream Spell" },
  { bg: "#e0f2fe", liquid: "#0ea5e9", glow: "#93c5fd", name: "Ice Crystal" },
  { bg: "#ecfdf5", liquid: "#10b981", glow: "#34d399", name: "Forest Magic" },
  { bg: "#fef9c3", liquid: "#f59e0b", glow: "#fde68a", name: "Sun Charm" },
  { bg: "#fff1f2", liquid: "#f43f5e", glow: "#fda4af", name: "Phoenix Flame" },
];

export default function MagicPotion({ onBack }) {
  const [exams, setExams]         = useState([]);
  const [questions, setQuestions] = useState([]);
  const [qIndex, setQIndex]       = useState(0);
  const [state, setState]         = useState("MENU");
  const [potionLevel, setPotionLevel] = useState(0);   // 0–100
  const [potionStage, setPotionStage] = useState(0);   // which color
  const [score, setScore]         = useState(0);
  const [combo, setCombo]         = useState(0);
  const [selectedExam, setSelectedExam] = useState(null);

  // Visual effects
  const [fallingIngredient, setFallingIngredient] = useState(null);
  const [bubbles, setBubbles]     = useState([]);
  const [sparkles, setSparkles]   = useState([]);
  const [wrongFlash, setWrongFlash] = useState(false);
  const [potionName, setPotionName] = useState("");
  const [addedIngredient, setAddedIngredient] = useState(null);

  const idRef = useRef(0);
  const uid = () => ++idRef.current;

  useEffect(() => {
    api.get("/user/exams").then(r => setExams(r.data || [])).catch(() => {});
  }, []);

  // Bubble spawner when playing
  useEffect(() => {
    if (state !== "PLAYING" || potionLevel < 5) return;
    const interval = setInterval(() => {
      const newBubble = { id: uid(), x: 30 + Math.random() * 40, delay: Math.random() * 0.5 };
      setBubbles(b => [...b.slice(-8), newBubble]);
    }, 600);
    return () => clearInterval(interval);
  }, [state, potionLevel]);

  // Sparkle spawner on correct answer
  const spawnSparkles = () => {
    const sp = Array.from({ length: 8 }, () => ({
      id: uid(), x: 20 + Math.random() * 60, y: 20 + Math.random() * 60, angle: Math.random() * 360,
    }));
    setSparkles(sp);
    setTimeout(() => setSparkles([]), 1000);
  };

  const startGame = async (exam) => {
    setSelectedExam(exam);
    setState("LOADING");
    try {
      const res = await api.get(`/user/questions?topicId=${exam.id}`);
      const qs = (res.data || []).sort(() => Math.random() - 0.5).slice(0, 20);
      if (!qs.length) throw new Error("No questions found");
      setQuestions(qs);
      setQIndex(0); setScore(0); setCombo(0);
      setPotionLevel(0); setPotionStage(0);
      setPotionName(POTION_COLORS[0].name);
      setFallingIngredient(null); setBubbles([]); setSparkles([]);
      setState("PLAYING");
    } catch (e) { alert(e.message); setState("MENU"); }
  };

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
      const bonus = newCombo >= 3 ? 2 : 1;
      const gain  = 8 + Math.floor(Math.random() * 6);
      const newLevel = Math.min(100, potionLevel + gain * bonus);
      const ingredient = INGREDIENTS[Math.floor(Math.random() * INGREDIENTS.length)];

      setFallingIngredient({ ...ingredient, id: uid() });
      setTimeout(() => setFallingIngredient(null), 1000);
      setAddedIngredient(ingredient);
      setTimeout(() => setAddedIngredient(null), 1200);

      const newStage = Math.min(POTION_COLORS.length - 1, Math.floor(newLevel / 17));
      setPotionLevel(newLevel);
      setPotionStage(newStage);
      setPotionName(POTION_COLORS[newStage].name);
      setScore(s => s + 300 * bonus);
      spawnSparkles();

      if (newLevel >= 100) { setTimeout(() => setState("WIN"), 800); return; }
    } else {
      setCombo(0);
      setWrongFlash(true);
      setTimeout(() => setWrongFlash(false), 700);
      setPotionLevel(l => Math.max(0, l - 10));
    }

    if (nextIdx >= questions.length) setTimeout(() => setState("WIN"), 800);
  };

  const pc = POTION_COLORS[potionStage];

  // =================== MENU ===================
  if (state === "MENU") return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center p-8 text-white relative overflow-hidden"
      style={{ background: "linear-gradient(160deg, #1a0533, #2d0a4e, #1a0533)" }}>
      <StarBg />
      <button onClick={onBack} className="absolute top-6 left-6 text-pink-400 hover:text-white flex items-center gap-2 font-bold z-10">
        <ArrowLeft size={20} /> Arcade
      </button>
      <div className="z-10 flex flex-col items-center">
        <CauldronSVG level={45} stage={1} animated />
        <h1 className="text-5xl font-black mt-4 mb-1 text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400">
          MAGIC POTION
        </h1>
        <p className="text-purple-300/70 font-bold mb-2 text-sm tracking-widest">WITCH'S CAULDRON</p>
        <p className="text-slate-400 font-bold mb-10 text-center text-sm max-w-sm">
          Drop magic ingredients into the cauldron!<br />
          Answer correctly to brew a powerful spell ✨
        </p>
        <h2 className="text-white font-black text-lg mb-4 uppercase tracking-widest">Choose Your Spell Book</h2>
        <div className="grid grid-cols-1 gap-3 w-full max-w-md">
          {exams.length === 0 && <p className="text-purple-400 animate-pulse text-center">Brewing options...</p>}
          {exams.map(ex => (
            <button key={ex.id} onClick={() => startGame(ex)}
              className="w-full p-4 border border-purple-700 hover:border-pink-400 bg-purple-950/40 hover:bg-purple-900/50 text-purple-200 font-black text-left rounded-2xl flex items-center justify-between transition-all active:scale-95"
              style={{ boxShadow: "0 0 10px rgba(168,85,247,0.2)" }}>
              <span>🔮 {ex.name}</span>
              <Play size={18} className="text-pink-400" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  if (state === "LOADING") return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center" style={{ background: "#1a0533" }}>
      <div className="text-6xl animate-bounce mb-4">🔮</div>
      <p className="text-purple-300 font-black text-2xl animate-pulse">Mixing ingredients...</p>
    </div>
  );

  if (state === "WIN") return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center p-8 text-center relative overflow-hidden"
      style={{ background: "linear-gradient(160deg, #1a0533, #2d0a4e)" }}>
      <StarBg />
      <div className="z-10 flex flex-col items-center">
        <CauldronSVG level={100} stage={potionStage} animated />
        <h1 className="text-5xl font-black mt-4 mb-2 text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
          SPELL COMPLETE!
        </h1>
        <p className="text-yellow-300 font-black text-2xl mb-1">✨ {pc.name} Brewed! ✨</p>
        <div className="border border-purple-700 bg-purple-950/40 rounded-3xl p-6 mb-6 text-left w-full max-w-sm mt-4">
          <div className="text-purple-400 font-black text-xs mb-1 uppercase">Magic Power</div>
          <div className="text-pink-300 font-black text-4xl mb-3">{score.toLocaleString()} ⭐</div>
          <div className="text-slate-400 text-sm font-bold">Questions Answered: {qIndex}</div>
          <div className="text-slate-400 text-sm font-bold">Best Combo: {combo}</div>
        </div>
        <div className="flex gap-4 w-full max-w-sm">
          <button onClick={() => startGame(selectedExam)} className="flex-1 py-4 font-black rounded-2xl text-white flex items-center justify-center gap-2" style={{ background: "linear-gradient(135deg,#ec4899,#a855f7)" }}>
            <RefreshCw size={18} /> Brew Again
          </button>
          <button onClick={onBack} className="flex-1 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl flex items-center justify-center gap-2">
            <ArrowLeft size={18} /> Leave
          </button>
        </div>
      </div>
    </div>
  );

  // =================== MAIN GAME ===================
  const currentQ = questions[qIndex % questions.length];

  return (
    <div className="w-full min-h-screen flex flex-col overflow-hidden"
      style={{ background: "linear-gradient(160deg, #1a0533, #0f062a)" }}>
      <style>{`
        @keyframes fall { 0%{transform:translateY(-80px) rotate(0deg);opacity:1;} 100%{transform:translateY(220px) rotate(360deg);opacity:0;} }
        @keyframes bubble { 0%{transform:translateY(0) scale(0.5);opacity:0.8;} 100%{transform:translateY(-60px) scale(0.1);opacity:0;} }
        @keyframes sparkleOut { 0%{transform:translate(0,0) scale(1);opacity:1;} 100%{transform:translate(var(--tx),var(--ty)) scale(0);opacity:0;} }
        @keyframes wrongPop { 0%,100%{transform:scale(1);} 50%{transform:scale(1.05);} }
        @keyframes potionGlow { 0%,100%{filter:drop-shadow(0 0 10px var(--glow));} 50%{filter:drop-shadow(0 0 25px var(--glow));} }
        @keyframes cauldronBob { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-4px);} }
        @keyframes shimmer { 0%{background-position:200% 0;} 100%{background-position:-200% 0;} }
        @keyframes popIn { 0%{transform:scale(0) rotate(-20deg);opacity:0;} 60%{transform:scale(1.15) rotate(5deg);} 100%{transform:scale(1) rotate(0);opacity:1;} }
        @keyframes starTwinkle { 0%,100%{opacity:0.3;} 50%{opacity:1;} }
        .ing-fall { animation: fall 0.9s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; }
        .bubble-rise { animation: bubble 1.2s ease-out forwards; }
        .sparkle-fly { animation: sparkleOut 0.8s ease-out forwards; }
        .wrong-flash { animation: wrongPop 0.3s ease-out 2; }
        .cauldron-bob { animation: cauldronBob 2s ease-in-out infinite; }
        .ingredient-popup { animation: popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        .shimmer-bar { background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent); background-size: 200% 100%; animation: shimmer 1.5s linear infinite; }
      `}</style>
      <StarBg />

      {/* ─── TOP HUD ─── */}
      <div className="relative z-20 px-4 pt-3 pb-2 flex justify-between items-center">
        <button onClick={onBack} className="text-purple-400 hover:text-white transition-colors"><ArrowLeft size={22} /></button>
        <div className="text-center">
          <p className="text-pink-400 font-black text-xs uppercase tracking-widest">{pc.name}</p>
          <p className="text-purple-300 font-black text-sm">{potionLevel.toFixed(0)}% Brewed</p>
        </div>
        <div className="text-right">
          <p className="text-yellow-300 font-black text-lg">{score.toLocaleString()} ⭐</p>
          {combo > 1 && <p className="text-pink-400 font-bold text-xs">🔥 {combo}x combo!</p>}
        </div>
      </div>

      {/* ─── CAULDRON SECTION ─── */}
      <div className="relative z-10 flex flex-col items-center pt-2 pb-4" style={{ minHeight: "38vh" }}>

        {/* Wrong answer overlay */}
        {wrongFlash && <div className="absolute inset-0 bg-red-500/25 pointer-events-none z-30 rounded-xl wrong-flash" />}

        {/* Falling ingredient */}
        {fallingIngredient && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 z-30 ing-fall text-5xl">
            {fallingIngredient.emoji}
          </div>
        )}

        {/* Sparkles */}
        {sparkles.map(sp => (
          <div key={sp.id} className="sparkle-fly absolute text-2xl pointer-events-none z-30"
            style={{ left: `${sp.x}%`, top: `${sp.y}%`,
              "--tx": `${Math.cos(sp.angle * Math.PI/180)*50}px`,
              "--ty": `${Math.sin(sp.angle * Math.PI/180)*50}px` }}>
            ✨
          </div>
        ))}

        {/* Cauldron SVG */}
        <div className="cauldron-bob relative z-10">
          <CauldronSVG level={potionLevel} stage={potionStage} animated />

          {/* Bubbles inside cauldron */}
          <div className="absolute" style={{ bottom: "30%", left: "25%", width: "50%", height: "40%", overflow: "hidden" }}>
            {bubbles.map(b => (
              <div key={b.id} className="bubble-rise absolute rounded-full"
                style={{ left: `${b.x}%`, bottom: 0, width: "10px", height: "10px",
                  background: pc.glow, boxShadow: `0 0 6px ${pc.glow}`, animationDelay: `${b.delay}s` }} />
            ))}
          </div>
        </div>

        {/* Added ingredient toast */}
        {addedIngredient && (
          <div className="ingredient-popup absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-full font-black text-sm z-40 border border-pink-400 shadow-lg"
            style={{ background: "rgba(88,28,135,0.9)", color: pc.liquid }}>
            <span className="text-xl">{addedIngredient.emoji}</span>
            <span>{addedIngredient.label} added!</span>
          </div>
        )}

        {/* Level bar */}
        <div className="w-full px-6 mt-2 z-20">
          <div className="relative h-4 rounded-full overflow-hidden border border-purple-700/50" style={{ background: "rgba(30,5,60,0.8)" }}>
            <div className="h-full rounded-full transition-all duration-700 relative overflow-hidden"
              style={{ width: `${potionLevel}%`, background: `linear-gradient(90deg, ${pc.liquid}, ${pc.glow})`, boxShadow: `0 0 12px ${pc.glow}` }}>
              <div className="absolute inset-0 shimmer-bar" />
            </div>
          </div>
        </div>
      </div>

      {/* ─── QUESTION PANEL ─── */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 z-20 relative">
        {currentQ && (
          <div className="w-full max-w-2xl mx-auto rounded-3xl border border-purple-800/60 p-5"
            style={{ background: "rgba(30,5,60,0.7)", backdropFilter: "blur(12px)" }}
            key={qIndex}>
            <div className="flex items-start gap-3 mb-4 border-b border-purple-800/40 pb-4">
              <span className="text-xs font-black px-3 py-1 rounded-full border shrink-0" style={{ background: pc.liquid + "30", borderColor: pc.liquid, color: pc.glow }}>
                Q.{qIndex+1}/{questions.length}
              </span>
              <p className="font-bold text-white leading-relaxed">{currentQ.question}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentQ.options?.map((opt, i) => (
                <button key={i} onClick={() => handleAnswer(i)}
                  className="w-full p-4 text-left border border-purple-800/50 text-purple-100 font-bold rounded-2xl flex items-center gap-3 transition-all active:scale-95 group"
                  style={{ background: "rgba(88,28,135,0.3)" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = pc.liquid; e.currentTarget.style.background = `${pc.liquid}20`; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = ""; e.currentTarget.style.background = "rgba(88,28,135,0.3)"; }}>
                  <span className="font-black text-lg w-6" style={{ color: pc.glow }}>{String.fromCharCode(65+i)}.</span>
                  <span className="text-sm">{opt}</span>
                </button>
              ))}
            </div>
            <p className="mt-3 text-purple-600 text-xs text-center font-bold">
              🔮 {potionLevel < 90 ? "Keep brewing your magic spell!" : "Almost ready — one last push!"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────── CAULDRON SVG ─────────── */
function CauldronSVG({ level = 0, stage = 0, size = 200, animated }) {
  const pc = POTION_COLORS[stage];
  const liquidHeight = Math.max(0, Math.min(60, level * 0.62));
  const showSteam = level > 20;

  return (
    <svg width={size} height={size * 1.1} viewBox="0 0 200 220" style={{ overflow: "visible" }}>
      {/* ── LEGS ── */}
      <rect x={55} y={190} width={12} height={25} rx={4} fill="#1e1b4b" />
      <rect x={133} y={190} width={12} height={25} rx={4} fill="#1e1b4b" />

      {/* ── CAULDRON BODY ── */}
      <ellipse cx={100} cy={165} rx={72} ry={25} fill="#1e1b4b" />
      <path d="M 28 100 Q 28 190 100 190 Q 172 190 172 100 Z" fill="#312e81" />
      <path d="M 33 105 Q 33 183 100 183 Q 167 183 167 105 Z" fill="#1e1b4b" />

      {/* ── LIQUID ── */}
      {level > 0 && (
        <clipPath id="cauldronClip">
          <path d="M 33 105 Q 33 183 100 183 Q 167 183 167 105 Z" />
        </clipPath>
      )}
      {level > 0 && (
        <g clipPath="url(#cauldronClip)">
          <rect x={33} y={183 - liquidHeight} width={134} height={liquidHeight + 20}
            fill={pc.liquid} opacity={0.85}
            style={{ filter: `drop-shadow(0 0 10px ${pc.glow})` }} />
          {/* Wave on top of liquid */}
          <path d={`M 33 ${183 - liquidHeight} Q 55 ${183 - liquidHeight - 6} 77 ${183 - liquidHeight} Q 99 ${183 - liquidHeight + 6} 121 ${183 - liquidHeight} Q 143 ${183 - liquidHeight - 6} 167 ${183 - liquidHeight}`}
            stroke={pc.glow} strokeWidth={3} fill="none" opacity={0.9} />
        </g>
      )}

      {/* ── RIM / OPEN TOP ── */}
      <ellipse cx={100} cy={100} rx={72} ry={22} fill="#312e81" />
      <ellipse cx={100} cy={100} rx={65} ry={18} fill="#1e1b4b" />
      {level > 60 && <ellipse cx={100} cy={100} rx={60} ry={16} fill={pc.liquid} opacity={0.5} style={{ filter: `drop-shadow(0 0 8px ${pc.glow})` }} />}

      {/* ── HANDLES ── */}
      <path d="M 28 100 Q 10 80 20 65 Q 30 50 38 68" stroke="#312e81" strokeWidth={8} fill="none" strokeLinecap="round" />
      <path d="M 172 100 Q 190 80 180 65 Q 170 50 162 68" stroke="#312e81" strokeWidth={8} fill="none" strokeLinecap="round" />

      {/* ── STEAM ── */}
      {showSteam && (
        <>
          <path d="M 78 90 Q 72 70 80 55 Q 88 40 80 25" stroke={pc.glow} strokeWidth={3} fill="none" strokeLinecap="round" opacity={0.6}
            style={{ animation: "bubble 2s ease-out infinite" }} />
          <path d="M 100 88 Q 94 65 102 50 Q 110 35 102 18" stroke={pc.glow} strokeWidth={3} fill="none" strokeLinecap="round" opacity={0.8}
            style={{ animation: "bubble 2s ease-out 0.5s infinite" }} />
          <path d="M 122 90 Q 128 68 120 52 Q 112 36 120 20" stroke={pc.glow} strokeWidth={3} fill="none" strokeLinecap="round" opacity={0.5}
            style={{ animation: "bubble 2s ease-out 1s infinite" }} />
        </>
      )}

      {/* ── GLOW ── */}
      {level > 0 && (
        <ellipse cx={100} cy={175} rx={60} ry={12} fill={pc.liquid} opacity={0.25}
          style={{ filter: "blur(8px)" }} />
      )}

      {/* ── STARS when full ── */}
      {level >= 90 && (
        <>
          {[0,1,2,3,4,5].map(i => {
            const angle = (i / 6) * Math.PI * 2;
            return (
              <text key={i} x={100 + 80 * Math.cos(angle)} y={100 + 30 * Math.sin(angle)} fontSize={16} textAnchor="middle" dominantBaseline="middle"
                style={{ animation: `starTwinkle ${1 + i*0.2}s ease-in-out infinite` }}>
                ✨
              </text>
            );
          })}
        </>
      )}
    </svg>
  );
}

/* ─────────── STAR BACKGROUND ─────────── */
function StarBg() {
  const stars = useRef(Array.from({ length: 60 }, () => ({
    x: Math.random() * 100, y: Math.random() * 100,
    r: Math.random() * 1.5 + 0.5, dur: Math.random() * 3 + 2, delay: Math.random() * 5,
  })));
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
      {stars.current.map((s, i) => (
        <circle key={i} cx={`${s.x}%`} cy={`${s.y}%`} r={s.r} fill="white"
          style={{ opacity: 0.4, animation: `starTwinkle ${s.dur}s ${s.delay}s ease-in-out infinite` }} />
      ))}
    </svg>
  );
}
