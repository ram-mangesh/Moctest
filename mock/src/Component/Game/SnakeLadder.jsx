import React, { useState, useEffect, useRef } from "react";
import api from "../Api/axios";
import { ArrowLeft, Play, RefreshCw, Trophy, ChevronRight } from "lucide-react";

/* =============================================================
   SNAKES & LADDERS GAME — FOCUS EDITION
   ✅ Correct answer  → climb a ladder (move forward)
   ❌ Wrong answer    → snake bites (slide back)
   🎯 Reach 100 to WIN!
============================================================= */

// Positions: 1-indexed, 1 = bottom-left, 100 = top-right
const LADDERS = {
  4: 25,
  9: 31,
  20: 38,
  28: 84,
  40: 59,
  51: 67,
  63: 81,
  71: 91,
};

const SNAKES = {
  17: 7,
  54: 34,
  62: 19,
  64: 60,
  87: 24,
  93: 73,
  95: 75,
  99: 78,
};

// Convert position (1-100) to row/col on the board
// Row 0 = bottom, Row 9 = top
function posToRC(pos) {
  const idx = pos - 1; // 0-indexed
  const row = Math.floor(idx / 10); // 0=bottom
  const col = row % 2 === 0 ? idx % 10 : 9 - (idx % 10); // snake pattern
  return { row: 9 - row, col }; // invert row so row0=top visually
}

export default function SnakeLadder({ onBack }) {
  const [exams, setExams] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [qIndex, setQIndex] = useState(0);
  const [playerPos, setPlayerPos] = useState(1);
  const [state, setState] = useState("MENU"); // MENU | EXAM | PLAYING | QUESTION | GAMEOVER | WIN
  const [message, setMessage] = useState("");
  const [msgType, setMsgType] = useState(""); // "up" | "down" | "info"
  const [score, setScore] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);

  useEffect(() => {
    api.get("/user/exams").then((r) => setExams(r.data || [])).catch(() => {});
  }, []);

  const startGame = async (exam) => {
    setState("LOADING");
    setSelectedExam(exam);
    try {
      const res = await api.get(`/user/questions?topicId=${exam.id}`);
      const qs = (res.data || []).sort(() => Math.random() - 0.5).slice(0, 30);
      if (!qs.length) throw new Error("No questions found");
      setQuestions(qs);
      setQIndex(0);
      setPlayerPos(1);
      setScore(0);
      setMessage("🎲 Roll! Answer a question to move forward.");
      setMsgType("info");
      setState("PLAYING");
    } catch (e) {
      alert("Error: " + e.message);
      setState("MENU");
    }
  };

  const handleAnswer = (choiceIdx) => {
    if (animating || state !== "QUESTION") return;
    const q = questions[qIndex % questions.length];
    const isCorrect =
      choiceIdx === q.correct ||
      String(choiceIdx) === String(q.correct) ||
      q.options[choiceIdx] === q.correct ||
      choiceIdx === q.correctAnswer ||
      String(choiceIdx) === String(q.correctAnswer);

    const steps = isCorrect ? Math.floor(Math.random() * 4) + 3 : -(Math.floor(Math.random() * 3) + 1);
    let newPos = Math.max(1, Math.min(100, playerPos + steps));

    setAnimating(true);
    setQIndex((q) => q + 1);

    // Check ladders and snakes
    let extraMsg = "";
    if (isCorrect) {
      setScore((s) => s + 100);
      if (LADDERS[newPos]) {
        extraMsg = ` 🪜 LADDER! Climb to ${LADDERS[newPos]}!`;
        newPos = LADDERS[newPos];
      }
      setMsgType("up");
      setMessage(`✅ Correct! +${Math.abs(steps)} steps${extraMsg}`);
    } else {
      if (SNAKES[newPos]) {
        extraMsg = ` 🐍 SNAKE! Slide to ${SNAKES[newPos]}!`;
        newPos = SNAKES[newPos];
      }
      setMsgType("down");
      setMessage(`❌ Wrong! -${Math.abs(steps)} steps${extraMsg}`);
    }

    setTimeout(() => {
      setPlayerPos(newPos);
      setAnimating(false);
      if (newPos >= 100) {
        setState("WIN");
      } else {
        setState("PLAYING");
      }
    }, 600);

    setState("ANIMATING");
  };

  // ===================== RENDER =====================
  const CELL_SIZE = 52;
  const BOARD_SIZE = CELL_SIZE * 10;

  const getCellColor = (num) => {
    if (LADDERS[num]) return "#bbf7d0";
    if (SNAKES[num]) return "#fecaca";
    return num % 2 === 0 ? "#e0e7ef" : "#f8fafc";
  };

  const renderBoard = () => {
    const cells = [];
    for (let pos = 100; pos >= 1; pos--) {
      const { row, col } = posToRC(pos);
      const x = col * CELL_SIZE;
      const y = row * CELL_SIZE;
      const isPlayer = playerPos === pos;

      cells.push(
        <g key={pos} transform={`translate(${x},${y})`}>
          <rect
            width={CELL_SIZE - 1}
            height={CELL_SIZE - 1}
            fill={getCellColor(pos)}
            rx={4}
            stroke="#cbd5e1"
            strokeWidth={0.5}
          />
          <text
            x={4}
            y={13}
            fontSize={10}
            fill="#94a3b8"
            fontWeight="bold"
            fontFamily="monospace"
          >
            {pos}
          </text>
          {LADDERS[pos] && (
            <text x={CELL_SIZE / 2} y={CELL_SIZE / 2 + 4} fontSize={18} textAnchor="middle" dominantBaseline="middle">
              🪜
            </text>
          )}
          {SNAKES[pos] && (
            <text x={CELL_SIZE / 2} y={CELL_SIZE / 2 + 4} fontSize={18} textAnchor="middle" dominantBaseline="middle">
              🐍
            </text>
          )}
          {isPlayer && (
            <circle
              cx={CELL_SIZE / 2}
              cy={CELL_SIZE / 2}
              r={14}
              fill="#6366f1"
              stroke="white"
              strokeWidth={3}
              style={{ filter: "drop-shadow(0 0 8px #818cf8)" }}
            />
          )}
          {isPlayer && (
            <text x={CELL_SIZE / 2} y={CELL_SIZE / 2 + 5} fontSize={14} textAnchor="middle" dominantBaseline="middle">
              🧑
            </text>
          )}
        </g>
      );
    }
    return cells;
  };

  // ============ MENU ============
  if (state === "MENU") {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center p-8"
        style={{ background: "linear-gradient(135deg,#1e1b4b,#312e81,#4c1d95)" }}>
        <button onClick={onBack} className="absolute top-6 left-6 text-indigo-300 hover:text-white flex items-center gap-2 font-bold">
          <ArrowLeft size={20} /> Back to Arcade
        </button>

        <div className="text-[80px] mb-4 drop-shadow-[0_0_30px_rgba(99,102,241,0.8)]">🐍🪜</div>
        <h1 className="text-5xl font-black text-white mb-2 text-center" style={{ textShadow: "0 0 20px #818cf8" }}>
          SNAKES & LADDERS
        </h1>
        <p className="text-indigo-300 font-bold mb-10 text-center">
          Answer correctly → Climb the ladder!<br />
          Wrong answer → Snake bites! 🐍
        </p>

        <h2 className="text-white font-black text-xl mb-4 uppercase tracking-widest">Select Topic</h2>
        <div className="grid grid-cols-1 gap-3 w-full max-w-md">
          {exams.length === 0 && (
            <p className="text-indigo-400 animate-pulse text-center">Loading exams...</p>
          )}
          {exams.map((ex) => (
            <button
              key={ex.id}
              onClick={() => startGame(ex)}
              className="w-full p-4 bg-indigo-800/60 hover:bg-indigo-600 border border-indigo-600 hover:border-indigo-300 text-white font-black text-left rounded-2xl flex items-center justify-between transition-all active:scale-95"
            >
              <span>{ex.name}</span>
              <Play size={18} />
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (state === "LOADING") {
    return (
      <div className="w-full min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg,#1e1b4b,#312e81)" }}>
        <div className="text-6xl animate-bounce">🎲</div>
        <p className="text-white font-black text-2xl ml-4">Setting up board...</p>
      </div>
    );
  }

  if (state === "WIN") {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center p-8 text-center"
        style={{ background: "linear-gradient(135deg,#064e3b,#065f46)" }}>
        <div className="text-[100px] mb-4">🏆</div>
        <h1 className="text-6xl font-black text-yellow-400 mb-4" style={{ textShadow: "0 0 30px gold" }}>YOU WIN!</h1>
        <p className="text-green-300 font-bold text-xl mb-2">Reached Square 100!</p>
        <p className="text-white font-black text-3xl mb-10">Score: {score}</p>
        <div className="flex flex-col gap-4 w-full max-w-xs">
          <button onClick={() => startGame(selectedExam)} className="w-full py-4 bg-green-500 hover:bg-green-400 text-white font-black rounded-2xl flex items-center justify-center gap-2 text-lg">
            <RefreshCw size={20} /> Play Again
          </button>
          <button onClick={onBack} className="w-full py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl flex items-center justify-center gap-2">
            <ArrowLeft size={18} /> Arcade Menu
          </button>
        </div>
      </div>
    );
  }

  // ============ MAIN GAME ============
  const currentQ = questions[qIndex % questions.length];

  return (
    <div
      className="w-full min-h-screen flex flex-col md:flex-row items-start justify-center gap-6 p-4 overflow-y-auto"
      style={{ background: "linear-gradient(135deg,#1e1b4b,#312e81,#4c1d95)" }}
    >
      {/* ---------- BOARD PANEL ---------- */}
      <div className="flex flex-col items-center gap-4 flex-shrink-0">
        {/* Back + Title */}
        <div className="flex items-center gap-3 w-full">
          <button onClick={onBack} className="text-indigo-300 hover:text-white">
            <ArrowLeft size={22} />
          </button>
          <h2 className="text-white font-black text-xl">🐍 Snakes &amp; Ladders 🪜</h2>
        </div>

        {/* Scoreboard */}
        <div className="flex gap-4 w-full">
          <div className="flex-1 bg-indigo-900/60 border border-indigo-600 rounded-2xl p-3 text-center">
            <p className="text-indigo-400 text-xs font-bold uppercase">Position</p>
            <p className="text-white font-black text-2xl">{playerPos}<span className="text-indigo-400 text-sm">/100</span></p>
          </div>
          <div className="flex-1 bg-indigo-900/60 border border-indigo-600 rounded-2xl p-3 text-center">
            <p className="text-indigo-400 text-xs font-bold uppercase">Score</p>
            <p className="text-yellow-400 font-black text-2xl">{score}</p>
          </div>
        </div>

        {/* Board SVG */}
        <div
          className="rounded-2xl overflow-hidden border-4 border-indigo-500 shadow-[0_0_40px_rgba(99,102,241,0.4)]"
          style={{ background: "#f8fafc" }}
        >
          <svg width={BOARD_SIZE} height={BOARD_SIZE}>
            {renderBoard()}
          </svg>
        </div>

        {/* Message Bar */}
        <div
          className={`w-full rounded-2xl p-4 text-center font-black text-lg transition-all shadow-lg ${
            msgType === "up"
              ? "bg-green-500/20 border border-green-500 text-green-300"
              : msgType === "down"
              ? "bg-red-500/20 border border-red-500 text-red-300"
              : "bg-indigo-700/40 border border-indigo-500 text-indigo-200"
          }`}
        >
          {message || "🎲 Answer to move forward!"}
        </div>

        {/* Legend */}
        <div className="flex gap-4 text-xs text-indigo-300 font-bold">
          <span className="flex items-center gap-1"><span className="text-lg">🪜</span> Ladder = Go UP</span>
          <span className="flex items-center gap-1"><span className="text-lg">🐍</span> Snake = Go DOWN</span>
          <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-full bg-indigo-500"/>You</span>
        </div>
      </div>

      {/* ---------- QUESTION PANEL ---------- */}
      <div className="flex-1 w-full md:max-w-md flex flex-col gap-4 pt-12">
        {(state === "PLAYING" || state === "QUESTION" || state === "ANIMATING") && currentQ && (
          <div
            className="rounded-3xl p-6 border-2 border-indigo-500 text-white"
            style={{ background: "rgba(30,27,75,0.8)", backdropFilter: "blur(12px)" }}
          >
            <div className="flex items-center gap-3 mb-4 border-b border-indigo-700 pb-4">
              <span className="bg-indigo-600 text-white font-black px-3 py-1 rounded-full text-sm">
                Q.{qIndex + 1}
              </span>
              <p className="text-white font-bold text-base leading-relaxed">{currentQ.question}</p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {currentQ.options.map((opt, i) => (
                <button
                  key={i}
                  disabled={state === "ANIMATING"}
                  onClick={() => {
                    setState("QUESTION");
                    setTimeout(() => handleAnswer(i), 10);
                  }}
                  className="w-full p-4 text-left border-2 border-indigo-700 hover:border-indigo-400 bg-indigo-900/40 hover:bg-indigo-700/60 text-white font-bold rounded-2xl flex items-center gap-3 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="font-black text-indigo-400 text-lg w-6">{String.fromCharCode(65 + i)}.</span>
                  <span className="text-sm">{opt}</span>
                </button>
              ))}
            </div>

            <div className="mt-4 flex items-center gap-2 text-indigo-400 text-xs font-bold">
              <ChevronRight size={14} />
              {playerPos < 100 ? `Reach square 100 to win! Currently at ${playerPos}` : "Almost there!"}
            </div>
          </div>
        )}

        {/* Progress Bar */}
        <div className="rounded-2xl p-4 border border-indigo-700 bg-indigo-900/30">
          <div className="flex justify-between text-indigo-300 text-xs font-bold mb-2">
            <span>Progress to 100</span>
            <span>{playerPos}%</span>
          </div>
          <div className="w-full bg-indigo-900/60 rounded-full h-4 overflow-hidden border border-indigo-700">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${playerPos}%`,
                background: "linear-gradient(90deg, #6366f1, #a855f7, #ec4899)",
                boxShadow: "0 0 15px rgba(99,102,241,0.7)",
              }}
            />
          </div>
        </div>

        {/* Win preview */}
        {playerPos >= 90 && (
          <div className="rounded-2xl p-4 bg-yellow-500/10 border border-yellow-500 text-yellow-300 font-black text-center animate-pulse">
            🏆 Almost there! {100 - playerPos} more steps to WIN!
          </div>
        )}
      </div>
    </div>
  );
}
