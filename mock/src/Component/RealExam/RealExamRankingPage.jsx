import { useEffect, useState } from "react";
import api from "../Api/axios";
import UserLayout from "../User/UserLayout";

const RealExamRankingPage = () => {
  const [exams, setExams] = useState([]);
  const [examId, setExamId] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get("/user/exams").then(res => setExams(res.data));
  }, []);

  const searchRank = async () => {
    if (!examId) return;
    setLoading(true);
    const res = await api.get(`/real-exam/ranking?examId=${examId}`);
    setRows(res.data);
    setLoading(false);
  };

  const formatTime = (seconds) => {
    if (!seconds && seconds !== 0) return "—";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  const getMedalStyle = (rank) => {
    if (rank === 1) return { bg: "from-yellow-400 to-amber-500", text: "text-yellow-900", icon: "🥇", glow: "shadow-yellow-200" };
    if (rank === 2) return { bg: "from-slate-300 to-slate-400", text: "text-slate-800", icon: "🥈", glow: "shadow-slate-200" };
    if (rank === 3) return { bg: "from-orange-300 to-orange-400", text: "text-orange-900", icon: "🥉", glow: "shadow-orange-200" };
    return { bg: "from-indigo-50 to-white", text: "text-indigo-900", icon: null, glow: "" };
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-emerald-600";
    if (score >= 60) return "text-amber-500";
    return "text-red-500";
  };

  const getScoreBg = (score) => {
    if (score >= 80) return "bg-emerald-50 border-emerald-200";
    if (score >= 60) return "bg-amber-50 border-amber-200";
    return "bg-red-50 border-red-200";
  };

  return (
    <UserLayout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

        .ranking-page { font-family: 'Sora', sans-serif; }

        .rank-row {
          animation: slideIn 0.4s ease both;
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .podium-card {
          animation: popIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.85); }
          to { opacity: 1; transform: scale(1); }
        }

        .shimmer {
          background: linear-gradient(90deg, #f0f4ff 25%, #e0e8ff 50%, #f0f4ff 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        .select-custom {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236366f1' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 14px center;
        }

        .score-bar-fill {
          transition: width 1s ease;
        }
      `}</style>

      <div className="ranking-page min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-blue-50 p-6 md:p-10">

        {/* HEADER */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                <polyline points="17 6 23 6 23 12"/>
              </svg>
            </div>
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-indigo-500">Live Rankings</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Exam Leaderboard</h1>
          <p className="text-slate-400 text-sm mt-1">See how participants ranked across all real exams</p>
        </div>

        {/* SEARCH BAR */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 mb-8 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
            <select
              value={examId}
              onChange={e => setExamId(e.target.value)}
              className="select-custom w-full border border-slate-200 rounded-xl pl-9 pr-10 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent bg-slate-50 font-medium"
            >
              <option value="">Choose an exam...</option>
              {exams.map(e => (
                <option key={e.id} value={e.id}>{e.name}</option>
              ))}
            </select>
          </div>

          <button
            onClick={searchRank}
            disabled={!examId || loading}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-indigo-200 hover:shadow-md"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeOpacity="0.3"/>
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                </svg>
                Loading...
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                Search
              </>
            )}
          </button>
        </div>

        {/* LOADING SKELETON */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="shimmer h-16 rounded-2xl" style={{ animationDelay: `${i * 0.1}s` }} />
            ))}
          </div>
        )}

        {/* PODIUM (top 3) */}
        {!loading && rows.length >= 3 && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[rows[1], rows[0], rows[2]].map((r, i) => {
              if (!r) return null;
              const medal = getMedalStyle(r.rank);
              const heights = ["h-28", "h-36", "h-24"];
              return (
                <div
                  key={r.rank}
                  className={`podium-card bg-gradient-to-b ${medal.bg} rounded-2xl p-4 flex flex-col items-center justify-end shadow-lg ${medal.glow} shadow-md`}
                  style={{ animationDelay: `${i * 0.15}s`, minHeight: heights[i] }}
                >
                  <div className="text-2xl mb-1">{medal.icon}</div>
                  <div className={`text-xs font-bold truncate max-w-full px-1 ${medal.text}`}>{r.userName}</div>
                  <div className={`text-lg font-black ${medal.text}`}>{r.scorePercent.toFixed(1)}%</div>
                </div>
              );
            })}
          </div>
        )}

        {/* TABLE */}
        {!loading && rows.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-7 px-5 py-3 bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <div>Rank</div>
              <div className="col-span-2">Participant</div>
              <div className="text-center">Correct</div>
              <div className="text-center">Wrong</div>
              <div className="text-center">Score</div>
              <div className="text-center">Time</div>
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-slate-50">
              {rows.map((r, idx) => {
                const medal = getMedalStyle(r.rank);
                const isTop3 = r.rank <= 3;
                return (
                  <div
                    key={r.rank}
                    className={`rank-row grid grid-cols-7 px-5 py-4 items-center hover:bg-slate-50 transition-colors duration-150 ${isTop3 ? "bg-gradient-to-r from-indigo-50/40 to-transparent" : ""}`}
                    style={{ animationDelay: `${idx * 0.06}s` }}
                  >
                    {/* Rank */}
                    <div className="flex items-center gap-2">
                      {isTop3 ? (
                        <span className={`w-8 h-8 rounded-full bg-gradient-to-br ${medal.bg} flex items-center justify-center text-sm font-black ${medal.text} shadow-sm`}>
                          {r.rank}
                        </span>
                      ) : (
                        <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-400">
                          {r.rank}
                        </span>
                      )}
                    </div>

                    {/* User */}
                    <div className="col-span-2 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {r.userName?.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-semibold text-slate-700 truncate">{r.userName}</span>
                    </div>

                    {/* Correct */}
                    <div className="text-center">
                      <span className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
                        {r.correct}
                      </span>
                    </div>

                    {/* Wrong */}
                    <div className="text-center">
                      <span className="inline-flex items-center gap-1 text-sm font-semibold text-red-500">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block"></span>
                        {r.wrong}
                      </span>
                    </div>

                    {/* Score */}
                    <div className="text-center">
                      <div className={`inline-block px-2.5 py-1 rounded-lg border text-xs font-bold ${getScoreBg(r.scorePercent)} ${getScoreColor(r.scorePercent)}`}>
                        {r.scorePercent.toFixed(1)}%
                      </div>
                    </div>

                    {/* Time */}
                    <div className="text-center">
                      <span className="font-mono text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">
                        {formatTime(r.timeTakenSeconds)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 text-xs text-slate-400 flex justify-between items-center">
              <span>{rows.length} participants</span>
              <span>Sorted by score · fastest time breaks ties</span>
            </div>
          </div>
        )}

        {/* EMPTY STATE */}
        {rows.length === 0 && !loading && (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="1.5">
                <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>
              </svg>
            </div>
            <p className="text-slate-500 font-medium">No ranking data yet</p>
            <p className="text-slate-400 text-sm mt-1">Select an exam above and hit Search</p>
          </div>
        )}
      </div>
    </UserLayout>
  );
};

export default RealExamRankingPage;