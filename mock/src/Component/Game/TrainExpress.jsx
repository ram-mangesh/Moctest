import React, { useState, useEffect, useRef } from "react";
import api from "../Api/axios";
import { ArrowLeft, Play, RefreshCw } from "lucide-react";

/**
 * TRAIN EXPRESS 🚂
 * A side-scrolling train game.
 * ✅ Correct Answer → Train speeds up, moves toward destination
 * ❌ Wrong Answer   → Train slows down, emits smoke/sparks
 * 🏁 Reach 100% → Station Arrived = WIN!
 */

export default function TrainExpress({ onBack }) {
  const [exams, setExams] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [qIndex, setQIndex] = useState(0);
  const [journey, setJourney] = useState(0);   // 0-100
  const [speed, setSpeed]     = useState(0);   // km/h display
  const [state, setState]     = useState("MENU");
  const [score, setScore]     = useState(0);
  const [smokeActive, setSmokeActive] = useState(false);
  const [sparkActive, setSparkActive] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [bgOffset, setBgOffset] = useState(0);
  const [trainShake, setTrainShake] = useState(false);
  const [question, setQuestion] = useState(null);

  const animRef = useRef(null);
  const journeyRef = useRef(journey);
  journeyRef.current = journey;

  useEffect(() => {
    api.get("/user/exams").then(r => setExams(r.data || [])).catch(() => {});
  }, []);

  // BG scroll animation
  useEffect(() => {
    if (state === "PLAYING" && speed > 0) {
      animRef.current = setInterval(() => {
        setBgOffset(o => (o + speed * 0.4) % 2000);
      }, 50);
    } else {
      clearInterval(animRef.current);
    }
    return () => clearInterval(animRef.current);
  }, [state, speed]);

  const startGame = async (exam) => {
    setSelectedExam(exam);
    setState("LOADING");
    try {
      const res = await api.get(`/user/questions?topicId=${exam.id}`);
      const qs = (res.data || []).sort(() => Math.random() - 0.5).slice(0, 20);
      if (!qs.length) throw new Error("No questions found");
      setQuestions(qs);
      setQIndex(0);
      setJourney(0);
      setScore(0);
      setSpeed(0);
      setBgOffset(0);
      setQuestion(qs[0]);
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

    const nextIdx = qIndex + 1;
    setQIndex(nextIdx);
    if (nextIdx < questions.length) setQuestion(questions[nextIdx]);

    if (isCorrect) {
      const advance = Math.floor(Math.random() * 8) + 8; // 8-15%
      const newJourney = Math.min(100, journeyRef.current + advance);
      setJourney(newJourney);
      setSpeed(s => Math.min(180, s + 20));
      setScore(s => s + Math.round(advance * 100));
      setSmokeActive(true);
      setTimeout(() => setSmokeActive(false), 1200);
      if (newJourney >= 100) {
        setTimeout(() => setState("WIN"), 800);
      }
    } else {
      setSpeed(s => Math.max(0, s - 30));
      setSparkActive(true);
      setTrainShake(true);
      setTimeout(() => { setSparkActive(false); setTrainShake(false); }, 800);
    }
  };

  const stationDistance = Math.max(0, 100 - journey);
  const stationPx = Math.min(85, 15 + journey * 0.7); // % from left
  const trainSpeedClass = speed > 100 ? "ultrafast" : speed > 60 ? "fast" : speed > 20 ? "medium" : "slow";

  // ===================== MENU =====================
  if (state === "MENU") return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center p-8 text-white relative overflow-hidden"
      style={{ background: "linear-gradient(160deg, #0f172a, #1e3a5f, #0f172a)" }}>
      <div className="absolute inset-0 opacity-5 pointer-events-none"
        style={{ backgroundImage: "repeating-linear-gradient(90deg,#60a5fa 0px,#60a5fa 1px,transparent 1px,transparent 60px), repeating-linear-gradient(0deg,#60a5fa 0px,#60a5fa 1px,transparent 1px,transparent 60px)" }} />
      <button onClick={onBack} className="absolute top-6 left-6 text-blue-400 hover:text-white flex items-center gap-2 font-bold z-10">
        <ArrowLeft size={20} /> Arcade
      </button>
      
      <TrainSVG size={200} smokeActive={false} sparkActive={false} shake={false} />
      <h1 className="text-5xl font-black mt-4 mb-2" style={{ color: "#60a5fa", textShadow: "0 0 30px #3b82f6" }}>
        TRAIN EXPRESS
      </h1>
      <p className="text-blue-300 font-bold mb-10 text-center max-w-md">
        Answer questions to keep the train moving! 🚂<br/>
        Correct → Full Steam Ahead! | Wrong → Emergency Brakes!
      </p>

      <h2 className="text-white font-black text-lg mb-4 uppercase tracking-widest">Select Destination</h2>
      <div className="grid grid-cols-1 gap-3 w-full max-w-md">
        {exams.length === 0 && <p className="text-blue-500 animate-pulse text-center">Loading routes...</p>}
        {exams.map(ex => (
          <button key={ex.id} onClick={() => startGame(ex)}
            className="w-full p-4 border border-blue-800 hover:border-blue-400 bg-blue-950/40 hover:bg-blue-900/50 text-blue-200 font-black text-left rounded-xl flex items-center justify-between transition-all active:scale-95">
            <span>🏁 {ex.name}</span>
            <Play size={18} className="text-blue-400" />
          </button>
        ))}
      </div>
    </div>
  );

  if (state === "LOADING") return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center" style={{ background: "#0f172a" }}>
      <div className="text-6xl mb-4" style={{ animation: "trainMove 0.5s ease-in-out infinite alternate", display: "inline-block" }}>🚂</div>
      <p className="text-blue-400 font-black text-2xl animate-pulse">Boarding passengers...</p>
    </div>
  );

  if (state === "WIN") return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center p-8 text-center"
      style={{ background: "radial-gradient(circle at center, #1e3a5f, #0f172a 70%)" }}>
      <div className="text-[100px] mb-4">🏁</div>
      <h1 className="text-6xl font-black text-blue-400 mb-3" style={{ textShadow: "0 0 40px #3b82f6" }}>ARRIVED!</h1>
      <p className="text-blue-300 font-bold text-xl mb-2">Train reached the destination!</p>
      <div className="my-6 border border-blue-800 bg-blue-950/30 rounded-2xl p-6 text-left w-full max-w-sm">
        <div className="text-blue-400 font-black text-xs mb-1 uppercase">Total Score</div>
        <div className="text-blue-200 font-black text-4xl mb-3">{score.toLocaleString()}</div>
        <div className="text-slate-400 text-sm font-bold">Top Speed: {speed} km/h</div>
        <div className="text-slate-400 text-sm font-bold">Questions Answered: {qIndex}</div>
      </div>
      <div className="flex gap-4 w-full max-w-sm">
        <button onClick={() => startGame(selectedExam)} className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl flex items-center justify-center gap-2">
          <RefreshCw size={18} /> New Journey
        </button>
        <button onClick={onBack} className="flex-1 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl flex items-center justify-center gap-2">
          <ArrowLeft size={18} /> Menu
        </button>
      </div>
    </div>
  );

  // ===================== MAIN GAME =====================
  return (
    <div className="w-full min-h-screen flex flex-col overflow-hidden select-none"
      style={{ background: "linear-gradient(160deg, #0f172a, #1e3a5f)" }}>
      <style>{`
        @keyframes trainBob { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-4px);} }
        @keyframes trainShake { 0%,100%{transform:translateX(0);} 25%{transform:translateX(-6px);} 75%{transform:translateX(6px);} }
        @keyframes smokeRise { 0%{transform:translateY(0) scale(0.5);opacity:1;} 100%{transform:translateY(-60px) scale(2);opacity:0;} }
        @keyframes sparkFly { 0%{transform:translate(0,0) scale(1);opacity:1;} 100%{transform:translate(40px,20px) scale(0.2);opacity:0;} }
        @keyframes trackMove { 0%{background-position:0px 0;} 100%{background-position:-120px 0;} }
        @keyframes mountainScroll { 0%{background-position:0px 0;} 100%{background-position:-2000px 0;} }
        @keyframes treeScroll { 0%{background-position:0px 0;} 100%{background-position:-1200px 0;} }
        @keyframes cloudScroll { 0%{background-position:0px 0;} 100%{background-position:-3000px 0;} }
        @keyframes fadeSlideUp { 0%{transform:translateY(20px);opacity:0;} 100%{transform:translateY(0);opacity:1;} }
        @keyframes wheelSpin { 0%{transform:rotate(0deg);} 100%{transform:rotate(360deg);} }
        @keyframes pistonPush { 0%,100%{transform:scaleX(0.7);} 50%{transform:scaleX(1);} }
        
        .train-bob { animation: trainBob ${speed > 60 ? '0.15s' : speed > 20 ? '0.3s' : '0.6s'} ease-in-out infinite; }
        .train-shake { animation: trainShake 0.1s linear infinite; }
        .smoke-puff { animation: smokeRise 1.2s ease-out forwards; }
        .spark { animation: sparkFly 0.6s ease-out forwards; }
        .track-layer { background-image: repeating-linear-gradient(90deg,#374151 0px,#374151 60px,#1f2937 60px,#1f2937 120px); 
          animation: trackMove ${speed > 0 ? Math.max(0.1, 1.5 - speed*0.01) + 's' : '99999s'} linear infinite; }
        .mountain-layer { background-image: url("data:image/svg+xml;utf8,<svg width='400' height='120' xmlns='http://www.w3.org/2000/svg'><polygon points='0,120 60,20 120,120' fill='%231e3a5f'/><polygon points='80,120 160,10 240,120' fill='%231e40af' opacity='0.6'/><polygon points='200,120 280,35 360,120' fill='%231e3a5f'/><polygon points='320,120 380,50 440,120' fill='%231e40af' opacity='0.5'/></svg>");
          background-repeat: repeat-x; background-position: bottom;
          animation: mountainScroll ${speed > 0 ? Math.max(2, 20 - speed*0.1)+'s' : '99999s'} linear infinite; }
        .tree-layer { background-image: url("data:image/svg+xml;utf8,<svg width='200' height='80' xmlns='http://www.w3.org/2000/svg'><rect x='18' y='50' width='8' height='30' fill='%23854d0e'/><polygon points='0,50 22,5 44,50' fill='%22166534'/><rect x='108' y='55' width='6' height='25' fill='%23854d0e'/><polygon points='94,55 111,15 128,55' fill='%2315803d'/><polygon points='90,45 111,5 132,45' fill='%2316a34a'/></svg>");
          background-repeat: repeat-x; background-position: bottom;
          animation: treeScroll ${speed > 0 ? Math.max(0.8, 8 - speed*0.06)+'s' : '99999s'} linear infinite; }
        .cloud-layer { background-image: url("data:image/svg+xml;utf8,<svg width='300' height='60' xmlns='http://www.w3.org/2000/svg'><ellipse cx='60' cy='40' rx='50' ry='20' fill='%23e2e8f0' opacity='0.3'/><ellipse cx='60' cy='30' rx='30' ry='20' fill='%23f1f5f9' opacity='0.2'/><ellipse cx='220' cy='45' rx='40' ry='15' fill='%23e2e8f0' opacity='0.25'/></svg>");
          background-repeat: repeat-x;
          animation: cloudScroll ${speed > 0 ? Math.max(3, 30 - speed*0.2)+'s' : '99999s'} linear infinite; }
        .wheel-anim { animation: wheelSpin ${speed > 0 ? Math.max(0.1, 0.8 - speed*0.006)+'s' : 'none'} linear infinite; }
        .piston-anim { animation: pistonPush ${speed > 0 ? Math.max(0.05, 0.4 - speed*0.003)+'s' : 'none'} ease-in-out infinite; transform-origin: left center; }
      `}</style>

      {/* ───────── SKY + MOUNTAINS ───────── */}
      <div className="relative w-full flex-none" style={{ height: "45vh" }}>
        {/* Sky gradient */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg,#0c1445 0%,#1a3a6e 60%,#2563eb 100%)" }} />
        {/* Stars (only show when speed < 40) */}
        {speed < 40 && (
          <div className="absolute inset-0 opacity-60"
            style={{ backgroundImage: "radial-gradient(1px 1px at 10% 20%,white,transparent),radial-gradient(1px 1px at 30% 10%,white,transparent),radial-gradient(1px 1px at 50% 25%,white,transparent),radial-gradient(1px 1px at 70% 15%,white,transparent),radial-gradient(1px 1px at 90% 30%,white,transparent)" }} />
        )}
        {/* Clouds */}
        <div className="absolute top-0 w-full h-[40%] cloud-layer" />
        {/* Mountains */}
        <div className="absolute bottom-0 w-full h-[70%] mountain-layer" />
        {/* Trees */}
        <div className="absolute bottom-0 w-full h-[35%] tree-layer" />

        {/* Distant station */}
        <div className="absolute bottom-0 transition-all duration-700"
          style={{ right: `${Math.max(2, 100 - stationPx)}%`, transform: "translateX(50%)" }}>
          <div className="flex flex-col items-center">
            <div className="text-2xl">🏁</div>
            <div className="bg-blue-900/80 border border-blue-500 text-blue-200 text-xs font-black px-2 py-0.5 rounded whitespace-nowrap">
              {stationDistance < 5 ? "ARRIVING!" : `${stationDistance.toFixed(0)}km`}
            </div>
            <div className="w-1 h-16 bg-blue-600" />
          </div>
        </div>

        {/* Speed indicator */}
        <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
          <div className="bg-slate-900/80 border border-blue-700 rounded-xl px-4 py-2 text-blue-300 font-black text-2xl">
            {speed} <span className="text-sm text-blue-500">km/h</span>
          </div>
          <div className="bg-slate-900/80 border border-yellow-700 rounded-xl px-4 py-2 text-yellow-300 font-black text-xl">
            ${score.toLocaleString()}
          </div>
        </div>

        {/* Back button */}
        <button onClick={onBack} className="absolute top-4 left-4 text-blue-400 hover:text-white z-20">
          <ArrowLeft size={24} />
        </button>
      </div>

      {/* ───────── GROUND + TRACKS + TRAIN ───────── */}
      <div className="relative w-full flex-none" style={{ height: "140px", background: "#1f2937" }}>
        {/* Ground */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(#374151,#1f2937)" }} />
        {/* Rails */}
        <div className="absolute top-6 left-0 w-full h-5 track-layer opacity-80" />
        <div className="absolute top-16 left-0 w-full h-5 track-layer opacity-80" />
        {/* Sleepers */}
        <div className="absolute top-4 left-0 w-full h-[56px]"
          style={{ backgroundImage: "repeating-linear-gradient(90deg,transparent,transparent 50px,#4b5563 50px,#4b5563 66px)", backgroundPositionX: `-${bgOffset % 66}px` }} />

        {/* SMOKE above train */}
        {smokeActive && (
          <>
            <div className="absolute smoke-puff w-8 h-8 rounded-full bg-slate-400/60" style={{ left: "14%", top: "-40px" }} />
            <div className="absolute smoke-puff w-5 h-5 rounded-full bg-slate-300/50" style={{ left: "16%", top: "-20px", animationDelay: "0.1s" }} />
            <div className="absolute smoke-puff w-6 h-6 rounded-full bg-white/30" style={{ left: "12%", top: "-50px", animationDelay: "0.2s" }} />
          </>
        )}

        {/* SPARKS on brake */}
        {sparkActive && (
          <>
            {[0,1,2,3,4].map(i => (
              <div key={i} className="absolute spark w-2 h-2 rounded-full bg-yellow-400"
                style={{ left: `${18 + i*3}%`, top: "40px", animationDelay: `${i*0.05}s` }} />
            ))}
          </>
        )}

        {/* THE TRAIN SVG */}
        <div className={`absolute left-[10%] top-[-10px] ${trainShake ? 'train-shake' : 'train-bob'}`}>
          <TrainSVG size={180} smokeActive={smokeActive} sparkActive={sparkActive} shake={trainShake} speed={speed} />
        </div>
      </div>

      {/* ───────── PROGRESS BAR ───────── */}
      <div className="w-full px-4 py-2 bg-slate-900/60">
        <div className="flex justify-between text-xs text-blue-400 font-bold mb-1">
          <span>🚉 Start</span>
          <span className="text-blue-200 font-black">{journey.toFixed(0)}% Complete</span>
          <span>🏁 Destination</span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-4 border border-slate-700 overflow-hidden">
          <div className="h-full rounded-full transition-all duration-700 relative overflow-hidden"
            style={{ width: `${journey}%`, background: "linear-gradient(90deg,#1d4ed8,#3b82f6,#60a5fa)", boxShadow: "0 0 15px #3b82f6" }}>
            <div className="absolute inset-0 opacity-30"
              style={{ backgroundImage: "repeating-linear-gradient(120deg,transparent,transparent 10px,white 10px,white 12px)", animation: "trackMove 0.5s linear infinite" }} />
          </div>
        </div>
      </div>

      {/* ───────── QUESTION PANEL ───────── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col">
        {question && (
          <div className="w-full max-w-2xl mx-auto rounded-2xl border border-blue-800 bg-blue-950/30 p-5 text-white"
            style={{ backdropFilter: "blur(10px)", animation: "fadeSlideUp 0.3s ease" }} key={qIndex}>
            <div className="flex items-start gap-3 mb-4 border-b border-blue-800/50 pb-4">
              <span className="bg-blue-600 text-white font-black px-3 py-1 rounded-full text-sm shrink-0">Q.{qIndex+1}</span>
              <p className="font-bold leading-relaxed text-blue-100">{question.question}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {question.options?.map((opt, i) => (
                <button key={i} onClick={() => handleAnswer(i)}
                  className="w-full p-4 text-left border border-blue-800 hover:border-blue-400 bg-blue-950/40 hover:bg-blue-800/50 text-blue-100 font-bold rounded-xl flex items-center gap-3 transition-all active:scale-95">
                  <span className="text-blue-500 font-black text-lg w-6">{String.fromCharCode(65+i)}.</span>
                  <span className="text-sm">{opt}</span>
                </button>
              ))}
            </div>
            <p className="mt-3 text-blue-600 text-xs font-bold text-center">
              🚂 {journey < 90 ? "Keep the train moving!" : "Almost at destination!"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ===================== TRAIN SVG ===================== */
function TrainSVG({ size, speed = 0, shake = false }) {
  const w = size;
  const h = size * 0.55;
  const wheelR = h * 0.22;
  const spinDur = speed > 0 ? Math.max(0.08, 0.6 - speed * 0.005) + "s" : "0s";

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ overflow: "visible" }}>
      {/* === CHIMNEY === */}
      <rect x={w*0.08} y={h*0.05} width={w*0.06} height={h*0.25} rx={3} fill="#374151" />
      <rect x={w*0.055} y={h*0.03} width={w*0.11} height={h*0.08} rx={3} fill="#4b5563" />

      {/* === BOILER (front round cab) === */}
      <ellipse cx={w*0.18} cy={h*0.38} rx={w*0.1} ry={h*0.18} fill="#1e40af" />
      <rect x={w*0.08} y={h*0.22} width={w*0.18} height={h*0.32} fill="#1e40af" rx={4} />

      {/* === MAIN BODY === */}
      <rect x={w*0.18} y={h*0.2} width={w*0.55} height={h*0.38} rx={8} fill="#1d4ed8" />
      {/* Stripe */}
      <rect x={w*0.18} y={h*0.33} width={w*0.55} height={h*0.08} fill="#2563eb" />

      {/* === CABIN === */}
      <rect x={w*0.55} y={h*0.06} width={w*0.22} height={h*0.4} rx={6} fill="#1e3a8a" />
      {/* Windows */}
      <rect x={w*0.58} y={h*0.1} width={w*0.07} height={h*0.14} rx={3} fill="#93c5fd" opacity={0.9} />
      <rect x={w*0.68} y={h*0.1} width={w*0.07} height={h*0.14} rx={3} fill="#93c5fd" opacity={0.9} />

      {/* === COW CATCHER (front) === */}
      <polygon points={`${w*0.02},${h*0.58} ${w*0.14},${h*0.58} ${w*0.08},${h*0.68}`} fill="#374151" />

      {/* === UNDERCARRIAGE === */}
      <rect x={w*0.06} y={h*0.55} width={w*0.85} height={h*0.1} rx={3} fill="#111827" />

      {/* === PISTON === */}
      <rect x={w*0.06} y={h*0.45} width={w*0.12} height={h*0.05} rx={2} fill="#6b7280"
        style={{ animation: speed > 0 ? `pistonPush ${spinDur} ease-in-out infinite` : "none", transformOrigin: "right center" }} />

      {/* === WHEELS === */}
      {/* Big front wheel */}
      <circle cx={w*0.15} cy={h*0.72} r={wheelR*1.1} fill="#1f2937" stroke="#6b7280" strokeWidth={4}
        style={{ animation: speed > 0 ? `wheelSpin ${spinDur} linear infinite` : "none", transformOrigin: `${w*0.15}px ${h*0.72}px` }} />
      <line x1={w*0.15} y1={h*0.55} x2={w*0.15} y2={h*0.89} stroke="#4b5563" strokeWidth={3}
        style={{ animation: speed > 0 ? `wheelSpin ${spinDur} linear infinite` : "none", transformOrigin: `${w*0.15}px ${h*0.72}px` }} />
      <line x1={w*0.03} y1={h*0.72} x2={w*0.27} y2={h*0.72} stroke="#4b5563" strokeWidth={3}
        style={{ animation: speed > 0 ? `wheelSpin ${spinDur} linear infinite` : "none", transformOrigin: `${w*0.15}px ${h*0.72}px` }} />
      <circle cx={w*0.15} cy={h*0.72} r={wheelR*0.2} fill="#6b7280" />

      {/* Middle wheel */}
      <circle cx={w*0.38} cy={h*0.72} r={wheelR} fill="#1f2937" stroke="#6b7280" strokeWidth={3}
        style={{ animation: speed > 0 ? `wheelSpin ${spinDur} linear infinite` : "none", transformOrigin: `${w*0.38}px ${h*0.72}px` }} />
      <line x1={w*0.38} y1={h*0.58} x2={w*0.38} y2={h*0.86} stroke="#4b5563" strokeWidth={2.5}
        style={{ animation: speed > 0 ? `wheelSpin ${spinDur} linear infinite` : "none", transformOrigin: `${w*0.38}px ${h*0.72}px` }} />
      <line x1={w*0.26} y1={h*0.72} x2={w*0.5} y2={h*0.72} stroke="#4b5563" strokeWidth={2.5}
        style={{ animation: speed > 0 ? `wheelSpin ${spinDur} linear infinite` : "none", transformOrigin: `${w*0.38}px ${h*0.72}px` }} />
      <circle cx={w*0.38} cy={h*0.72} r={wheelR*0.18} fill="#6b7280" />

      {/* Rear wheel */}
      <circle cx={w*0.62} cy={h*0.72} r={wheelR} fill="#1f2937" stroke="#6b7280" strokeWidth={3}
        style={{ animation: speed > 0 ? `wheelSpin ${spinDur} linear infinite` : "none", transformOrigin: `${w*0.62}px ${h*0.72}px` }} />
      <line x1={w*0.62} y1={h*0.58} x2={w*0.62} y2={h*0.86} stroke="#4b5563" strokeWidth={2.5}
        style={{ animation: speed > 0 ? `wheelSpin ${spinDur} linear infinite` : "none", transformOrigin: `${w*0.62}px ${h*0.72}px` }} />
      <line x1={w*0.5} y1={h*0.72} x2={w*0.74} y2={h*0.72} stroke="#4b5563" strokeWidth={2.5}
        style={{ animation: speed > 0 ? `wheelSpin ${spinDur} linear infinite` : "none", transformOrigin: `${w*0.62}px ${h*0.72}px` }} />
      <circle cx={w*0.62} cy={h*0.72} r={wheelR*0.18} fill="#6b7280" />

      {/* Cabin wheel */}
      <circle cx={w*0.81} cy={h*0.72} r={wheelR*0.85} fill="#1f2937" stroke="#6b7280" strokeWidth={3}
        style={{ animation: speed > 0 ? `wheelSpin ${spinDur} linear infinite` : "none", transformOrigin: `${w*0.81}px ${h*0.72}px` }} />
      <line x1={w*0.81} y1={h*0.6} x2={w*0.81} y2={h*0.84} stroke="#4b5563" strokeWidth={2}
        style={{ animation: speed > 0 ? `wheelSpin ${spinDur} linear infinite` : "none", transformOrigin: `${w*0.81}px ${h*0.72}px` }} />
      <line x1={w*0.7} y1={h*0.72} x2={w*0.92} y2={h*0.72} stroke="#4b5563" strokeWidth={2}
        style={{ animation: speed > 0 ? `wheelSpin ${spinDur} linear infinite` : "none", transformOrigin: `${w*0.81}px ${h*0.72}px` }} />
      <circle cx={w*0.81} cy={h*0.72} r={wheelR*0.15} fill="#6b7280" />

      {/* Headlight */}
      <circle cx={w*0.04} cy={h*0.42} r={h*0.07} fill="#fef9c3" opacity={speed > 0 ? 1 : 0.5}
        style={{ filter: speed > 0 ? "drop-shadow(0 0 12px #fbbf24)" : "none" }} />
      <circle cx={w*0.04} cy={h*0.42} r={h*0.04} fill="#fde047" />
    </svg>
  );
}
