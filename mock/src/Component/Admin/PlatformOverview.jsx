import { useState, useEffect } from "react";
import api from "../Api/axios";

/* ================================================================
   PLATFORM OVERVIEW — Admin dashboard with real-time platform stats
   ▸ Total students, questions, exams, subjects, topics
   ▸ Today's activity
   ▸ Score distribution chart
   ▸ Top performers leaderboard
   ▸ Recent activity feed
================================================================ */

export default function PlatformOverview() {
  const [students, setStudents]   = useState([]);
  const [allAttempts, setAllAttempts] = useState([]);
  const [exams, setExams]         = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/admin/students/search?name=").catch(()=>({data:[]})),
      api.get("/admin/exams").catch(()=>({data:[]})),
    ]).then(([stuRes, examRes]) => {
      const stuList = stuRes.data || [];
      setStudents(stuList);
      setExams(examRes.data || []);

      // Load attempts for all students (batch)
      const promises = stuList.slice(0, 50).map(s =>
        api.get(`/admin/students/${s.id}/attempts`).then(r => r.data || []).catch(() => [])
      );
      Promise.all(promises).then(results => {
        const flat = results.flat();
        setAllAttempts(flat);
        setLoading(false);
      });
    }).catch(() => setLoading(false));
  }, []);

  /* ── Derived stats ── */
  const totalStudents  = students.length;
  const totalTests     = allAttempts.length;
  const totalExams     = exams.length;

  // Today
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayAttempts = allAttempts.filter(a => a.attemptedAt?.startsWith(todayStr));

  // This week
  const weekAgo = new Date(Date.now() - 7 * 86400000);
  const weekAttempts = allAttempts.filter(a => new Date(a.attemptedAt) >= weekAgo);

  // Average score
  const avgScore = totalTests ? Math.round(allAttempts.reduce((s, a) => s + (a.scorePercent || 0), 0) / totalTests) : 0;

  // Pass rate (>=60%)
  const passCount = allAttempts.filter(a => a.scorePercent >= 60).length;
  const passRate = totalTests ? Math.round(passCount / totalTests * 100) : 0;

  // Score distribution
  const distBuckets = [
    { label: "0-20%",  min: 0,  max: 20,  color: "#ef4444" },
    { label: "21-40%", min: 21, max: 40,  color: "#f97316" },
    { label: "41-60%", min: 41, max: 60,  color: "#f59e0b" },
    { label: "61-80%", min: 61, max: 80,  color: "#22c55e" },
    { label: "81-100%",min: 81, max: 100, color: "#10b981" },
  ];
  distBuckets.forEach(b => { b.count = allAttempts.filter(a => a.scorePercent >= b.min && a.scorePercent <= b.max).length; });
  const maxBucket = Math.max(...distBuckets.map(b => b.count), 1);

  // Top performers (by avg score, min 2 tests)
  const stuMap = {};
  allAttempts.forEach(a => {
    const id = a.userId || a.studentId || "?";
    if (!stuMap[id]) stuMap[id] = { total: 0, scoreSum: 0 };
    stuMap[id].total++;
    stuMap[id].scoreSum += a.scorePercent || 0;
  });
  // Merge with student names
  const topPerformers = students
    .filter(s => stuMap[s.id] && stuMap[s.id].total >= 2)
    .map(s => ({ ...s, avg: Math.round(stuMap[s.id].scoreSum / stuMap[s.id].total), tests: stuMap[s.id].total }))
    .sort((a, b) => b.avg - a.avg)
    .slice(0, 8);

  // At-risk students
  const atRisk = students
    .filter(s => stuMap[s.id])
    .map(s => ({ ...s, avg: Math.round(stuMap[s.id].scoreSum / stuMap[s.id].total), tests: stuMap[s.id].total }))
    .filter(s => s.avg < 40 && s.tests >= 2)
    .sort((a, b) => a.avg - b.avg)
    .slice(0, 6);

  // Recent activity
  const recentAttempts = [...allAttempts]
    .sort((a, b) => new Date(b.attemptedAt) - new Date(a.attemptedAt))
    .slice(0, 10);

  // Most active topics
  const topicMap = {};
  allAttempts.forEach(a => {
    const n = a.topicName || "Unknown";
    if (!topicMap[n]) topicMap[n] = { count: 0, scoreSum: 0 };
    topicMap[n].count++;
    topicMap[n].scoreSum += a.scorePercent || 0;
  });
  const popularTopics = Object.entries(topicMap)
    .map(([name, d]) => ({ name, count: d.count, avg: Math.round(d.scoreSum / d.count) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800;900&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);}}
        @keyframes barGrow{from{width:0!important;}}
        @keyframes countUp{from{opacity:0;transform:scale(.8);}to{opacity:1;transform:scale(1);}}
        .po-ey{display:inline-flex;align-items:center;gap:6px;font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#2563eb;background:rgba(37,99,235,.09);border:1px solid rgba(37,99,235,.18);border-radius:20px;padding:4px 12px;margin-bottom:10px;}
        .po-ey::before{content:'';width:5px;height:5px;border-radius:50%;background:#2563eb;}
        .po-title{font-family:'Plus Jakarta Sans',sans-serif;font-size:24px;font-weight:900;letter-spacing:-.03em;color:#0f172a;margin-bottom:4px;}
        .po-sub{font-size:13px;color:rgba(37,99,235,.45);margin-bottom:24px;}
        .po-stats{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:12px;margin-bottom:24px;}
        .po-stat{border-radius:16px;padding:16px 18px;animation:fadeUp .35s ease both;transition:all .2s;}
        .po-stat:hover{transform:translateY(-3px);box-shadow:0 8px 24px rgba(37,99,235,.12);}
        .po-stat-val{font-size:28px;font-weight:900;animation:countUp .5s ease both;}
        .po-stat-lbl{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;opacity:.6;margin-top:3px;}
        .po-panel{background:rgba(255,255,255,.92);border:1.5px solid rgba(37,99,235,.1);border-radius:18px;padding:20px 22px;margin-bottom:18px;animation:fadeUp .35s ease both;}
        .po-ph{font-size:15px;font-weight:800;color:#0f172a;margin-bottom:14px;display:flex;align-items:center;gap:8px;}
        .po-grid2{display:grid;grid-template-columns:1fr;gap:16px;}
        @media(min-width:800px){.po-grid2{grid-template-columns:1fr 1fr;}}
        .po-rank{display:flex;align-items:center;gap:10px;padding:8px 12px;border-radius:10px;margin-bottom:6px;transition:all .15s;}
        .po-rank:hover{transform:translateX(4px);}
        .po-empty{text-align:center;padding:30px;color:rgba(37,99,235,.3);font-size:13px;font-weight:600;}
      `}</style>

      <div className="po-ey">📊 Platform Overview</div>
      <h2 className="po-title">Admin Dashboard</h2>
      <p className="po-sub">Real-time platform analytics and student performance overview</p>

      {loading && <div className="po-empty">⏳ Loading platform data...</div>}

      {!loading && (
        <>
          {/* ── STAT CARDS ── */}
          <div className="po-stats">
            {[
              { label: "Total Students", val: totalStudents, icon: "👨‍🎓", color: "#2563eb", bg: "rgba(37,99,235,.07)" },
              { label: "Total Tests", val: totalTests, icon: "📝", color: "#7c3aed", bg: "rgba(124,58,237,.07)" },
              { label: "Today's Tests", val: todayAttempts.length, icon: "📅", color: "#0d9488", bg: "rgba(13,148,136,.07)" },
              { label: "This Week", val: weekAttempts.length, icon: "📆", color: "#059669", bg: "rgba(5,150,105,.07)" },
              { label: "Avg Score", val: `${avgScore}%`, icon: "📊", color: avgScore >= 60 ? "#10b981" : "#ef4444", bg: avgScore >= 60 ? "#f0fdf4" : "#fff1f2" },
              { label: "Pass Rate", val: `${passRate}%`, icon: "✅", color: passRate >= 60 ? "#10b981" : "#ef4444", bg: passRate >= 60 ? "#f0fdf4" : "#fff1f2" },
              { label: "Exams", val: totalExams, icon: "📋", color: "#d97706", bg: "rgba(217,119,6,.07)" },
              { label: "At-Risk", val: atRisk.length, icon: "⚠️", color: atRisk.length ? "#ef4444" : "#10b981", bg: atRisk.length ? "#fff1f2" : "#f0fdf4" },
            ].map((s, i) => (
              <div key={i} className="po-stat" style={{ background: s.bg, border: `1.5px solid ${s.color}20`, animationDelay: `${i * .04}s` }}>
                <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
                <div className="po-stat-val" style={{ color: s.color }}>{s.val}</div>
                <div className="po-stat-lbl" style={{ color: s.color }}>{s.label}</div>
              </div>
            ))}
          </div>

          <div className="po-grid2">
            {/* ── SCORE DISTRIBUTION ── */}
            <div className="po-panel">
              <div className="po-ph">📈 Score Distribution</div>
              {distBuckets.map((b, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 55, fontSize: 11, fontWeight: 700, color: b.color, flexShrink: 0 }}>{b.label}</div>
                  <div style={{ flex: 1, height: 10, borderRadius: 10, background: "rgba(37,99,235,.06)", overflow: "hidden" }}>
                    <div style={{ height: "100%", borderRadius: 10, background: b.color, width: `${(b.count / maxBucket) * 100}%`, animation: "barGrow .8s ease", transition: "width .5s" }} />
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 900, color: b.color, minWidth: 30, textAlign: "right" }}>{b.count}</div>
                </div>
              ))}
              {!totalTests && <div className="po-empty">No data yet</div>}
            </div>

            {/* ── TOP PERFORMERS ── */}
            <div className="po-panel">
              <div className="po-ph">🏆 Top Performers</div>
              {topPerformers.length === 0 && <div className="po-empty">Min 2 tests needed for ranking</div>}
              {topPerformers.map((s, i) => {
                const medals = ["🥇", "🥈", "🥉"];
                return (
                  <div key={s.id} className="po-rank" style={{ background: i < 3 ? "rgba(37,99,235,.04)" : "transparent" }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#2563eb,#0d9488)", color: "white", fontSize: 12, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {i < 3 ? medals[i] : i + 1}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.name}</div>
                      <div style={{ fontSize: 10, color: "rgba(37,99,235,.4)" }}>{s.tests} tests</div>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 900, color: s.avg >= 70 ? "#10b981" : s.avg >= 50 ? "#f59e0b" : "#ef4444" }}>{s.avg}%</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="po-grid2">
            {/* ── AT-RISK STUDENTS ── */}
            <div className="po-panel" style={{ borderColor: atRisk.length ? "rgba(239,68,68,.2)" : undefined }}>
              <div className="po-ph" style={{ color: atRisk.length ? "#ef4444" : "#0f172a" }}>⚠️ At-Risk Students (avg &lt; 40%)</div>
              {atRisk.length === 0 && <div className="po-empty">🎉 No at-risk students — great!</div>}
              {atRisk.map((s, i) => (
                <div key={s.id} className="po-rank" style={{ background: "#fff1f2" }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#ef4444", color: "white", fontSize: 12, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {s.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{s.name}</div>
                    <div style={{ fontSize: 10, color: "rgba(239,68,68,.5)" }}>{s.email}</div>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 900, color: "#ef4444" }}>{s.avg}%</div>
                </div>
              ))}
            </div>

            {/* ── POPULAR TOPICS ── */}
            <div className="po-panel">
              <div className="po-ph">🔥 Most Active Topics</div>
              {popularTopics.length === 0 && <div className="po-empty">No topic data yet</div>}
              {popularTopics.map((t, i) => {
                const fillColor = t.avg >= 70 ? "#10b981" : t.avg >= 50 ? "#f59e0b" : "#ef4444";
                return (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <div style={{ fontSize: 14, flexShrink: 0 }}>{["🥇", "🥈", "🥉", "4️⃣", "5️⃣", "6️⃣"][i]}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.name}</div>
                    </div>
                    <div style={{ fontSize: 11, color: "rgba(37,99,235,.4)" }}>{t.count}x</div>
                    <div style={{ fontSize: 12, fontWeight: 900, color: fillColor }}>{t.avg}%</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── RECENT ACTIVITY ── */}
          <div className="po-panel">
            <div className="po-ph">🕐 Recent Activity</div>
            {recentAttempts.length === 0 && <div className="po-empty">No activity yet</div>}
            {recentAttempts.map((a, i) => {
              const fillColor = a.scorePercent >= 70 ? "#10b981" : a.scorePercent >= 50 ? "#f59e0b" : "#ef4444";
              const stuName = students.find(s => s.id === a.userId)?.name || "Student";
              return (
                <div key={i} className="po-rank" style={{ animationDelay: `${i * .03}s`, animation: "fadeUp .3s ease both" }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: `${fillColor}15`, border: `1.5px solid ${fillColor}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 900, color: fillColor, flexShrink: 0 }}>
                    {Math.round(a.scorePercent)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>
                      <strong>{stuName}</strong> scored {Math.round(a.scorePercent)}% on {a.topicName || "Test"}
                    </div>
                    <div style={{ fontSize: 10, color: "rgba(37,99,235,.35)" }}>
                      {a.correct}/{a.total} · {new Date(a.attemptedAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}
