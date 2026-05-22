import { useEffect, useState } from "react";
import api from "../../Api/axios";
import UserLayout from "../UserLayout";
import { useNavigate } from "react-router-dom";

/* ================================================================
   RECOMMENDATION ENGINE — Academic + Mental Health
   Computes client-side from existing attempt data + stress config.
================================================================ */

const MENTAL_RESOURCES = [
  { icon:"🫁", label:"4-7-8 Breathing Exercise", desc:"Reduce anxiety in 60 seconds", link:"/wellbeing" },
  { icon:"😴", label:"Sleep Hygiene Tip", desc:"7–9 hrs sleep = 40% better retention", link:"/wellbeing" },
  { icon:"🧘", label:"Mindfulness Break", desc:"5-min mindfulness reduces cortisol", link:"/wellbeing" },
];

const STUDY_TIPS = [
  "Try the Pomodoro method: 25 mins focus, 5 mins break.",
  "Teach the concept to someone else — best way to learn.",
  "Review weak topics in the morning when memory is freshest.",
  "Space your practice over days rather than cramming.",
  "Use active recall — close notes and write what you remember.",
];

export default function RecommendationEngine() {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/user/test/attempts")
      .then(r=>setAttempts(r.data||[]))
      .catch(()=>{})
      .finally(()=>setLoading(false));
  }, []);

  /* ---------- Compute recommendations ---------- */
  const topicMap = {};
  attempts.forEach(a=>{
    const k=a.topicId||a.topic||"unknown";
    const n=a.topicName||a.topic||"Unknown Topic";
    if(!topicMap[k])topicMap[k]={id:k,name:n,total:0,correct:0};
    topicMap[k].total++;
    topicMap[k].correct+=(a.scorePercent>=60?1:0);
  });
  const topics=Object.values(topicMap).map(t=>({...t,acc:t.total?Math.round(t.correct/t.total*100):0}));
  const weakTopics=topics.filter(t=>t.acc<60).sort((a,b)=>a.acc-b.acc).slice(0,3);
  const strongTopics=topics.filter(t=>t.acc>=75).slice(0,3);

  const sorted=[...attempts].sort((a,b)=>new Date(b.attemptedAt)-new Date(a.attemptedAt));
  const lastAttemptDaysAgo=sorted.length?Math.floor((Date.now()-new Date(sorted[0].attemptedAt))/86400000):999;
  const totalThisWeek=attempts.filter(a=>new Date(a.attemptedAt)>new Date(Date.now()-7*86400000)).length;
  const avgScore=attempts.length?Math.round(attempts.reduce((s,a)=>s+a.scorePercent,0)/attempts.length):0;
  const last5=sorted.slice(0,5);
  const last5Avg=last5.length?Math.round(last5.reduce((s,a)=>s+a.scorePercent,0)/last5.length):0;
  const improving=last5Avg>avgScore+5;

  /* Wellbeing nudge */
  const recent5=sorted.slice(0,5);
  const recentAvg=recent5.length?recent5.reduce((s,a)=>s+a.scorePercent,0)/recent5.length:60;
  let wbScore=60+(recentAvg>70?20:recentAvg<40?-20:0)-(lastAttemptDaysAgo>7?20:0);
  wbScore=Math.min(100,Math.max(0,wbScore));
  const needsBreak=wbScore<40;

  const studyTip=STUDY_TIPS[attempts.length%STUDY_TIPS.length];

  const achievementNudges=[];
  if(totalThisWeek<3) achievementNudges.push(`📅 Complete ${3-totalThisWeek} more test${3-totalThisWeek>1?"s":""} this week to hit your weekly goal!`);
  if(weakTopics.length>0) achievementNudges.push(`🎯 Master "${weakTopics[0]?.name}" to unlock the "Topic Master" badge.`);
  if(improving) achievementNudges.push("📈 You're improving! Keep this streak going for the Rising Star badge.");
  if(avgScore>=80) achievementNudges.push("🌟 Top performer! Challenge yourself with DIFFICULT difficulty settings.");

  return (
    <UserLayout>
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800;900&display=swap');
          @keyframes fadeUp{from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:translateY(0);}}
          .rec-ey{display:inline-flex;align-items:center;gap:6px;font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#6366f1;background:rgba(99,102,241,.09);border:1px solid rgba(99,102,241,.18);border-radius:20px;padding:4px 12px;margin-bottom:10px;}
          .rec-ey::before{content:'';width:5px;height:5px;border-radius:50%;background:#6366f1;}
          .rec-title{font-family:'Plus Jakarta Sans',sans-serif;font-size:26px;font-weight:900;letter-spacing:-.03em;color:#1e1b4b;margin-bottom:4px;}
          .rec-sub{font-size:14px;color:rgba(99,102,241,.5);margin-bottom:28px;}
          .rec-grid{display:grid;grid-template-columns:1fr;gap:18px;margin-bottom:8px;}
          @media(min-width:800px){.rec-grid{grid-template-columns:1fr 1fr;}}
          @media(min-width:1200px){.rec-grid{grid-template-columns:repeat(3,1fr);}}
          .rec-panel{background:rgba(255,255,255,.9);border:1.5px solid rgba(99,102,241,.1);border-radius:20px;padding:22px;animation:fadeUp .4s ease both;}
          .rec-ph{font-size:15px;font-weight:800;color:#1e1b4b;margin-bottom:14px;display:flex;align-items:center;gap:8px;}
          .rec-card{border-radius:14px;padding:14px 16px;margin-bottom:10px;display:flex;align-items:flex-start;gap:12px;transition:all .2s;cursor:pointer;}
          .rec-card:hover{transform:translateX(4px);}
          .rec-icon{width:38px;height:38px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;}
          .rec-nudge{border-radius:12px;padding:11px 14px;margin-bottom:8px;font-size:13px;font-weight:600;display:flex;align-items:center;gap:8px;}
          .rec-btn{display:inline-flex;align-items:center;gap:6px;padding:9px 16px;border-radius:12px;font-size:13px;font-weight:700;border:none;cursor:pointer;margin-top:12px;transition:all .2s;}
        `}</style>

        <div className="rec-ey">✨ Recommendations</div>
        <h2 className="rec-title">Your Personalised Recommendations</h2>
        <p className="rec-sub">AI-powered guidance based on your performance and wellbeing</p>

        {loading && <div style={{textAlign:"center",padding:60,color:"rgba(99,102,241,.4)",fontSize:15,fontWeight:600}}>⏳ Generating your recommendations...</div>}

        {!loading && (
          <>
            {/* Overall nudge banner */}
            {lastAttemptDaysAgo>3 && (
              <div style={{background:"linear-gradient(135deg,#eef2ff,#ede9fe)",border:"1.5px solid rgba(99,102,241,.2)",borderRadius:14,padding:"14px 18px",marginBottom:22,display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
                <span style={{fontSize:24}}>⏰</span>
                <div style={{flex:1}}>
                  <div style={{fontSize:14,fontWeight:800,color:"#6366f1"}}>
                    You haven't practised in {lastAttemptDaysAgo} day{lastAttemptDaysAgo!==1?"s":""}!
                  </div>
                  <div style={{fontSize:12,color:"rgba(99,102,241,.5)"}}>Consistent practice is key to retaining knowledge.</div>
                </div>
                <button onClick={()=>navigate("/home")} className="rec-btn" style={{background:"#6366f1",color:"white"}}>
                  Take a Test →
                </button>
              </div>
            )}
            {improving && (
              <div style={{background:"linear-gradient(135deg,#f0fdf4,#dcfce7)",border:"1.5px solid rgba(16,185,129,.25)",borderRadius:14,padding:"14px 18px",marginBottom:22,display:"flex",alignItems:"center",gap:12}}>
                <span style={{fontSize:24}}>📈</span>
                <div style={{fontSize:14,fontWeight:800,color:"#10b981"}}>You're improving! Recent avg: {last5Avg}% vs overall: {avgScore}%</div>
              </div>
            )}

            <div className="rec-grid">
              {/* ACADEMIC */}
              <div className="rec-panel">
                <div className="rec-ph">📚 Academic Recommendations</div>

                {weakTopics.length===0 && attempts.length===0 && (
                  <div style={{color:"rgba(99,102,241,.4)",fontSize:13,textAlign:"center",padding:"20px 0"}}>Take some tests to get personalised suggestions!</div>
                )}

                {weakTopics.length>0 && (
                  <>
                    <div style={{fontSize:12,fontWeight:700,color:"rgba(239,68,68,.5)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:10}}>Focus These Next</div>
                    {weakTopics.map((t,i)=>(
                      <div key={t.id} className="rec-card" style={{background:"#fff1f2",border:"1.5px solid rgba(239,68,68,.15)"}}
                        onClick={()=>navigate("/adaptive-learning")}>
                        <div className="rec-icon" style={{background:"rgba(239,68,68,.1)"}}>{i===0?"🔴":i===1?"🟠":"🟡"}</div>
                        <div>
                          <div style={{fontSize:13,fontWeight:800,color:"#1e1b4b"}}>{t.name}</div>
                          <div style={{fontSize:12,color:"#ef4444",fontWeight:700}}>{t.acc}% accuracy · Set Easy mode</div>
                        </div>
                      </div>
                    ))}
                  </>
                )}

                {strongTopics.length>0 && (
                  <>
                    <div style={{fontSize:12,fontWeight:700,color:"rgba(16,185,129,.5)",textTransform:"uppercase",letterSpacing:".06em",marginTop:14,marginBottom:10}}>Strengths to Maintain</div>
                    {strongTopics.map(t=>(
                      <div key={t.id} className="rec-card" style={{background:"#f0fdf4",border:"1.5px solid rgba(16,185,129,.15)"}}>
                        <div className="rec-icon" style={{background:"rgba(16,185,129,.1)"}}>🌟</div>
                        <div>
                          <div style={{fontSize:13,fontWeight:800,color:"#1e1b4b"}}>{t.name}</div>
                          <div style={{fontSize:12,color:"#10b981",fontWeight:700}}>{t.acc}% — Challenge with Hard mode</div>
                        </div>
                      </div>
                    ))}
                  </>
                )}

                {/* Study tip */}
                <div style={{background:"rgba(238,242,255,.8)",borderRadius:12,padding:"12px 14px",marginTop:14,fontSize:13,fontWeight:600,color:"#4338ca"}}>
                  💡 Tip: {studyTip}
                </div>

                <button onClick={()=>navigate("/adaptive-learning")} className="rec-btn" style={{background:"#eef2ff",color:"#6366f1"}}>
                  🧠 Open Learning Path →
                </button>
              </div>

              {/* WELLBEING */}
              <div className="rec-panel">
                <div className="rec-ph">🧘 Wellbeing Suggestions</div>

                {needsBreak && (
                  <div className="rec-nudge" style={{background:"#fee2e2",color:"#ef4444",marginBottom:14}}>
                    ⚠️ Your recent scores suggest high stress. Please take a break!
                  </div>
                )}

                {MENTAL_RESOURCES.map((r,i)=>(
                  <div key={i} className="rec-card" style={{background:"rgba(238,242,255,.6)",border:"1.5px solid rgba(99,102,241,.1)"}}
                    onClick={()=>navigate(r.link)}>
                    <div className="rec-icon" style={{background:"rgba(99,102,241,.08)"}}>{r.icon}</div>
                    <div>
                      <div style={{fontSize:13,fontWeight:800,color:"#1e1b4b"}}>{r.label}</div>
                      <div style={{fontSize:12,color:"rgba(99,102,241,.5)"}}>{r.desc}</div>
                    </div>
                  </div>
                ))}

                {totalThisWeek>=3 && (
                  <div className="rec-nudge" style={{background:"#f0fdf4",color:"#16a34a",marginTop:8}}>
                    🎉 {totalThisWeek} tests this week — great consistency!
                  </div>
                )}

                <button onClick={()=>navigate("/wellbeing")} className="rec-btn" style={{background:"rgba(16,185,129,.1)",color:"#10b981"}}>
                  💚 Open Wellbeing Page →
                </button>
              </div>

              {/* ACHIEVEMENTS */}
              <div className="rec-panel" style={{gridColumn:"span 1"}}>
                <div className="rec-ph">🏆 Achievement Nudges</div>

                {achievementNudges.length===0 ? (
                  <div style={{color:"rgba(99,102,241,.35)",fontSize:13,textAlign:"center",padding:"20px 0"}}>Keep practising to unlock achievement suggestions!</div>
                ) : (
                  achievementNudges.map((n,i)=>(
                    <div key={i} className="rec-nudge" style={{background:i%2===0?"rgba(238,242,255,.8)":"rgba(254,249,195,.8)",color:i%2===0?"#4338ca":"#92400e",border:`1.5px solid ${i%2===0?"rgba(99,102,241,.15)":"rgba(245,158,11,.2)"}`}}>
                      {n}
                    </div>
                  ))
                )}

                {/* Weekly goal */}
                <div style={{marginTop:16}}>
                  <div style={{fontSize:12,fontWeight:700,color:"rgba(99,102,241,.4)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:8}}>Weekly Goal</div>
                  <div style={{height:10,borderRadius:10,background:"rgba(99,102,241,.08)",overflow:"hidden"}}>
                    <div style={{height:"100%",borderRadius:10,background:"linear-gradient(90deg,#6366f1,#8b5cf6)",width:`${Math.min(100,totalThisWeek/3*100)}%`,transition:"width 1s ease"}}/>
                  </div>
                  <div style={{fontSize:12,color:"rgba(99,102,241,.5)",marginTop:5}}>{totalThisWeek}/3 tests this week</div>
                </div>

                <button onClick={()=>navigate("/analytics")} className="rec-btn" style={{background:"#eef2ff",color:"#6366f1",marginTop:16}}>
                  📊 View Full Analytics →
                </button>
              </div>
            </div>
          </>
        )}
      </>
    </UserLayout>
  );
}
