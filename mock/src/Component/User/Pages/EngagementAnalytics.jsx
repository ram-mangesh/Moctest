import { useEffect, useState } from "react";
import api from "../../Api/axios";
import UserLayout from "../UserLayout";

/* ================================================================
   STUDENT PERFORMANCE & ENGAGEMENT ANALYTICS
   - GitHub-style contribution heatmap calendar
   - Streak counter with badges  
   - Trend analysis (last 5 vs previous 5)
   - Topic accuracy breakdown
   - Engagement score card
================================================================ */

function getDaysSince(dateStr) {
  return Math.floor((Date.now() - new Date(dateStr)) / 86400000);
}

function buildHeatmap(attempts) {
  // last 12 weeks (84 days)
  const map = {};
  attempts.forEach((a) => {
    const d = new Date(a.attemptedAt);
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
    map[key] = (map[key] || 0) + 1;
  });
  // build last 84 days array
  const days = [];
  for (let i = 83; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
    days.push({ key, date: d, count: map[key] || 0 });
  }
  return days;
}

function calcStreak(attempts) {
  if (!attempts.length) return 0;
  const dates = [...new Set(attempts.map((a) => {
    const d = new Date(a.attemptedAt);
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  }))].sort().reverse();
  let streak = 0;
  let cur = new Date(); cur.setHours(0,0,0,0);
  for (const ds of dates) {
    const [y,m,d2] = ds.split("-").map(Number);
    const day = new Date(y, m, d2);
    const diff = Math.round((cur - day) / 86400000);
    if (diff === 0 || diff === 1) { streak++; cur = day; }
    else break;
  }
  return streak;
}

const HEAT_COLORS = ["#eef2ff","#c7d2fe","#818cf8","#6366f1","#4338ca"];

export default function EngagementAnalytics() {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    api.get("/user/test/attempts")
      .then((r) => setAttempts(r.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <UserLayout>
        <div style={{ textAlign:"center", padding:60, color:"rgba(99,102,241,.5)", fontSize:16 }}>
          ⏳ Loading your analytics...
        </div>
      </UserLayout>
    );
  }

  const heatmap = buildHeatmap(attempts);
  const streak  = calcStreak(attempts);
  const total   = attempts.length;
  const avgScore = total ? Math.round(attempts.reduce((s,a)=>s+a.scorePercent,0)/total) : 0;

  // Trend: last 5 vs prev 5
  const sorted = [...attempts].sort((a,b)=>new Date(a.attemptedAt)-new Date(b.attemptedAt));
  const last5  = sorted.slice(-5);
  const prev5  = sorted.slice(-10,-5);
  const last5Avg = last5.length ? Math.round(last5.reduce((s,a)=>s+a.scorePercent,0)/last5.length) : 0;
  const prev5Avg = prev5.length ? Math.round(prev5.reduce((s,a)=>s+a.scorePercent,0)/prev5.length) : 0;
  const trendDelta = last5Avg - prev5Avg;
  const trendLabel = trendDelta > 5 ? "📈 Improving" : trendDelta < -5 ? "📉 Declining" : "➡️ Stable";
  const trendColor = trendDelta > 5 ? "#10b981" : trendDelta < -5 ? "#ef4444" : "#6366f1";

  // Topic breakdown
  const topicMap = {};
  attempts.forEach((a) => {
    const k = a.topicName || a.topic || "Unknown";
    if (!topicMap[k]) topicMap[k] = { total:0, sum:0 };
    topicMap[k].total++;
    topicMap[k].sum += a.scorePercent;
  });
  const topics = Object.entries(topicMap)
    .map(([name,v])=>({ name, avg:Math.round(v.sum/v.total), count:v.total }))
    .sort((a,b)=>b.count-a.count).slice(0,8);

  // Engagement score (0-100)
  const engagementScore = Math.min(100, Math.round(
    (streak * 5) + (Math.min(total, 20) * 2.5) + (avgScore * 0.3)
  ));
  const engLabel = engagementScore >= 80 ? "🔥 Excellent" : engagementScore >= 50 ? "💪 Good" : engagementScore >= 25 ? "📖 Getting Started" : "🌱 Beginner";

  // Heatmap cell color
  const cellColor = (count) => {
    if (count === 0) return HEAT_COLORS[0];
    if (count === 1) return HEAT_COLORS[1];
    if (count === 2) return HEAT_COLORS[2];
    if (count === 3) return HEAT_COLORS[3];
    return HEAT_COLORS[4];
  };

  return (
    <UserLayout>
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
          @keyframes fadeUp { from{opacity:0;transform:translateY(14px);} to{opacity:1;transform:translateY(0);} }
          @keyframes barGrow { from{width:0!important;} }
          .ea-title { font-family:'Plus Jakarta Sans',sans-serif;font-size:26px;font-weight:900;letter-spacing:-.03em;color:#1e1b4b;margin-bottom:4px;animation:fadeUp .4s ease both; }
          .ea-sub { font-size:14px;color:rgba(99,102,241,.5);margin-bottom:28px; }
          .ea-eyebrow { display:inline-flex;align-items:center;gap:6px;font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#6366f1;background:rgba(99,102,241,.09);border:1px solid rgba(99,102,241,.18);border-radius:20px;padding:4px 12px;margin-bottom:10px; }
          .ea-eyebrow::before { content:'';width:5px;height:5px;border-radius:50%;background:#6366f1; }
          .ea-stats { display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin-bottom:24px; }
          @media(min-width:640px){.ea-stats{grid-template-columns:repeat(4,1fr);}}
          .ea-stat { background:rgba(255,255,255,.9);border:1.5px solid rgba(99,102,241,.1);border-radius:16px;padding:16px 18px;animation:fadeUp .4s ease both; }
          .ea-card { background:rgba(255,255,255,.9);border:1.5px solid rgba(99,102,241,.1);border-radius:18px;padding:22px 24px;margin-bottom:20px;animation:fadeUp .4s ease both; }
          .ea-card-title { font-size:14.5px;font-weight:700;color:#1e1b4b;margin-bottom:16px; }
          .ea-heat-grid { display:grid;grid-template-columns:repeat(12,1fr);gap:3px; }
          @media(max-width:600px){.ea-heat-grid{grid-template-columns:repeat(6,1fr);}}
          .ea-heat-cell { width:100%;aspect-ratio:1;border-radius:3px;transition:transform .15s;cursor:default; }
          .ea-heat-cell:hover { transform:scale(1.3); }
          .ea-bar { height:8px;border-radius:8px;background:rgba(99,102,241,.08);overflow:hidden;margin:6px 0 3px; }
          .ea-bar-fill { height:100%;border-radius:8px;animation:barGrow 1s cubic-bezier(.4,0,.2,1); }
          .ea-streak-badge { display:inline-flex;align-items:center;gap:5px;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:800; }
          .ea-eng-ring { width:90px;height:90px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0; }
        `}</style>

        <div className="ea-eyebrow">📊 Analytics Hub</div>
        <h2 className="ea-title">Performance & Engagement Analytics</h2>
        <p className="ea-sub">Deep insights into your study patterns and progress</p>

        {total === 0 ? (
          <div style={{ textAlign:"center", padding:60, color:"rgba(99,102,241,.4)", fontSize:15, fontWeight:600 }}>
            📝 No attempts yet. Take some tests to see your analytics!
          </div>
        ) : (
          <>
            {/* Stats row */}
            <div className="ea-stats">
              {[
                { icon:"⏱️", label:"Total Tests",  value:total,       color:"#6366f1" },
                { icon:"📊", label:"Avg Score",    value:`${avgScore}%`, color:"#7c3aed" },
                { icon:"🔥", label:"Day Streak",   value:`${streak}d`,   color:"#f59e0b" },
                { icon:"⚡", label:"Engagement",   value:`${engagementScore}%`, color:"#10b981" },
              ].map((s,i) => (
                <div key={i} className="ea-stat" style={{ animationDelay:`${i*.07}s`, borderLeft:`3px solid ${s.color}` }}>
                  <div style={{ fontSize:20, marginBottom:4 }}>{s.icon}</div>
                  <div style={{ fontSize:22, fontWeight:900, color:s.color, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>{s.value}</div>
                  <div style={{ fontSize:11, fontWeight:700, color:"rgba(99,102,241,.4)", textTransform:"uppercase", letterSpacing:".06em" }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Contribution Heatmap */}
            <div className="ea-card">
              <div className="ea-card-title">📅 Activity Calendar — Last 12 Weeks</div>
              <div className="ea-heat-grid">
                {heatmap.map((day) => (
                  <div key={day.key} className="ea-heat-cell"
                    style={{ background: cellColor(day.count) }}
                    title={`${day.key}: ${day.count} test${day.count!==1?"s":""}`} />
                ))}
              </div>
              <div style={{ display:"flex", gap:6, alignItems:"center", marginTop:10, fontSize:11, color:"rgba(99,102,241,.4)" }}>
                <span>Less</span>
                {HEAT_COLORS.map((c,i) => <div key={i} style={{ width:10, height:10, borderRadius:2, background:c }} />)}
                <span>More</span>
              </div>
            </div>

            {/* Trend + Engagement */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:20 }}>
              {/* Trend */}
              <div className="ea-card" style={{ margin:0 }}>
                <div className="ea-card-title">📈 Performance Trend</div>
                <div style={{ fontSize:26, fontWeight:900, color:trendColor, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>{trendLabel}</div>
                <div style={{ fontSize:13, color:"#94a3b8", marginTop:8 }}>
                  Last 5: <strong style={{ color:"#6366f1" }}>{last5Avg}%</strong>{" "}
                  vs Prev 5: <strong style={{ color:"#94a3b8" }}>{prev5Avg}%</strong>
                </div>
                {trendDelta !== 0 && (
                  <div style={{ marginTop:8, fontSize:13, fontWeight:700, color:trendColor }}>
                    {trendDelta > 0 ? "▲" : "▼"} {Math.abs(trendDelta)}% change
                  </div>
                )}
              </div>
              {/* Engagement */}
              <div className="ea-card" style={{ margin:0, display:"flex", gap:16, alignItems:"center" }}>
                <div className="ea-eng-ring" style={{ background:`conic-gradient(#6366f1 ${engagementScore*3.6}deg, #eef2ff 0deg)`, padding:5 }}>
                  <div style={{ width:"70px", height:"70px", borderRadius:"50%", background:"white", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column" }}>
                    <div style={{ fontSize:18, fontWeight:900, color:"#6366f1" }}>{engagementScore}</div>
                    <div style={{ fontSize:9, color:"rgba(99,102,241,.5)", fontWeight:700 }}>SCORE</div>
                  </div>
                </div>
                <div>
                  <div className="ea-card-title" style={{ marginBottom:6 }}>⚡ Engagement Score</div>
                  <div style={{ fontSize:15, fontWeight:800, color:"#6366f1" }}>{engLabel}</div>
                  <div style={{ fontSize:11, color:"rgba(99,102,241,.4)", marginTop:4 }}>Based on streak + frequency + scores</div>
                  {/* Badges */}
                  <div style={{ display:"flex", gap:6, marginTop:10, flexWrap:"wrap" }}>
                    {streak >= 3  && <span className="ea-streak-badge" style={{ background:"#fef9c3", color:"#ca8a04" }}>🔥 3-day streak</span>}
                    {streak >= 7  && <span className="ea-streak-badge" style={{ background:"#fef3c7", color:"#d97706" }}>⚡ Week hero</span>}
                    {streak >= 30 && <span className="ea-streak-badge" style={{ background:"#fde68a", color:"#926321" }}>🏆 Month master</span>}
                    {total >= 10  && <span className="ea-streak-badge" style={{ background:"#ede9fe", color:"#7c3aed" }}>📚 10 tests</span>}
                    {avgScore >= 80 && <span className="ea-streak-badge" style={{ background:"#dcfce7", color:"#15803d" }}>🌟 Top scorer</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* Topic breakdown */}
            <div className="ea-card">
              <div className="ea-card-title">📚 Topic-wise Accuracy</div>
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {topics.map((t,i) => (
                  <div key={t.name}>
                    <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, fontWeight:600, marginBottom:3 }}>
                      <span style={{ color:"#1e1b4b" }}>{t.name}</span>
                      <span style={{ color: t.avg >= 75 ? "#10b981" : t.avg >= 50 ? "#f59e0b" : "#ef4444", fontWeight:800 }}>{t.avg}%</span>
                    </div>
                    <div className="ea-bar">
                      <div className="ea-bar-fill" style={{ width:`${t.avg}%`, background: t.avg >= 75 ? "#10b981" : t.avg >= 50 ? "#f59e0b" : "#ef4444" }} />
                    </div>
                    <div style={{ fontSize:11, color:"rgba(99,102,241,.4)" }}>{t.count} attempt{t.count!==1?"s":""}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </>
    </UserLayout>
  );
}
