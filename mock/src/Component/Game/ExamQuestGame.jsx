import React, { useState, useEffect, useRef } from "react";
import api from "../Api/axios";
import SnakeLadder from "./SnakeLadder";
import HeistMaster from "./HeistMaster";
import TrainExpress from "./TrainExpress";
import SpaceDefender from "./SpaceDefender";
import MagicPotion from "./MagicPotion";
import { 
  Heart, Zap, Play, Trophy, Coins, AlertOctagon, FastForward, ArrowLeft, Rocket, Star,
  Skull, Terminal, Flame, Crosshair, Fingerprint, Sparkles
} from "lucide-react";

/**
 * MEGA FOCUS ARCADE
 * Contains 6 games (3 Classic, 3 Hardcore)
 */

export default function ExamQuestGame({ onClose }) {
  const [selectedGame, setSelectedGame] = useState(null);

  if (selectedGame === 'SNAKELADDERGAME') {
    return <SnakeLadder onBack={() => setSelectedGame(null)} />;
  }

  if (selectedGame === 'HEISTMASTER') {
    return <HeistMaster onBack={() => setSelectedGame(null)} />;
  }

  if (selectedGame === 'TRAINEXPRESS') {
    return <TrainExpress onBack={() => setSelectedGame(null)} />;
  }

  if (selectedGame === 'SPACE') {
    return <SpaceDefender onBack={() => setSelectedGame(null)} />;
  }

  if (selectedGame === 'MAGICPOTION') {
    return <MagicPotion onBack={() => setSelectedGame(null)} />;
  }

  if (!selectedGame) {
    return (
      <div className="w-full min-h-screen bg-slate-900 flex flex-col items-center justify-start p-6 text-white font-sans overflow-y-auto">
        <h1 className="text-5xl font-black mt-8 mb-2 text-transparent bg-clip-text bg-gradient-to-br from-indigo-400 to-purple-500 uppercase tracking-tighter drop-shadow-lg text-center">
          MEGA ARCADE
        </h1>
        <p className="text-slate-400 font-bold mb-8 text-center">Select your challenge to earn focus points!</p>
        
        {/* --- CLASSIC MODES --- */}
        <h3 className="w-full max-w-6xl text-left text-xl font-black text-slate-500 mb-4 tracking-widest uppercase border-b-2 border-slate-800 pb-2">Classic Missions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl mb-12">
          {/* RUNNER */}
          <button onClick={() => setSelectedGame('RUNNER')} className="group relative overflow-hidden rounded-[2rem] bg-sky-200 p-8 text-left transition-all hover:scale-[1.02] border-b-8 border-sky-400 shadow-xl">
            <div className="absolute -right-6 top-4 text-[100px] opacity-20 group-hover:rotate-12 transition-transform">🏃‍♂️</div>
            <h2 className="text-3xl font-black text-sky-900 mb-2">City Runner</h2>
            <p className="text-sky-700 font-bold text-sm mb-6 pr-8">Sprint through the stormy city. Dodge question blocks!</p>
            <div className="bg-sky-500 w-fit px-4 py-2 rounded-full font-black uppercase text-xs flex items-center gap-2"><Play size={14}/> Play</div>
          </button>
          {/* NINJA */}
          <button onClick={() => setSelectedGame('NINJA')} className="group relative overflow-hidden rounded-[2rem] bg-red-950 p-8 text-left transition-all hover:scale-[1.02] border-b-8 border-red-800 shadow-xl">
            <div className="absolute -right-6 -bottom-6 text-[100px] opacity-20 group-hover:rotate-45 transition-transform">🥷</div>
            <h2 className="text-3xl font-black text-red-200 mb-2">Ninja Strike</h2>
            <p className="text-red-400 font-bold text-sm mb-6 pr-8">Slash through ancient demons in the bamboo forest.</p>
            <div className="bg-red-700 w-fit px-4 py-2 rounded-full font-black uppercase text-xs flex items-center gap-2"><Play size={14}/> Play</div>
          </button>
          {/* SPACE */}
          <button onClick={() => setSelectedGame('SPACE')} className="group relative overflow-hidden rounded-[2rem] bg-indigo-950 p-8 text-left transition-all hover:scale-[1.02] border-b-8 border-indigo-700 shadow-xl">
            <div className="absolute top-2 right-4 bg-cyan-500 text-black text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">UPGRADED</div>
            <div className="absolute -right-6 -bottom-6 text-[100px] opacity-20 group-hover:-translate-y-4 transition-transform">🚀</div>
            <h2 className="text-3xl font-black text-indigo-200 mb-2">Space Defender</h2>
            <p className="text-indigo-400 font-bold text-sm mb-6 pr-8">Blast asteroids & aliens! Combos, shields, explosions and wave progression.</p>
            <div className="bg-indigo-600 w-fit px-4 py-2 rounded-full font-black uppercase text-xs flex items-center gap-2"><Play size={14}/> Launch</div>
          </button>
        </div>

        {/* --- HARDCORE MODES --- */}
        <h3 className="w-full max-w-6xl text-left text-xl font-black text-red-600 mb-4 tracking-widest uppercase border-b-2 border-red-900 pb-2 drop-shadow-[0_0_10px_red]">Hardcore Trials (18+)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl">
          {/* HELLBOUND */}
          <button onClick={() => setSelectedGame('HELLBOUND')} className="group relative overflow-hidden bg-[#0A0000] p-8 text-left transition-all hover:scale-[1.02] border border-red-900 hover:border-red-500 shadow-[0_0_20px_rgba(150,0,0,0.2)] flex flex-col items-start">
            <div className="absolute -right-8 -bottom-8 text-[120px] opacity-10 text-red-600">🩸</div>
            <h2 className="text-3xl font-black text-red-500 mb-2 uppercase font-serif">Hellbound</h2>
            <p className="text-red-900/80 font-bold text-xs uppercase mb-6 drop-shadow-md">Survive the underworld. Blood spills on wrong answers.</p>
            <div className="mt-auto border border-red-600 text-red-500 bg-red-950/30 px-4 py-2 font-black uppercase text-xs flex items-center gap-2"><Flame size={14}/> Enter Hell</div>
          </button>
          {/* CYBER */}
          <button onClick={() => setSelectedGame('CYBER')} className="group relative overflow-hidden bg-[#000A05] p-8 text-left transition-all hover:scale-[1.02] border border-green-900 hover:border-green-500 shadow-[0_0_20px_rgba(0,150,0,0.2)] flex flex-col items-start">
            <div className="absolute -right-10 -bottom-10 text-[120px] text-green-600 opacity-10 font-mono">{"{ }"}</div>
            <h2 className="text-3xl font-black text-green-500 mb-2 uppercase font-mono">Cyber Breach</h2>
            <p className="text-green-900/80 font-bold text-xs uppercase mb-6 drop-shadow-md font-mono">Bypass military firewalls. Execute logic or fry.</p>
            <div className="mt-auto border border-green-600 text-green-500 bg-green-950/30 px-4 py-2 font-black uppercase text-xs flex items-center gap-2"><Terminal size={14}/> Hack</div>
          </button>
          {/* WASTELAND */}
          <button onClick={() => setSelectedGame('WASTELAND')} className="group relative overflow-hidden bg-[#0A0A00] p-8 text-left transition-all hover:scale-[1.02] border border-yellow-900 hover:border-yellow-500 shadow-[0_0_20px_rgba(150,150,0,0.2)] flex flex-col items-start">
            <div className="absolute -right-8 -bottom-8 text-[120px] opacity-10">☢️</div>
            <h2 className="text-3xl font-black text-yellow-500 mb-2 uppercase">Wasteland</h2>
            <p className="text-yellow-600/50 font-bold text-xs uppercase mb-6 drop-shadow-md">Post-apocalyptic zone. Snipe mutants to survive.</p>
            <div className="mt-auto border border-yellow-600 text-yellow-500 bg-yellow-950/30 px-4 py-2 font-black uppercase text-xs flex items-center gap-2"><Crosshair size={14}/> Deploy</div>
          </button>
        </div>

        {/* --- BOARD GAMES --- */}
        <h3 className="w-full max-w-6xl text-left text-xl font-black text-emerald-400 mb-4 mt-12 tracking-widest uppercase border-b-2 border-emerald-800 pb-2">Board Games 🎲</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl mb-12">
          <button onClick={() => setSelectedGame('SNAKELADDERGAME')} className="group relative overflow-hidden rounded-[2rem] p-8 text-left transition-all hover:scale-[1.02] border-b-8 border-indigo-500 shadow-[0_0_30px_rgba(99,102,241,0.3)]" style={{background:'linear-gradient(135deg,#1e1b4b,#312e81)'}}>
            <div className="absolute -right-4 -bottom-4 text-[100px] opacity-20 group-hover:rotate-12 transition-transform">🐍</div>
            <h2 className="text-3xl font-black text-indigo-200 mb-2">Snakes &amp; Ladders</h2>
            <p className="text-indigo-400 font-bold text-sm mb-6 pr-8">Answer correctly to climb the ladder! Wrong answer and a snake bites you back!</p>
          </button>
          {/* HEIST MASTER */}
          <button onClick={() => setSelectedGame('HEISTMASTER')} className="group relative overflow-hidden rounded-[2rem] p-8 text-left transition-all hover:scale-[1.02] border-b-8 border-yellow-600 shadow-[0_0_30px_rgba(251,191,36,0.3)]" style={{background:'linear-gradient(135deg,#1c1917,#292524)'}}>
            <div className="absolute -right-4 -bottom-4 text-[100px] opacity-20 group-hover:rotate-12 transition-transform">🔐</div>
            <h2 className="text-3xl font-black text-yellow-400 mb-2">Heist Master</h2>
            <p className="text-yellow-700 font-bold text-sm mb-6 pr-8">Crack the vault! Answer questions to click tumblers. 3 alarms = BUSTED! ⏱️</p>
            <div className="bg-yellow-500 text-black w-fit px-4 py-2 rounded-full font-black uppercase text-xs flex items-center gap-2"><Play size={14}/> Start Heist</div>
          </button>
          {/* TRAIN EXPRESS */}
          <button onClick={() => setSelectedGame('TRAINEXPRESS')} className="group relative overflow-hidden rounded-[2rem] p-8 text-left transition-all hover:scale-[1.02] border-b-8 border-blue-600 shadow-[0_0_30px_rgba(59,130,246,0.3)]" style={{background:'linear-gradient(135deg,#0f172a,#1e3a5f)'}}>
            <div className="absolute -right-4 -bottom-4 text-[100px] opacity-20 group-hover:-translate-x-3 transition-transform">🚂</div>
            <h2 className="text-3xl font-black text-blue-300 mb-2">Train Express</h2>
            <p className="text-blue-500 font-bold text-sm mb-6 pr-8">Answer correctly for full steam ahead! Wrong answer hits emergency brakes. Reach the station to WIN! 🏁</p>
            <div className="bg-blue-600 text-white w-fit px-4 py-2 rounded-full font-black uppercase text-xs flex items-center gap-2"><Play size={14}/> Board Train</div>
          </button>
        </div>

        {/* --- GIRLS ONLY MODES --- */}
        <h3 className="w-full max-w-6xl text-left text-xl font-black text-pink-400 mb-4 mt-12 tracking-widest uppercase border-b-2 border-pink-800 pb-2" style={{textShadow:'0 0 10px #f9a8d4'}}>Girls Only ✨</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl mb-12">
          {/* GLAMOUR */}
          <button onClick={() => setSelectedGame('GLAMOUR')} className="group relative overflow-hidden rounded-[2rem] p-8 text-left transition-all hover:scale-[1.02] border-b-8 border-pink-500 shadow-[0_0_30px_rgba(236,72,153,0.3)]" style={{background:'linear-gradient(135deg,#fce7f3,#fbcfe8)'}}>
            <div className="absolute -right-4 -bottom-4 text-[100px] opacity-20 group-hover:rotate-12 transition-transform">💄</div>
            <h2 className="text-2xl font-black text-pink-800 mb-2">Glamour Studio</h2>
            <p className="text-pink-600 font-bold text-sm mb-6 pr-8">Create stunning makeup looks & earn points!</p>
            <div className="bg-pink-500 text-white w-fit px-4 py-2 rounded-full font-black uppercase text-xs flex items-center gap-2"><Sparkles size={14}/> Glam Up</div>
          </button>
          {/* FASHION */}
          <button onClick={() => setSelectedGame('FASHION')} className="group relative overflow-hidden rounded-[2rem] p-8 text-left transition-all hover:scale-[1.02] border-b-8 border-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.3)]" style={{background:'linear-gradient(135deg,#f3e8ff,#e9d5ff)'}}>
            <div className="absolute -right-4 -bottom-4 text-[100px] opacity-20 group-hover:rotate-12 transition-transform">👗</div>
            <h2 className="text-2xl font-black text-purple-800 mb-2">Fashion Runway</h2>
            <p className="text-purple-600 font-bold text-sm mb-6 pr-8">Dress your avatar & walk the runway!</p>
            <div className="bg-purple-500 text-white w-fit px-4 py-2 rounded-full font-black uppercase text-xs flex items-center gap-2"><Star size={14}/> Strut</div>
          </button>
          {/* PRINCESS RUN */}
          <button onClick={() => setSelectedGame('PRINCESSRUN')} className="group relative overflow-hidden rounded-[2rem] p-8 text-left transition-all hover:scale-[1.02] border-b-8 border-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.3)]" style={{background:'linear-gradient(135deg,#fef9c3,#fef08a)'}}>
            <div className="absolute -right-4 -bottom-4 text-[100px] opacity-20 group-hover:-translate-y-4 transition-transform">👸</div>
            <h2 className="text-2xl font-black text-yellow-800 mb-2">Princess Run</h2>
            <p className="text-yellow-700 font-bold text-sm mb-6 pr-8">Race through enchanted castles! Collect magic stars!</p>
            <div className="bg-yellow-400 text-yellow-900 w-fit px-4 py-2 rounded-full font-black uppercase text-xs flex items-center gap-2"><Play size={14}/> Run</div>
          </button>
          {/* MAGIC POTION */}
          <button onClick={() => setSelectedGame('MAGICPOTION')} className="group relative overflow-hidden rounded-[2rem] p-8 text-left transition-all hover:scale-[1.02] border-b-8 border-purple-600 shadow-[0_0_30px_rgba(168,85,247,0.4)]" style={{background:'linear-gradient(135deg,#1a0533,#2d0a4e)'}}>
            <div className="absolute -right-4 -bottom-4 text-[100px] opacity-20 group-hover:rotate-12 transition-transform">🔮</div>
            <h2 className="text-2xl font-black text-purple-200 mb-1">Magic Potion</h2>
            <p className="text-xs font-black text-purple-500 mb-2 uppercase tracking-widest">Witch's Cauldron ✨</p>
            <p className="text-purple-400 font-bold text-sm mb-6 pr-8">Drop magical ingredients into the cauldron! Brew a powerful spell to win!</p>
            <div className="w-fit px-4 py-2 rounded-full font-black uppercase text-xs flex items-center gap-2 text-purple-200 border border-purple-500" style={{background:'rgba(88,28,135,0.5)'}}><Sparkles size={14}/> Brew Spell</div>
          </button>
        </div>

        <button onClick={onClose} className="mt-4 mb-8 text-slate-500 hover:text-white font-bold uppercase text-sm flex items-center gap-2">
          <ArrowLeft size={16} /> Exit Arcade
        </button>
      </div>
    );
  }

  return <GameEngine mode={selectedGame} onBack={() => setSelectedGame(null)} onClose={onClose} />;
}


/* =========================================================================
   UNIVERSAL GAME ENGINE
========================================================================= */
function GameEngine({ mode, onBack, onClose }) {
  const [exams, setExams] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [state, setState] = useState('MENU'); 
  
  const [hp, setHp] = useState(3);
  const [score, setScore] = useState(0);
  const [progress, setProgress] = useState(0); 
  const [qIndex, setQIndex] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [feedbackAnim, setFeedbackAnim] = useState(null); 

  const isHardcore = ['HELLBOUND', 'CYBER', 'WASTELAND'].includes(mode);
  const isGirl = ['GLAMOUR', 'FASHION', 'PRINCESSRUN'].includes(mode);
  
  const runTimer = useRef(null);

  useEffect(() => {
    api.get("/user/exams").then(res => setExams(res.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (state === 'PLAYING') {
      runTimer.current = setInterval(() => {
        setProgress(prev => {
          const step = isHardcore ? (4 * speed) : (2 * speed);
          const nextProg = prev + step;
          const hurdleDist = isHardcore ? 500 : 350;
          
          if (nextProg % hurdleDist <= step && prev > 10 && qIndex < questions.length) {
            setState('QUESTION');
          }
          return nextProg;
        });
      }, 50);
    } else {
      clearInterval(runTimer.current);
    }
    return () => clearInterval(runTimer.current);
  }, [state, speed, qIndex, questions.length, isHardcore]);

  const startGame = async (examId) => {
    setState('LOADING');
    try {
      const res = await api.get(`/user/questions?topicId=${examId}`);
      const qs = (res.data || []).sort(() => Math.random() - 0.5).slice(0, 15);
      if (qs.length === 0) throw new Error("No data found");
      
      setQuestions(qs);
      setQIndex(0);
      setHp(3);
      setScore(0);
      setProgress(0);
      setSpeed(1);
      setState('PLAYING');
    } catch (e) {
      alert("Error: " + e.message);
      setState('MENU');
    }
  };

  const handleAnswer = (choice) => {
    const q = questions[qIndex];
    const isCorrect = choice === q.correct || String(choice) === String(q.correct) || q.options[choice] === q.correct || choice === q.correctAnswer || String(choice) === String(q.correctAnswer);
      
    if (isCorrect) {
      setScore(c => c + (isHardcore ? 666 : 150) * speed);
      setSpeed(s => Math.min(s + (isHardcore ? 0.3 : 0.2), isHardcore ? 4 : 3)); 
      setFeedbackAnim('success'); 
    } else {
      setHp(h => h - 1);
      setSpeed(1);
      setFeedbackAnim('fail'); 
    }

    setState('PLAYING');
    setQIndex(q => q + 1);

    if (!isCorrect && hp <= 1) {
      setTimeout(() => setState('GAMEOVER'), 800);
      return;
    }
    if (qIndex + 1 >= questions.length) {
      setTimeout(() => setState('WIN'), 1500);
    }
    setTimeout(() => setFeedbackAnim(null), 1000);
  };

  const isPlaying = state === 'PLAYING';

  // ----------------------------------------------------
  // THEME CONFIG
  // ----------------------------------------------------
  
  const getThemeProps = () => {
    switch(mode) {
      case 'RUNNER': return {
        font: 'font-sans', bg: 'bg-slate-700 lightning-sky', unit: 'm', hp: '❤️', char: (
          <svg width="120" height="140" viewBox="0 -20 140 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_10px_15px_rgba(0,0,0,0.6)]">
            <path d="M 95 85 L 95 15" stroke="#451a03" strokeWidth="8" strokeLinecap="round" />
            <path d="M 30 25 Q 95 -40 160 25 Q 95 15 30 25 Z" fill="#ef4444" />
            <path d="M 30 25 Q 95 15 160 25" stroke="#b91c1c" strokeWidth="4" fill="none" />
            <path d="M 60 70 L 30 80" stroke="#fcd34d" strokeWidth="10" strokeLinecap="round" />
            <path d="M 60 110 L 25 120" stroke="#1d4ed8" strokeWidth="12" strokeLinecap="round" />
            <rect x="50" y="60" width="22" height="50" rx="10" fill="#3b82f6" />
            <circle cx="62" cy="40" r="18" fill="#fcd34d" />
            <path d="M 60 110 L 85 110 L 90 135" stroke="#1d4ed8" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d="M 60 70 L 95 60 L 95 85" stroke="#fcd34d" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
        ), obs: '🚧', fail: 'CRASHED', win: 'CLEAR', btn: 'bg-blue-600', scoreBg: 'bg-yellow-400 text-yellow-900 border-yellow-500', scoreIc: <Coins size={20}/>
      };
      case 'NINJA': return {
        font: 'font-sans', bg: 'bg-red-950/90', unit: 'km', hp: '❤️', char: (
          <svg width="100" height="100" viewBox="0 0 100 100" className="animate-spin drop-shadow-[0_0_20px_rgba(239,68,68,0.8)]" style={{ animationDuration: '0.4s', animationTimingFunction: 'linear' }}>
            <path d="M 50 0 L 60 40 L 100 50 L 60 60 L 50 100 L 40 60 L 0 50 L 40 40 Z" fill="#94a3b8" />
            <path d="M 50 10 L 55 45 L 90 50 L 55 55 L 50 90 L 45 55 L 10 50 L 45 45 Z" fill="#cbd5e1" />
            <circle cx="50" cy="50" r="10" fill="#0f172a" />
          </svg>
        ), obs: '👹', fail: 'SLAIN', win: 'MASTERED', btn: 'bg-red-700', scoreBg: 'bg-red-900 text-red-100 border-red-600', scoreIc: <Zap size={20}/>
      };
      case 'SPACE': return {
        font: 'font-sans', bg: 'bg-[#0B0B1A]', unit: 'LY', hp: '❤️', char: '🚀', obs: '☄️', fail: 'HULL BREACH', win: 'GALAXY SAVED', btn: 'bg-indigo-600', scoreBg: 'bg-indigo-900 text-white border-indigo-500', scoreIc: <Star size={20} className="text-yellow-400"/>
      };
      case 'HELLBOUND': return {
        font: 'font-serif', bg: 'bg-[#0a0000]', unit: ' DEPTH', hp: '🩸', char: '⚔️', obs: '👿', fail: 'YOU DIED', win: 'DEMON SLAIN', btn: 'bg-red-800', scoreBg: 'bg-black text-red-600 border-red-900 shadow-[0_0_15px_red]', scoreIc: <Skull size={20}/>
      };
      case 'CYBER': return {
        font: 'font-mono uppercase', bg: 'bg-black', unit: ' TB', hp: '🛡️', char: '>_', obs: '👁‍🗨', fail: 'COMPROMISED', win: 'HACKED', btn: 'bg-green-700 text-black', scoreBg: 'bg-black text-green-500 border-green-800 shadow-[0_0_15px_lime]', scoreIc: <Fingerprint size={20}/>
      };
      case 'WASTELAND': return {
        font: 'font-sans uppercase tracking-tight', bg: 'bg-[#0f0f05]', unit: ' DIST', hp: '💉', char: (
          <div className="relative">
            <svg width="120" height="120" viewBox="0 0 120 120" fill="none" className="drop-shadow-[0_10px_15px_rgba(0,0,0,0.8)]">
              <path d="M 40 120 L 50 80 L 70 120" stroke="#4b5563" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
              <rect x="35" y="45" width="30" height="40" rx="8" fill="#1f2937" />
              <rect x="30" y="50" width="40" height="20" rx="5" fill="#374151" />
              <circle cx="50" cy="30" r="15" fill="#111827" />
              <circle cx="58" cy="28" r="4" fill="#ef4444" className="animate-pulse" />
              <path d="M 45 65 L 110 65 L 115 67 L 110 70 L 45 70 Z" fill="#030712" />
              <rect x="75" y="70" width="8" height="15" fill="#030712" />
              <rect x="55" y="70" width="6" height="12" fill="#030712" />
              <path d="M 50 55 L 80 65" stroke="#4b5563" strokeWidth="10" strokeLinecap="round" />
            </svg>
            <div className="absolute top-[65px] left-[113px] w-[2000px] h-[2px] bg-red-600 shadow-[0_0_15px_red] pointer-events-none" />
          </div>
        ), 
        obs: '🧟', fail: 'INFECTED', win: 'MOPPED UP', btn: 'bg-yellow-700 text-black', scoreBg: 'bg-black text-yellow-500 border-yellow-800', scoreIc: <Crosshair size={20}/>
      };
      // ---- GIRLS ONLY ----
      case 'GLAMOUR': return {
        font: 'font-sans', bg: 'glamour-bg', unit: '✨', hp: '💄', 
        char: <div className="text-[80px] drop-shadow-[0_0_20px_pink]">💅</div>,
        obs: '👠', fail: 'SMUDGED!', win: 'GLAM QUEEN!', btn: 'bg-pink-500 text-white',
        scoreBg: 'bg-pink-100 text-pink-800 border-pink-400', scoreIc: <Sparkles size={20} className="text-pink-500"/>
      };
      case 'FASHION': return {
        font: 'font-sans', bg: 'fashion-bg', unit: '👠', hp: '💟',
        char: <div className="text-[80px] drop-shadow-[0_0_20px_purple]">👗</div>,
        obs: '🧵', fail: 'FASHION FAIL!', win: 'RUNWAY STAR!', btn: 'bg-purple-500 text-white',
        scoreBg: 'bg-purple-100 text-purple-800 border-purple-400', scoreIc: <Star size={20} className="text-purple-500"/>
      };
      case 'PRINCESSRUN': return {
        font: 'font-sans', bg: 'princess-bg', unit: '⭐', hp: '🌟',
        char: <div className="text-[80px] drop-shadow-[0_0_20px_gold]">👸</div>,
        obs: '🐉', fail: 'GOT LOST!', win: 'PRINCESS WINS!', btn: 'bg-yellow-400 text-yellow-900',
        scoreBg: 'bg-yellow-100 text-yellow-800 border-yellow-400', scoreIc: <Star size={20} className="text-yellow-500"/>
      };
      default: return {};
    }
  };
  const t = getThemeProps();

  return (
    <div className={`relative w-full h-[100vh] min-h-screen ${t.font} overflow-hidden ${t.bg} selection:bg-transparent transition-colors duration-1000`}>
      <style>{`
        @keyframes scrollBg { 0% { background-position: 0px 0px; } 100% { background-position: -2000px 0px; } }
        @keyframes scrollVertical { 0% { background-position: 0px 0px; } 100% { background-position: 0px 2000px; } }
        
        /* CLASSIC CSS */
        @keyframes lightningStrike { 0%, 91%, 94%, 100% { background-color: #334155; } 92%, 93% { background-color: #f1f5f9; } }
        .lightning-sky { animation: lightningStrike 10s infinite; }
        .rain-layer { background-image: repeating-linear-gradient(-15deg, transparent, transparent 30px, rgba(160,190,255,0.4) 30px, rgba(160,190,255,0.4) 32px); background-size: 200px 200px; animation: scrollBg 0.4s linear infinite; pointer-events: none; }
        .px-clouds { background-image: url('data:image/svg+xml;utf8,<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg"><text x="10" y="50" font-size="40">🌧️</text><text x="120" y="120" font-size="50">🌩️</text></svg>'); background-repeat: repeat-x; animation: scrollBg 40s linear infinite; opacity: 0.7; }
        .px-city { background-image: url('data:image/svg+xml;utf8,<svg width="400" height="200" xmlns="http://www.w3.org/2000/svg"><rect x="0" y="100" width="60" height="100" fill="%23cbd5e1"/><rect x="70" y="50" width="80" height="150" fill="%2394a3b8"/><rect x="160" y="80" width="50" height="120" fill="%23cbd5e1"/><rect x="220" y="30" width="70" height="170" fill="%2364748b"/><rect x="300" y="110" width="90" height="90" fill="%2394a3b8"/></svg>'); background-repeat: repeat-x; background-position: bottom; animation: scrollBg 20s linear infinite; opacity: 0.8; }
        .px-ground { background: repeating-linear-gradient(90deg, #4ade80, #4ade80 40px, #22c55e 40px, #22c55e 80px); animation: scrollBg 2s linear infinite; }
        .px-bloodmoon-ninja { background-image: radial-gradient(circle at 70% 30%, #b91c1c 0%, #b91c1c 8%, transparent 8.5%); }
        .px-bamboo { background-image: repeating-linear-gradient(90deg, transparent, transparent 80px, #450a0a 80px, #450a0a 95px, transparent 95px); animation: scrollBg 6s linear infinite; }
        .px-stars { background-image: radial-gradient(2px 2px at 20px 30px, #eee, rgba(0,0,0,0)), radial-gradient(2px 2px at 40px 70px, #fff, rgba(0,0,0,0)); background-size: 200px 200px; animation: scrollVertical 10s linear infinite; opacity: 0.5; }

        /* HARDCORE CSS */
        .px-hell { background-image: repeating-linear-gradient(45deg, #1f0000 0, #0a0000 2px, transparent 2px, transparent 10px); }
        .px-spikes { background-image: linear-gradient(135deg, transparent 45%, #3a0000 45%, #1a0000 55%, transparent 55%); background-size: 60px 200px; animation: scrollBg 8s linear infinite; }
        .px-matrix { background-image: linear-gradient(0deg, transparent 24%, rgba(0, 255, 0, 0.1) 25%, transparent 26%), linear-gradient(90deg, transparent 24%, rgba(0, 255, 0, 0.1) 25%, transparent 26%); background-size: 50px 50px; animation: scrollVertical 20s linear infinite; }
        .px-code-rain { background-image: radial-gradient(#0f0 1px, transparent 1px); background-size: 20px 60px; animation: scrollVertical 5s linear infinite; opacity: 0.2; }
        .px-toxic { background: repeating-linear-gradient(90deg, #1a1a0a 0px, #1a1a0a 100px, #0f0f05 100px, #0f0f05 200px); animation: scrollBg 15s linear infinite; }
        .px-hazmat { background-image: repeating-linear-gradient(-45deg, #000 0px, #000 20px, #ca8a04 20px, #ca8a04 40px); animation: scrollBg 2s linear infinite; }

        /* GIRL GAMES CSS */
        .glamour-bg { background: linear-gradient(160deg, #fce7f3, #fbcfe8, #f9a8d4); }
        .fashion-bg { background: linear-gradient(160deg, #f3e8ff, #e9d5ff, #d8b4fe); }
        .princess-bg { background: linear-gradient(160deg, #fef9c3, #fef08a, #fde68a); }
        .px-hearts { background-image: url("data:image/svg+xml;utf8,<svg width='100' height='100' xmlns='http://www.w3.org/2000/svg'><text x='10' y='50' font-size='30'>💗</text><text x='60' y='90' font-size='20'>✨</text></svg>"); background-repeat: repeat; animation: scrollBg 20s linear infinite; opacity: 0.3; }
        .px-stars-girl { background-image: url("data:image/svg+xml;utf8,<svg width='120' height='120' xmlns='http://www.w3.org/2000/svg'><text x='10' y='60' font-size='40'>⭐</text><text x='70' y='100' font-size='25'>🌸</text></svg>"); background-repeat: repeat; animation: scrollBg 15s linear infinite; opacity: 0.35; }
        .px-clouds-girl { background-image: url("data:image/svg+xml;utf8,<svg width='200' height='100' xmlns='http://www.w3.org/2000/svg'><text x='10' y='60' font-size='40'>🌸</text><text x='120' y='40' font-size='30'>🦋</text></svg>"); background-repeat: repeat-x; animation: scrollBg 30s linear infinite; opacity: 0.4; }
        @keyframes sparkleAnim { 0%,100% { filter: drop-shadow(0 0 5px pink) brightness(1); } 50% { filter: drop-shadow(0 0 20px hotpink) brightness(1.5); } }
        .sparkle-idle { animation: sparkleAnim 1s ease-in-out infinite; }

        /* CHAR ANIMS */
        @keyframes floatIdle { 0% { transform: translateY(0); } 100% { transform: translateY(-10px); } }
        @keyframes slashOk { 0% { transform: scale(1) translateX(0); } 50% { transform: scale(1.5) translateX(300px); } 51% { opacity:0; transform: translateX(-200px); } 100% { transform: scale(1); opacity:1; } }
        @keyframes jumpOk { 0% { transform: translateY(0); } 50% { transform: translateY(-120px) scale(1.1); } 100% { transform: translateY(0); } }
        @keyframes gunShot { 0% { transform: scale(1); filter: drop-shadow(0 0 50px yellow); } 10% { transform: scale(1.1) translateX(-30px) rotate(-5deg); filter: drop-shadow(0 0 100px red); } 100% { transform: scale(1); filter: none; } }
        @keyframes tripFail { 0% { transform: rotate(0) } 50% { transform: rotate(-45deg) translateX(-40px); opacity: 0.5; } 100% { transform: rotate(0); opacity: 1; } }
        
        .anim-idle { animation: ${isGirl ? 'sparkleAnim 1s ease-in-out infinite' : 'floatIdle 0.5s ease-in-out infinite alternate'}; }
        .anim-success { animation: ${(mode==='RUNNER'||mode==='SPACE'||isGirl) ? 'jumpOk 0.8s ease' : mode==='WASTELAND' ? 'gunShot 0.4s' : 'slashOk 0.5s ease'}; }
        .anim-fail { animation: tripFail 0.6s ease; }
        .paused-anim { animation-play-state: paused !important; }
        .glitch-text { animation: hurtFlash 0.2s infinite; }
        @keyframes hurtFlash { 0% { transform: translate(-2px,2px); } 50% { transform: translate(2px,-2px); } 100% { transform: translate(0); } }
        
        .modal-pop { animation: popUp 0.3s ease-out forwards; }
        @keyframes popUp { 0% { transform: scale(0.8); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
      `}</style>

      {/* ----------- BACKGROUNDS ----------- */}
      {mode === 'RUNNER' && (
        <><div className={`absolute top-0 w-full h-[60%] px-clouds ${!isPlaying?'paused-anim':''}`}/><div className={`absolute inset-0 rain-layer z-20 ${!isPlaying?'paused-anim':''}`}/><div className={`absolute top-[20%] w-full h-[50%] px-city ${!isPlaying?'paused-anim':''}`}/><div className="absolute bottom-0 w-full h-[30%] bg-[#8B4513]"/><div className={`absolute bottom-[28%] w-full h-[8%] px-ground border-t-[6px] border-[#15803d] ${!isPlaying?'paused-anim':''}`}/></>
      )}
      {mode === 'NINJA' && (
        <><div className="absolute inset-0 px-bloodmoon-ninja" /><div className={`absolute inset-0 px-bamboo opacity-30 ${!isPlaying?'paused-anim':''}`} /><div className={`absolute inset-0 px-bamboo-front z-10 opacity-70 ${!isPlaying?'paused-anim':''}`} /><div className="absolute bottom-0 w-full h-[25%] bg-[#262626] border-t-8 border-black"/></>
      )}
      {mode === 'SPACE' && (
        <><div className={`absolute inset-0 px-stars ${!isPlaying?'paused-anim':''}`}/><div className="absolute inset-0 bg-gradient-to-t from-indigo-900/30 to-transparent"/></>
      )}
      {mode === 'HELLBOUND' && (
        <div className="absolute inset-0 px-hell"><div className="absolute inset-0 bg-radial-gradient from-red-600/20 to-transparent opacity-80" /><div className={`absolute bottom-0 w-full h-[60%] px-spikes ${!isPlaying?'paused-anim':''}`} /><div className="absolute bottom-0 w-full h-[5%] bg-black border-t-2 border-red-900 shadow-[0_0_20px_red]" /></div>
      )}
      {mode === 'CYBER' && (
        <div className="absolute inset-0 bg-black"><div className={`absolute inset-0 px-matrix ${!isPlaying?'paused-anim':''}`} /><div className={`absolute inset-0 px-code-rain ${!isPlaying?'paused-anim':''}`} /><div className="absolute bottom-0 w-full h-[2px] bg-green-500 shadow-[0_0_20px_#0f0]" /></div>
      )}
      {mode === 'WASTELAND' && (
        <div className="absolute inset-0"><div className={`absolute top-[30%] w-full h-[50%] px-toxic ${!isPlaying?'paused-anim':''}`} /><div className={`absolute bottom-0 w-full h-[12%] px-hazmat ${!isPlaying?'paused-anim':''}`} /></div>
      )}
      {mode === 'GLAMOUR' && (
        <><div className={`absolute inset-0 px-hearts ${!isPlaying?'paused-anim':''}`}/><div className="absolute bottom-0 w-full h-[20%]" style={{background:'rgba(249,168,212,0.4)'}}/></>
      )}
      {mode === 'FASHION' && (
        <><div className={`absolute inset-0 px-hearts ${!isPlaying?'paused-anim':''}`}/><div className="absolute bottom-0 w-full h-[20%]" style={{background:'rgba(196,181,253,0.4)'}}/></>
      )}
      {mode === 'PRINCESSRUN' && (
        <><div className={`absolute top-0 w-full h-[50%] px-clouds-girl ${!isPlaying?'paused-anim':''}`}/><div className={`absolute inset-0 px-stars-girl ${!isPlaying?'paused-anim':''}`}/><div className="absolute bottom-0 w-full h-[20%]" style={{background:'rgba(253,230,138,0.5)'}}/></>
      )}

      {/* Hurt Flash */}
      {feedbackAnim === 'fail' && isHardcore && <div className="absolute inset-0 z-50 bg-red-600/50 pointer-events-none" />}
      {feedbackAnim === 'success' && isGirl && <div className="absolute inset-0 z-50 pointer-events-none" style={{background:'radial-gradient(circle,rgba(255,20,147,0.3),transparent 70%)'}}/>}

      {/* ----------- THE CHARACTER ----------- */}
      {state !== 'MENU' && (
        <div className={`absolute z-30 drop-shadow-2xl ${mode === 'CYBER' ? 'left-[15%] top-1/2 -translate-y-1/2 text-green-500' : mode === 'SPACE' ? 'left-1/2 -translate-x-1/2 bottom-[15%]' : 'left-[15%] bottom-[20%] text-current' }`}>
          <div className={`text-[70px] md:text-[90px] ${feedbackAnim === 'success' ? 'anim-success' : (isPlaying ? 'anim-idle' : '')}`}>
            {t.char}
          </div>
        </div>
      )}

      {/* ----------- THE OBSTACLE ----------- */}
      {(isPlaying || state === 'QUESTION') && qIndex < questions.length && (
        (() => {
          const hurdleDist = isHardcore ? 500 : 350;
          let diff = ((qIndex + 1) * hurdleDist) - progress;
          if (diff < 0) diff = 0; 
          if (diff > 800) return null;

          const pStyle = mode === 'CYBER' ? { right: `calc(15% + ${diff * 0.15}%)`, top: '50%', transform: 'translateY(-50%)' } :
                         mode === 'SPACE' ? { left: '50%', transform: 'translateX(-50%)', bottom: `calc(15% + ${diff * 0.25}%)` } :
                         { left: `calc(15% + ${diff * 0.2}%)`, bottom: '20%' };

          const isDanger = isHardcore || diff === 0;

          return (
            <div className={`absolute z-20 ${diff === 0 ? 'animate-pulse' : ''}`} style={pStyle}>
              <div className={`text-[80px] drop-shadow-2xl ${mode === 'CYBER' ? 'text-green-500 mix-blend-screen' : ''} ${diff <= 0 && isHardcore ? 'glitch-text' : ''}`}>
                 {t.obs}
              </div>
              <div className={`absolute -top-12 left-1/2 -translate-x-1/2 ${isDanger ? 'bg-red-600 text-white border-white' : 'bg-slate-800 text-white'} font-black px-4 py-1 border-2 z-30 tracking-widest whitespace-nowrap text-sm shadow-xl`}>
                {diff === 0 ? 'STOP!' : `${Math.floor(diff)}`}
              </div>
            </div>
          );
        })()
      )}

      {/* ----------- HUD ----------- */}
      {state !== 'MENU' && (
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-40">
          <div className="flex flex-col gap-2">
            <div className={`flex items-center gap-1 px-4 py-2 border-2 shadow-lg ${isHardcore ? 'bg-black border-red-900' : 'bg-white/90 border-slate-200 rounded-full'}`}>
              {!isHardcore && [...Array(3)].map((_, i) => <Heart key={i} size={20} fill={i < hp ? "#ef4444" : "#cbd5e1"} color={i < hp ? "#ef4444" : "rgba(0,0,0,0.1)"} />)}
              {isHardcore && [...Array(3)].map((_, i) => <span key={i} className={`text-xl ${i >= hp ? 'opacity-20 grayscale' : 'animate-pulse'}`}>{t.hp}</span>)}
            </div>
            <div className={`px-4 py-1.5 font-black text-lg border-2 shadow-xl ${isHardcore ? 'bg-black text-current border-current' : 'bg-slate-900 border-slate-700 text-white rounded-full text-center'}`}>
               DISTANCE: {Math.floor(progress)}{t.unit}
            </div>
          </div>
          <div className={`px-5 py-2 border-2 shadow-xl flex items-center gap-2 ${t.scoreBg} ${isHardcore ? '' : 'rounded-full'}`}>
            {t.scoreIc} <span className="font-black text-xl">{score}</span>
          </div>
        </div>
      )}

      {/* ----------- MENUS / OVERLAYS ----------- */}
      {state === 'MENU' && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center z-50 p-6">
          <div className={`p-8 max-w-lg w-full border-2 text-center modal-pop ${isHardcore ? 'bg-black text-current border-current shadow-[0_0_40px_currentColor]' : 'bg-white text-slate-900 border-sky-500 rounded-3xl'}`}>
            <div className="absolute top-4 left-4 cursor-pointer hover:opacity-50" onClick={onBack}><ArrowLeft size={24} /></div>
            <h1 className="text-4xl font-black mb-2 mt-4 tracking-tighter uppercase">{mode}</h1>
            <p className="font-bold mb-6 text-xs uppercase opacity-70">Select Level Topic</p>
            <div className="space-y-3 max-h-[40vh] overflow-y-auto px-2 pb-4">
              {exams.length === 0 && <p className="animate-pulse">Loading...</p>}
              {exams.map(ex => (
                <button key={ex.id} onClick={() => startGame(ex.id)} className={`w-full border-2 p-4 flex items-center justify-between font-black active:scale-95 transition-all ${isHardcore ? 'border-current bg-white/5 hover:bg-white/20' : 'border-slate-200 bg-slate-50 hover:border-sky-500 hover:bg-sky-50 rounded-xl'}`}>
                  <span className="text-left text-sm uppercase">{ex.name}</span>
                  <Play size={16} />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {state === 'LOADING' && (
        <div className="absolute inset-0 bg-black flex flex-col items-center justify-center z-50">
          <div className="text-6xl animate-ping">{t.char}</div>
          <h2 className="text-2xl font-black mt-8 tracking-widest uppercase text-white">INITIALIZING...</h2>
        </div>
      )}

      {state === 'QUESTION' && questions[qIndex] && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-md flex flex-col items-center justify-center z-50 p-4">
          <div className={`p-8 max-w-2xl w-full border-2 modal-pop ${isHardcore ? 'bg-black border-current text-current shadow-[0_0_50px_currentColor]' : 'bg-white border-sky-500 text-slate-800 rounded-3xl'}`}>
            <div className="flex items-center gap-4 mb-6 border-b-2 pb-4 opacity-90">
              <div className="font-black text-2xl">[Q.{qIndex + 1}]</div>
              <h2 className="text-xl font-bold leading-relaxed">{questions[qIndex].question}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
              {questions[qIndex].options.map((opt, i) => (
                <button key={i} onClick={() => handleAnswer(i)} className={`border-2 p-5 text-left active:scale-95 flex items-center ${isHardcore ? 'border-current bg-white/5 hover:bg-white/20' : 'border-slate-200 bg-slate-50 hover:border-sky-400 rounded-xl'}`}>
                  <span className="font-black mr-4 opacity-50 text-lg">{String.fromCharCode(65 + i)}.</span>
                  <span className="font-bold text-sm tracking-wide">{opt}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {state === 'GAMEOVER' && (
        <div className="absolute inset-0 bg-black/95 flex flex-col items-center justify-center z-50 p-6">
          <div className="text-center glitch-text w-full max-w-md">
            <h1 className={`text-6xl font-black mb-4 ${isHardcore ? 'text-red-600 font-serif' : 'text-white'}`}>{t.failMsg}</h1>
            <p className="mb-8 font-bold opacity-70 uppercase tracking-widest text-white">MISSION FAILED</p>
            <div className="flex gap-4">
              <button onClick={onBack} className={`flex-1 py-4 border-2 font-black uppercase ${t.btn} bg-transparent border-current hover:bg-white/10`}>MENU</button>
              <button onClick={() => startGame(questions[0]?.topicId || exams[0]?.id)} className={`flex-1 py-4 font-black uppercase ${t.btn}`}>RETRY</button>
            </div>
          </div>
        </div>
      )}

      {state === 'WIN' && (
        <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center z-50 p-6">
          <div className={`p-10 max-w-md w-full border-2 text-center ${isHardcore ? 'bg-black border-current shadow-[0_0_40px_currentColor]' : 'bg-white border-emerald-500 rounded-3xl text-slate-900'}`}>
            <h2 className="text-4xl font-black mb-2 uppercase">{t.winMsg}</h2>
            <div className={`border-2 p-6 mb-8 text-left ${isHardcore ? 'bg-white/10 border-current' : 'bg-slate-100 border-slate-200 rounded-2xl'}`}>
              <div className="font-black text-xs opacity-70">DISTANCE</div>
              <div className="text-2xl font-black mb-4">{Math.floor(progress)}{t.unit}</div>
              <div className="font-black text-xs opacity-70">SCORE</div>
              <div className="text-2xl font-black text-yellow-500">{score}</div>
            </div>
            <div className="flex flex-col gap-4">
              <button onClick={onBack} className={`w-full py-4 font-black uppercase ${t.btn}`}>NEXT MISSION</button>
              <button onClick={onClose} className="w-full py-3 font-bold uppercase opacity-50 hover:opacity-100 border text-xs">EXIT ARCADE</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
