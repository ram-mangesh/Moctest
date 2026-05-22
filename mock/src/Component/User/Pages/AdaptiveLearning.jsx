import { useEffect, useState, useCallback } from "react";
import api from "../../Api/axios";
import UserLayout from "../UserLayout";

/* ================================================================
   PERSONALIZED ADAPTIVE LEARNING SYSTEM
   - Pulls attempt history → computes per-topic accuracy
   - Classifies topics: Weak / Average / Strong
   - Lets student override difficulty per topic (API call)
   - Displays recommended learning path (roadmap order)
================================================================ */

const DIFFICULTY_COLORS = {
  EASY:      { bg: "#dcfce7", text: "#16a34a", border: "#86efac" },
  MEDIUM:    { bg: "#fef9c3", text: "#ca8a04", border: "#fde047" },
  DIFFICULT: { bg: "#fee2e2", text: "#dc2626", border: "#fca5a5" },
};

const classify = (acc) =>
  acc < 50 ? "Weak" : acc < 75 ? "Average" : "Strong";

const classifyColor = { Weak: "#ef4444", Average: "#f59e0b", Strong: "#10b981" };
const classifyBg    = { Weak: "#fff1f2", Average: "#fffbeb", Strong: "#f0fdf4" };

export default function AdaptiveLearning() {
  const [attempts, setAttempts] = useState([]);
  const [topicData, setTopicData] = useState([]);
  const [overrides, setOverrides] = useState({});   // { topicId: "EASY" | "MEDIUM" | "DIFFICULT" }
  const [saving, setSaving] = useState({});
  const [saved, setSaved] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/user/test/attempts")
      .then((res) => {
        const data = res.data || [];
        setAttempts(data);

        // Build per-topic stats
        const map = {};
        data.forEach((a) => {
          const key   = a.topicId || a.topic || "unknown";
          const label = a.topicName || a.topic || "Unknown Topic";
          if (!map[key]) map[key] = { topicId: key, topicName: label, total: 0, correct: 0, dates: [] };
          map[key].total  += 1;
          map[key].correct += (a.scorePercent >= 60 ? 1 : 0);
          map[key].dates.push(a.attemptedAt);
        });

        const topics = Object.values(map).map((t) => ({
          ...t,
          accuracy:     t.total ? Math.round((t.correct / t.total) * 100) : 0,
          classification: classify(t.total ? Math.round((t.correct / t.total) * 100) : 0),
          lastAttempt:  t.dates.sort().reverse()[0],
        })).sort((a, b) => a.accuracy - b.accuracy); // weakest first

        setTopicData(topics);
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    // Load existing difficulty logs
    api.get("/api/user/difficulty/logs")
      .then((res) => {
        const logs = res.data || [];
        const map = {};
        logs.forEach((l) => { map[l.topicId] = l.selectedDifficulty; });
        setOverrides(map);
      })
      .catch(() => {});
  }, []);

  const handleDifficulty = useCallback(async (topicId, difficulty) => {
    setSaving((s) => ({ ...s, [topicId]: true }));
    setOverrides((o) => ({ ...o, [topicId]: difficulty }));
    try {
      await api.post("/api/user/difficulty/override", {
        topicId: String(topicId),
        difficulty,
      });
      setSaved((s) => ({ ...s, [topicId]: true }));
      setTimeout(() => setSaved((s) => ({ ...s, [topicId]: false })), 2000);
    } catch (_) {}
    setSaving((s) => ({ ...s, [topicId]: false }));
  }, []);

  const weak    = topicData.filter((t) => t.classification === "Weak");
  const average = topicData.filter((t) => t.classification === "Average");
  const strong  = topicData.filter((t) => t.classification === "Strong");

  return (
    <UserLayout>
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
          @keyframes fadeUp { from{opacity:0;transform:translateY(14px);} to{opacity:1;transform:translateY(0);} }
          @keyframes barGrow { from{width:0!important;} }
          .al-eyebrow { display:inline-flex;align-items:center;gap:6px;font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#7c3aed;background:rgba(124,58,237,.09);border:1px solid rgba(124,58,237,.18);border-radius:20px;padding:4px 12px;margin-bottom:10px; }
          .al-eyebrow::before { content:'';width:5px;height:5px;border-radius:50%;background:#7c3aed; }
          .al-title { font-family:'Plus Jakarta Sans',sans-serif;font-size:26px;font-weight:900;letter-spacing:-.03em;color:#1e1b4b;margin-bottom:4px;animation:fadeUp .4s ease both; }
          .al-sub { font-size:14px;color:rgba(124,58,237,.5);font-weight:400;margin-bottom:28px;animation:fadeUp .4s ease .05s both; }
          .al-section-title { font-size:13px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;margin:28px 0 14px;display:flex;align-items:center;gap:8px; }
          .al-grid { display:grid;grid-template-columns:1fr;gap:14px; }
          @media(min-width:700px){.al-grid{grid-template-columns:repeat(2,1fr);}}
          @media(min-width:1100px){.al-grid{grid-template-columns:repeat(3,1fr);}}
          .al-card { background:rgba(255,255,255,.9);border:1.5px solid rgba(99,102,241,.1);border-radius:18px;padding:18px 20px;box-shadow:0 2px 16px rgba(99,102,241,.06);animation:fadeUp .4s ease both;transition:all .2s; }
          .al-card:hover { transform:translateY(-3px);box-shadow:0 10px 32px rgba(99,102,241,.12); }
          .al-topic-name { font-size:14px;font-weight:700;color:#1e1b4b;margin-bottom:6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis; }
          .al-acc-bar { height:7px;border-radius:6px;background:rgba(99,102,241,.1);overflow:hidden;margin:8px 0 4px; }
          .al-acc-fill { height:100%;border-radius:6px;animation:barGrow .9s cubic-bezier(.4,0,.2,1); }
          .al-badge { display:inline-flex;align-items:center;font-size:11px;font-weight:700;border-radius:20px;padding:2px 9px; }
          .al-diff-row { display:flex;gap:6px;margin-top:12px;flex-wrap:wrap; }
          .al-diff-btn { font-size:11px;font-weight:700;border-radius:20px;padding:4px 10px;border:1.5px solid;cursor:pointer;transition:all .15s;background:white; }
          .al-diff-btn.active { color:white!important;border-color:transparent!important; }
          .al-diff-btn:hover { opacity:.85; }
          .al-saved { font-size:11px;color:#10b981;font-weight:700;margin-top:6px; }
          .al-roadmap { display:flex;flex-direction:column;gap:0; }
          .al-roadmap-item { display:flex;align-items:center;gap:14px;padding:12px 18px;background:rgba(255,255,255,.9);border:1.5px solid rgba(99,102,241,.1);border-radius:14px;margin-bottom:10px;position:relative;transition:all .2s; }
          .al-roadmap-item:hover { transform:translateX(4px); }
          .al-step-num { width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:900;flex-shrink:0; }
          .al-empty { text-align:center;padding:40px;color:rgba(99,102,241,.4);font-size:15px;font-weight:600; }
          .al-yt-btn { display:inline-flex;align-items:center;gap:6px;padding:6px 12px;border-radius:10px;background:#fee2e2;color:#dc2626;border:1.5px solid #fca5a5;font-size:12px;font-weight:700;cursor:pointer;transition:all .2s;text-decoration:none; }
          .al-yt-btn:hover { background:#fecaca;transform:scale(1.03); }
        `}</style>

        <div className="al-eyebrow">🧠 Adaptive Learning</div>
        <h2 className="al-title">Personalized Learning Path</h2>
        <p className="al-sub">Your topics ranked by performance — focus on weak areas first</p>

        {loading && <div className="al-empty">⏳ Analysing your performance...</div>}

        {!loading && topicData.length === 0 && (
          <div className="al-empty">📝 No attempts yet. Take some tests to get your personalised learning path!</div>
        )}

        {!loading && topicData.length > 0 && (
          <>
            {/* ── Summary bar ── */}
            <div style={{ display:"flex",gap:12,marginBottom:28,flexWrap:"wrap" }}>
              {[
                { label:"Weak Topics",  count:weak.length,    color:"#ef4444", bg:"#fff1f2" },
                { label:"Average",      count:average.length, color:"#f59e0b", bg:"#fffbeb" },
                { label:"Strong",       count:strong.length,  color:"#10b981", bg:"#f0fdf4" },
                { label:"Total Tests",  count:attempts.length,color:"#6366f1", bg:"#eef2ff" },
              ].map((s,i) => (
                <div key={i} style={{ background:s.bg,border:`1.5px solid ${s.color}30`,borderRadius:14,padding:"10px 18px",minWidth:100 }}>
                  <div style={{ fontSize:22,fontWeight:900,color:s.color }}>{s.count}</div>
                  <div style={{ fontSize:11,fontWeight:700,color:s.color,opacity:.7,textTransform:"uppercase",letterSpacing:".06em" }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* ── Recommended Roadmap ── */}
            <div className="al-section-title" style={{ color:"#7c3aed" }}>
              🗺️ Recommended Study Order
            </div>
            <div className="al-roadmap" style={{ marginBottom:32 }}>
              {topicData.slice(0, 8).map((t, i) => {
                const dc = DIFFICULTY_COLORS[overrides[t.topicId] || "MEDIUM"];
                return (
                  <div key={t.topicId} className="al-roadmap-item" style={{ animationDelay:`${i*.06}s` }}>
                    <div className="al-step-num" style={{ background:classifyBg[t.classification], color:classifyColor[t.classification] }}>
                      {i + 1}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontWeight:700, fontSize:14, color:"#1e1b4b", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{t.topicName}</div>
                      <div style={{ fontSize:12, color:"#94a3b8" }}>{t.accuracy}% accuracy · {t.total} test{t.total !== 1?"s":""}</div>
                    </div>
                    
                    <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(t.topicName + ' lesson')}`} 
                       target="_blank" rel="noreferrer" className="al-yt-btn" title="Watch on YouTube">
                      <span style={{fontSize:16}}>📺</span> Study
                    </a>

                    <span className="al-badge" style={{ background:classifyBg[t.classification], color:classifyColor[t.classification], marginLeft:10 }}>
                      {t.classification}
                    </span>
                    {overrides[t.topicId] && (
                      <span className="al-badge" style={{ background:dc.bg, color:dc.text, borderColor:dc.border, border:`1px solid`, marginLeft:6 }}>
                        {overrides[t.topicId]}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* ── Weak Topics ── */}
            {weak.length > 0 && (
              <>
                <div className="al-section-title" style={{ color:"#ef4444" }}>🔴 Weak Topics — Focus Here First</div>
                <TopicGrid topics={weak} overrides={overrides} saving={saving} saved={saved} onDiff={handleDifficulty} />
              </>
            )}

            {/* ── Average Topics ── */}
            {average.length > 0 && (
              <>
                <div className="al-section-title" style={{ color:"#f59e0b" }}>🟡 Average Topics — Keep Improving</div>
                <TopicGrid topics={average} overrides={overrides} saving={saving} saved={saved} onDiff={handleDifficulty} />
              </>
            )}

            {/* ── Strong Topics ── */}
            {strong.length > 0 && (
              <>
                <div className="al-section-title" style={{ color:"#10b981" }}>🟢 Strong Topics — Maintain & Challenge</div>
                <TopicGrid topics={strong} overrides={overrides} saving={saving} saved={saved} onDiff={handleDifficulty} />
              </>
            )}
          </>
        )}
      </>
    </UserLayout>
  );
}

function TopicGrid({ topics, overrides, saving, saved, onDiff }) {
  return (
    <div className="al-grid" style={{ marginBottom:8 }}>
      {topics.map((t, i) => {
        const acc = t.accuracy;
        const cls = t.classification;
        const fillColor = cls === "Weak" ? "#ef4444" : cls === "Average" ? "#f59e0b" : "#10b981";
        const curr = overrides[t.topicId];
        return (
          <div key={t.topicId} className="al-card" style={{ animationDelay:`${i * .07}s` }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
              <div className="al-topic-name" style={{ flex:1 }}>{t.topicName}</div>
              <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(t.topicName + ' explanation')}`} 
                 target="_blank" rel="noreferrer" className="al-yt-btn" style={{ padding:"4px 8px", fontSize:10 }}>
                📺 YouTube
              </a>
            </div>
            <div style={{ fontSize:12, color:"#94a3b8", marginBottom:4 }}>{t.total} attempt{t.total !== 1 ? "s" : ""}</div>
            <div className="al-acc-bar">
              <div className="al-acc-fill" style={{ width:`${acc}%`, background:fillColor }} />
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span style={{ fontSize:12, fontWeight:700, color:fillColor }}>{acc}% accuracy</span>
              <span className="al-badge" style={{ background:classifyBg[cls], color:classifyColor[cls] }}>{cls}</span>
            </div>
            {/* Difficulty selector */}
            <div className="al-diff-row">
              {["EASY","MEDIUM","DIFFICULT"].map((d) => {
                const dc = DIFFICULTY_COLORS[d];
                const isActive = curr === d;
                return (
                  <button key={d} className={`al-diff-btn${isActive?" active":""}`}
                    disabled={saving[t.topicId]}
                    style={{ color: isActive ? "white" : dc.text, borderColor: dc.border, background: isActive ? dc.text : dc.bg }}
                    onClick={() => onDiff(t.topicId, d)}>
                    {d === "EASY" ? "🟢 Easy" : d === "MEDIUM" ? "🟡 Medium" : "🔴 Hard"}
                    {saving[t.topicId] && curr === d ? " ..." : ""}
                  </button>
                );
              })}
            </div>
            {saved[t.topicId] && <div className="al-saved">✓ Difficulty saved!</div>}
          </div>
        );
      })}
    </div>
  );
}
