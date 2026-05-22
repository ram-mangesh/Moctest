import { useState, useEffect } from "react";
    import api from "../Api/axios";

/**
 * GamificationDashboard
 *
 * Full gamification page showing:
 *  - XP bar with animated fill + level name
 *  - Streak calendar (last 30 days heatmap)
 *  - Badge wall (all badges, locked/unlocked)
 *  - Global XP leaderboard
 *
 * Route: /achievements  (add to UserRoutes + UserSidebar)
 * Import: import GamificationDashboard from "../Gamification/GamificationDashboard";
 */

const BADGE_META = {
  FIRST_ATTEMPT: { icon: "🎯", label: "First Step",      desc: "Complete your first test",             color: "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700" },
  PERFECT_SCORE: { icon: "💯", label: "Perfectionist",   desc: "Score 100% on any test",               color: "bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-700" },
  STREAK_7:      { icon: "🔥", label: "On Fire",         desc: "7-day study streak",                   color: "bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-700" },
  STREAK_30:     { icon: "⚡", label: "Unstoppable",     desc: "30-day study streak",                  color: "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-700" },
  CENTURY:       { icon: "💪", label: "Century Club",    desc: "Complete 100 tests",                   color: "bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-700" },
  NIGHT_OWL:     { icon: "🌙", label: "Night Owl",       desc: "Study after 10 PM",                   color: "bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-700" },
  EARLY_BIRD:    { icon: "🌅", label: "Early Bird",      desc: "Study before 7 AM",                   color: "bg-sky-50 border-sky-200 dark:bg-sky-900/20 dark:border-sky-700" },
  COMEBACK:      { icon: "📈", label: "Comeback Kid",    desc: "Improve score by 20%+ on same topic", color: "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-700" },
  SPEED_DEMON:   { icon: "🏎️", label: "Speed Demon",    desc: "Fast + accurate performance",          color: "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-700" },
};

const LEVELS = [
  { minXp: 0,    name: "Beginner",  icon: "🌱", color: "text-gray-500" },
  { minXp: 200,  name: "Explorer",  icon: "🔍", color: "text-blue-500" },
  { minXp: 500,  name: "Learner",   icon: "📖", color: "text-teal-500" },
  { minXp: 1000, name: "Scholar",   icon: "🎓", color: "text-indigo-500" },
  { minXp: 2000, name: "Expert",    icon: "⚡", color: "text-violet-500" },
  { minXp: 3500, name: "Master",    icon: "🏆", color: "text-amber-500" },
  { minXp: 5000, name: "Legend",    icon: "👑", color: "text-rose-500" },
];

const GamificationDashboard = () => {
  const [profile,     setProfile]     = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [tab,         setTab]         = useState("profile");
  const [xpAnim,      setXpAnim]      = useState(0);

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    Promise.all([
      api.get("/user/gamification/me").catch(() => ({ data: null })),
      api.get("/user/gamification/leaderboard").catch(() => ({ data: [] })),
    ]).then(([me, lb]) => {
      setProfile(me.data || DEMO_PROFILE);
      setLeaderboard(lb.data || DEMO_LEADERBOARD);
      setLoading(false);
      setTimeout(() => setXpAnim(me.data?.levelPct || DEMO_PROFILE.levelPct), 300);
    });
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const earned = profile?.badges || [];
  const myRank = leaderboard.findIndex((e) => String(e.userId) === String(userId));

  return (
    <div className="max-w-3xl mx-auto p-6">
      <style>{`
        @keyframes xp-fill { from{width:0} to{width:var(--w)} }
        @keyframes badge-pop { 0%{transform:scale(0.8);opacity:0} 100%{transform:scale(1);opacity:1} }
        @keyframes count-up { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        .badge-card { animation: badge-pop .3s ease; }
        .xp-bar-fill { transition: width 1.2s cubic-bezier(.17,.67,.35,1); }
      `}</style>

      {/* ── HERO: Level + XP ── */}
      <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl p-6 text-white mb-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 80% 20%, white 0%, transparent 60%)" }} />

        <div className="flex items-start justify-between mb-5">
          <div>
            <p className="text-indigo-200 text-xs font-semibold uppercase tracking-widest mb-1">
              Current Level
            </p>
            <div className="flex items-center gap-2">
              <span style={{ fontSize: 32 }}>{profile.level?.icon}</span>
              <div>
                <p className="text-2xl font-bold">{profile.level?.name}</p>
                <p className="text-indigo-200 text-sm">{profile.totalXp?.toLocaleString()} XP total</p>
              </div>
            </div>
          </div>

          <div className="text-right">
            <p className="text-indigo-200 text-xs mb-0.5">Next: {profile.nextLevel?.name || "MAX"}</p>
            <p className="text-2xl font-bold">{profile.nextLevel ? profile.xpToNext?.toLocaleString() + " XP" : "🏆"}</p>
            <p className="text-indigo-200 text-xs">to go</p>
          </div>
        </div>

        {/* XP Progress bar */}
        <div className="mb-2">
          <div className="flex justify-between text-xs text-indigo-200 mb-1.5">
            <span>{profile.level?.name}</span>
            <span>{profile.nextLevel?.name || "Legend"}</span>
          </div>
          <div className="h-3 bg-indigo-800 rounded-full overflow-hidden">
            <div className="xp-bar-fill h-full bg-white rounded-full"
              style={{ width: xpAnim + "%" }} />
          </div>
          <p className="text-right text-indigo-200 text-xs mt-1">{profile.levelPct}%</p>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          {[
            { label: "Tests done", value: profile.totalTests },
            { label: "Day streak", value: `🔥 ${profile.streak}` },
            { label: "Badges",     value: `🏅 ${earned.length}` },
          ].map((s) => (
            <div key={s.label} className="bg-white/10 rounded-xl p-2.5 text-center">
              <p className="text-lg font-bold">{s.value}</p>
              <p className="text-indigo-200 text-xs">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── TABS ── */}
      <div className="flex gap-2 mb-5 border-b border-gray-100 dark:border-gray-700">
        {[
          { id: "profile",     label: "🎖️ Badges" },
          { id: "streak",      label: "🔥 Streak" },
          { id: "leaderboard", label: "🏆 Leaderboard" },
          { id: "levels",      label: "📊 Levels" },
        ].map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 text-sm font-semibold rounded-t-lg border-b-2 transition ${
              tab === t.id
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700"
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── BADGES TAB ── */}
      {tab === "profile" && (
        <div>
          <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-4">
            {earned.length} of {Object.keys(BADGE_META).length} badges earned
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Object.entries(BADGE_META).map(([key, meta], i) => {
              const unlocked = earned.includes(key);
              return (
                <div key={key} className={`badge-card rounded-xl border p-4 transition
                  ${unlocked ? meta.color : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 opacity-50 grayscale"}`}
                  style={{ animationDelay: i * 40 + "ms" }}>
                  <span style={{ fontSize: 28 }}>{meta.icon}</span>
                  <p className="font-bold text-sm text-gray-800 dark:text-gray-200 mt-2">{meta.label}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{meta.desc}</p>
                  {!unlocked && (
                    <p className="text-xs text-gray-300 dark:text-gray-600 mt-1 font-medium">🔒 Locked</p>
                  )}
                  {unlocked && (
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1 font-medium">✓ Earned</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── STREAK TAB ── */}
      {tab === "streak" && (
        <div>
          <div className="flex items-center gap-3 mb-6">
            <span style={{ fontSize: 48 }}>🔥</span>
            <div>
              <p className="text-4xl font-bold text-gray-900 dark:text-gray-100">{profile.streak} days</p>
              <p className="text-gray-500 dark:text-gray-400 text-sm">current streak</p>
            </div>
          </div>

          {/* 30-day heatmap */}
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">Last 30 days</p>
          <div className="grid gap-1.5" style={{ gridTemplateColumns: "repeat(10, 1fr)" }}>
            {Array.from({ length: 30 }, (_, i) => {
              const daysAgo = 29 - i;
              const isActive = daysAgo < profile.streak;
              const isToday = daysAgo === 0;
              return (
                <div key={i}
                  title={`${daysAgo === 0 ? "Today" : daysAgo + " days ago"}`}
                  className="aspect-square rounded-md"
                  style={{
                    background: isToday ? "#6366f1"
                              : isActive ? "#a5b4fc"
                              : "var(--color-background-secondary, #f3f4f6)",
                    border: isToday ? "2px solid #4f46e5" : "none",
                  }}
                />
              );
            })}
          </div>
          <div className="flex gap-4 mt-3 text-xs text-gray-400">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded" style={{ background: "#6366f1" }} />
              Today
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded" style={{ background: "#a5b4fc" }} />
              Active
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-gray-100 dark:bg-gray-700" />
              Missed
            </div>
          </div>

          {/* Streak milestones */}
          <div className="mt-6 space-y-3">
            <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">Streak milestones</p>
            {[
              { days: 3,  label: "Warm Up",    icon: "🌡️", unlocked: profile.streak >= 3 },
              { days: 7,  label: "On Fire",    icon: "🔥", unlocked: profile.streak >= 7 },
              { days: 14, label: "Dedicated",  icon: "💪", unlocked: profile.streak >= 14 },
              { days: 30, label: "Unstoppable",icon: "⚡", unlocked: profile.streak >= 30 },
              { days: 100,label: "Legendary",  icon: "👑", unlocked: profile.streak >= 100 },
            ].map((m) => (
              <div key={m.days} className={`flex items-center gap-3 p-3 rounded-xl border transition ${
                m.unlocked
                  ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700"
                  : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 opacity-50"
              }`}>
                <span style={{ fontSize: 24 }}>{m.icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{m.label}</p>
                  <p className="text-xs text-gray-500">{m.days}-day streak</p>
                </div>
                {m.unlocked
                  ? <span className="text-green-600 font-bold text-sm">✓ Earned</span>
                  : <span className="text-xs text-gray-400">{m.days - profile.streak} more days</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── LEADERBOARD TAB ── */}
      {tab === "leaderboard" && (
        <div>
          {myRank >= 0 && (
            <div className="mb-4 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-200 dark:border-indigo-700">
              <p className="text-sm text-indigo-700 dark:text-indigo-300 font-semibold">
                You are ranked #{myRank + 1} globally
                {myRank === 0 ? " 🏆 You're #1!" : myRank < 5 ? " 🔥 Top 5!" : ""}
              </p>
            </div>
          )}
          <div className="space-y-2">
            {leaderboard.map((entry, i) => {
              const isMe = String(entry.userId) === String(userId);
              const medals = ["🥇","🥈","🥉"];
              return (
                <div key={entry.userId}
                  className={`flex items-center gap-4 p-3.5 rounded-xl border transition ${
                    isMe
                      ? "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-700"
                      : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}>
                  {/* Rank */}
                  <div className="w-8 text-center shrink-0">
                    {i < 3
                      ? <span style={{ fontSize: 20 }}>{medals[i]}</span>
                      : <span className="text-sm font-bold text-gray-400">#{i+1}</span>}
                  </div>
                  {/* Avatar */}
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                    isMe ? "bg-indigo-600 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                  }`}>
                    {entry.name?.charAt(0)?.toUpperCase()}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold truncate ${
                      isMe ? "text-indigo-700 dark:text-indigo-300" : "text-gray-800 dark:text-gray-200"
                    }`}>
                      {entry.name} {isMe && <span className="text-xs font-normal text-indigo-400">(you)</span>}
                    </p>
                    <p className="text-xs text-gray-400 flex items-center gap-2 mt-0.5">
                      <span>{entry.levelIcon} {entry.level}</span>
                      <span>·</span>
                      <span>🔥 {entry.streak} days</span>
                      <span>·</span>
                      <span>🏅 {entry.badges} badges</span>
                    </p>
                  </div>
                  {/* XP */}
                  <div className="text-right shrink-0">
                    <p className={`text-base font-bold ${i === 0 ? "text-amber-500" : "text-gray-700 dark:text-gray-300"}`}>
                      {entry.totalXp?.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-400">XP</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── LEVELS TAB ── */}
      {tab === "levels" && (
        <div className="space-y-3">
          {LEVELS.map((lvl, i) => {
            const isCurrentOrPast = profile.totalXp >= lvl.minXp;
            const isCurrent = profile.level?.name === lvl.name;
            const nextXp = LEVELS[i + 1]?.minXp;
            return (
              <div key={lvl.name} className={`flex items-center gap-4 p-4 rounded-xl border transition ${
                isCurrent
                  ? "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-300 dark:border-indigo-600"
                  : isCurrentOrPast
                  ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700"
                  : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 opacity-60"
              }`}>
                <span style={{ fontSize: 28 }}>{lvl.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-gray-800 dark:text-gray-200">{lvl.name}</p>
                    {isCurrent && <span className="text-xs px-2 py-0.5 bg-indigo-600 text-white rounded-full font-semibold">Current</span>}
                    {isCurrentOrPast && !isCurrent && <span className="text-xs text-green-600">✓ Achieved</span>}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {lvl.minXp.toLocaleString()} XP
                    {nextXp && ` – ${(nextXp - 1).toLocaleString()} XP`}
                  </p>
                </div>
                {isCurrent && (
                  <div className="text-right">
                    <p className="text-sm font-bold text-indigo-600">{profile.totalXp?.toLocaleString()}</p>
                    <p className="text-xs text-gray-400">your XP</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

/* ── Demo data (works before backend is set up) ── */
const DEMO_PROFILE = {
  totalXp:    1240,
  levelPct:   62,
  streak:     8,
  totalTests: 34,
  badges:     ["FIRST_ATTEMPT", "STREAK_7", "NIGHT_OWL", "COMEBACK"],
  level:      { name: "Scholar", icon: "🎓", minXp: 1000 },
  nextLevel:  { name: "Expert",  icon: "⚡", minXp: 2000 },
  xpToNext:   760,
};

const DEMO_LEADERBOARD = [
  { userId: 99, name: "Abhishek Sharma", totalXp: 4200, level: "Master",  levelIcon: "🏆", streak: 22, badges: 7 },
  { userId: 2,  name: "Priya Patel",     totalXp: 3100, level: "Expert",  levelIcon: "⚡", streak: 15, badges: 6 },
  { userId: 3,  name: "Rahul Kumar",     totalXp: 2800, level: "Expert",  levelIcon: "⚡", streak: 11, badges: 5 },
  { userId: 4,  name: "Meera Singh",     totalXp: 1900, level: "Scholar", levelIcon: "🎓", streak: 8,  badges: 4 },
  { userId: 5,  name: "Arun Verma",      totalXp: 1240, level: "Scholar", levelIcon: "🎓", streak: 5,  badges: 3 },
];

export default GamificationDashboard;