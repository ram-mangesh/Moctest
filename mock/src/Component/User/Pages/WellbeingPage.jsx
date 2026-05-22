import { useEffect, useState, useRef } from "react";
import { Watch } from "lucide-react";
import api from "../../Api/axios";
import UserLayout from "../UserLayout";

const TIPS = [
  { icon:"💧", tip:"Drink water before studying — hydration boosts focus by 14%." },
  { icon:"🧘", tip:"Take a 2-min breathing break every 25 minutes (Pomodoro technique)." },
  { icon:"🌿", tip:"A 10-minute walk increases blood flow to the brain and sharpens memory." },
  { icon:"😴", tip:"Sleep 7-9 hours. Memory consolidation happens during deep sleep." },
  { icon:"📵", tip:"Put your phone face-down during study sessions to reduce distraction." },
  { icon:"🎵", tip:"Instrumental music (no lyrics) can improve concentration and reduce anxiety." },
  { icon:"✍️", tip:"Write 3 things you're grateful for before studying — reduces stress hormones." },
];

const BREATH_STEPS = [
  { label:"Breathe IN", dur:4, color:"#3b82f6", scale:1.35 },
  { label:"Hold",       dur:7, color:"#8b5cf6", scale:1.35 },
  { label:"Breathe OUT",dur:8, color:"#10b981", scale:1.0  },
];

export default function WellbeingPage() {
  const [attempts, setAttempts]       = useState([]);
  const [behaviorSummary, setBehaviorSummary] = useState(null);  // real behavioral data
  const [form, setForm]               = useState({ driftStressDelta:10, optionChangeStressCap:16, longTimeThresholdSeconds:90, calmUiStressThreshold:50, mistakeRiskStressThreshold:30, mistakeRiskConfidenceThreshold:40 });
  const [savingCfg, setSavingCfg]     = useState(false);
  const [cfgSaved, setCfgSaved]       = useState(false);
  const [breathing, setBreathing]     = useState(false);
  const [bStep, setBStep]             = useState(0);
  const [bTimer, setBTimer]           = useState(BREATH_STEPS[0].dur);
  const [bCycles, setBCycles]         = useState(0);
  const [tipIdx, setTipIdx]           = useState(0);
  const [calmMode, setCalmMode]       = useState(()=>localStorage.getItem("calmMode")==="true");
  
  // WEARABLE STATES
  const [vitals, setVitals]           = useState({ heartRate:72, steps:1200, stressLevel:25, sleepMinutes:420, oxygenLevels:98, bodyTemp:36.6, calories:450 });
  const [isSyncing, setIsSyncing]     = useState(false);
  const [lastSync, setLastSync]       = useState(null);
  const [watchAdvice, setWatchAdvice] = useState("");
  
  const bRef = useRef(null);

  useEffect(() => {
    // Simulate real-time heart rate variation
    const timer = setInterval(() => {
      setVitals(prev => ({
        ...prev,
        heartRate: prev.heartRate + (Math.random() > 0.5 ? 1 : -1)
      }));
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    api.get("/api/user/stress-config").then(r=>{if(r.data)setForm(f=>({...f,...r.data}));}).catch(()=>{});
    api.get("/user/test/attempts").then(r=>{
      const data = r.data || [];
      setAttempts(data);
      // Load behavioral summary for the most recent session
      const sorted = [...data].sort((a,b)=>new Date(b.attemptedAt)-new Date(a.attemptedAt));
      const latestSessionId = sorted[0]?.sessionId || sorted[0]?.id;
      if (latestSessionId) {
        api.get(`/api/user/behavior/summary/${latestSessionId}`)
          .then(res => { if(res.data && !res.data.message) setBehaviorSummary(res.data); })
          .catch(()=>{});
      }
    }).catch(()=>{});

    // Fetch wellbeing history
    const userId = localStorage.getItem("userId");
    if(userId) {
      api.get(`/wellbeing/history/${userId}`).then(res => {
        if(res.data && res.data.length > 0) {
          const last = res.data[0];
          setLastSync(new Date(last.recordedAt).toLocaleString());
          setWatchAdvice(last.aiRecommendation);
          setVitals(v => ({...v, heartRate: last.heartRate, stressLevel: last.stressLevel, steps: last.steps}));
        }
      }).catch(()=>{});
    }
  }, []);

  const handleWatchSync = async () => {
    setIsSyncing(true);
    const userId = localStorage.getItem("userId");
    try {
      const payload = { ...vitals, deviceModel: "Mega Watch Pro", deviceId: "MW-77" };
      const res = await api.post(`/wellbeing/sync/${userId}`, payload);
      setLastSync(new Date().toLocaleTimeString());
      setWatchAdvice(res.data.aiRecommendation);
      setCfgSaved(true); setTimeout(()=>setCfgSaved(false), 2000);
    } catch (err) { console.error("Sync failed", err); }
    setIsSyncing(false);
  };

  useEffect(() => {
    if (!breathing) { clearInterval(bRef.current); return; }
    setBTimer(BREATH_STEPS[bStep].dur);
    const iv = setInterval(() => setBTimer(t=>{
      if (t<=1){
        clearInterval(iv);
        const next=(bStep+1)%3;
        setBStep(next);
        if(next===0)setBCycles(c=>c+1);
        return 0;
      }
      return t-1;
    }),1000);
    bRef.current=iv;
    return ()=>clearInterval(iv);
  },[breathing,bStep]);

  // Wellbeing score — uses REAL behavioral data if available, otherwise falls back to score-based
  const wellbeing = (() => {
    if(!attempts.length && !lastSync) return{label:"No data yet",color:"#94a3b8",bg:"#f8fafc",score:50,icon:"❓",source:"none"};

    const sorted=[...attempts].sort((a,b)=>new Date(b.attemptedAt)-new Date(a.attemptedAt));
    const daysAgo = sorted.length ? Math.floor((Date.now()-new Date(sorted[0].attemptedAt))/86400000) : 0;

    let baseScore = 70;
    let source = "estimate";

    if (behaviorSummary) {
      const { avgTimePerQuestion=0, totalOptionChanges=0, totalRevisits=0, accuracy=60, totalQuestions=1 } = behaviorSummary;
      const longTimeStress     = avgTimePerQuestion > (form.longTimeThresholdSeconds || 90) ? 25 : 0;
      const indecisionStress   = Math.min(form.optionChangeStressCap || 16, totalOptionChanges) / (form.optionChangeStressCap || 16) * 20;
      const revisitStress      = Math.min(totalRevisits / Math.max(1,totalQuestions), 0.5) * 20;
      baseScore = 85 - longTimeStress - indecisionStress - revisitStress;
      source = "real";
    }

    // Include Physical Data from Watch
    if (lastSync) {
       const healthPenalty = vitals.stressLevel > 60 ? 20 : vitals.heartRate > 100 ? 10 : 0;
       baseScore -= healthPenalty;
       source = behaviorSummary ? "multi" : "watch";
    }

    const accuracyBonus      = (behaviorSummary?.accuracy || 60) > 70 ? 10 : (behaviorSummary?.accuracy || 60) < 40 ? -10 : 0;
    const inactivityPenalty  = daysAgo > 7 ? 15 : 0;
    
    let score = baseScore + accuracyBonus - inactivityPenalty;
    score = Math.min(100, Math.max(0, Math.round(score)));

    if(score>=75) return{label:"Excellent — You're in Peak Focus 🌟",color:"#10b981",bg:"#f0fdf4",score,icon:"🌟",source};
    if(score>=50) return{label:"Stable — Good for Deep Study 💚",color:"#6366f1",bg:"#f5f3ff",score,icon:"💚",source};
    if(score>=30) return{label:"Moderate Stress — Take a break 💛",color:"#f59e0b",bg:"#fffbeb",score,icon:"💛",source};
    return{label:"High Stress — Burnout Risk Detected",color:"#ef4444",bg:"#fff1f2",score,icon:"❤️‍🩹",source};
  })();

  const saveConfig = async()=>{
    setSavingCfg(true);
    try{await api.post("/api/user/stress-config",form);setCfgSaved(true);setTimeout(()=>setCfgSaved(false),2500);}catch(_){}
    setSavingCfg(false);
  };

  const toggleCalmMode=()=>{ const n=!calmMode; setCalmMode(n); localStorage.setItem("calmMode",String(n)); };
  const curStep=BREATH_STEPS[bStep];

  return (
    <UserLayout>
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800;900&display=swap');
          @keyframes fadeUp{from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:translateY(0);}}
          .wb-ey{display:inline-flex;align-items:center;gap:6px;font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#10b981;background:rgba(16,185,129,.09);border:1px solid rgba(16,185,129,.25);border-radius:20px;padding:4px 12px;margin-bottom:10px;}
          .wb-ey::before{content:'';width:5px;height:5px;border-radius:50%;background:#10b981;}
          .wb-title{font-family:'Plus Jakarta Sans',sans-serif;font-size:26px;font-weight:900;letter-spacing:-.03em;color:#1e1b4b;margin-bottom:4px;}
          .wb-sub{font-size:14px;color:rgba(16,185,129,.5);margin-bottom:28px;}
          .wb-card{background:rgba(255,255,255,.9);border:1.5px solid rgba(99,102,241,.1);border-radius:18px;padding:22px 24px;margin-bottom:18px;animation:fadeUp .4s ease both;}
          .wb-ct{font-size:14.5px;font-weight:700;color:#1e1b4b;margin-bottom:14px;}
          .wb-bc{width:130px;height:130px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-direction:column;cursor:pointer;border:3px solid currentColor;transition:transform .6s ease,background .5s;}
          .wb-cfg{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
          @media(max-width:600px){.wb-cfg{grid-template-columns:1fr;}}
          .wb-lbl{font-size:10px;font-weight:700;color:rgba(99,102,241,.45);text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px;}
          .wb-inp{padding:8px 12px;border:1.5px solid rgba(99,102,241,.2);border-radius:10px;font-size:14px;width:100%;outline:none;font-weight:600;color:#1e1b4b;}
          .wb-inp:focus{border-color:#6366f1;}
          .wb-btn{display:inline-flex;align-items:center;gap:7px;padding:9px 18px;border-radius:12px;font-size:13px;font-weight:700;border:none;cursor:pointer;transition:all .2s;}
        `}</style>

        <div className="wb-ey">💚 Wellbeing Monitoring</div>
        <h2 className="wb-title">Your Wellbeing Dashboard</h2>
        <p className="wb-sub">Mental health matters as much as your scores</p>

        {/* Status */}
        <div className="wb-card" style={{background:wellbeing.bg,borderColor:wellbeing.color+"40"}}>
          <div style={{display:"flex",alignItems:"center",gap:18,flexWrap:"wrap"}}>
            <div style={{width:60,height:60,borderRadius:"50%",background:wellbeing.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,boxShadow:`0 0 24px ${wellbeing.color}40`,flexShrink:0}}>{wellbeing.icon}</div>
            <div style={{flex:1}}>
              <div style={{fontSize:17,fontWeight:800,color:wellbeing.color}}>{wellbeing.label}</div>
              {/* Data source indicator */}
              <div style={{display:"inline-flex",alignItems:"center",gap:5,marginTop:6,fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:".06em",
                color:wellbeing.source==="multi"?"#10b981":wellbeing.source==="watch"?"#6366f1":"#94a3b8",
                background:wellbeing.source==="multi"?"rgba(16,185,129,.1)":"rgba(99,102,241,.1)",
                border:`1px solid ${wellbeing.source==="multi"?"rgba(16,185,129,.3)":"rgba(99,102,241,.2)"}`,
                borderRadius:20,padding:"2px 8px"}}>
                {wellbeing.source==="multi"?"🧬 Multi-Source Insight (Behavior + Watch)":wellbeing.source==="watch"?"⌚ Wearable Data Live":"🟡 Score Estimate"}
              </div>
              <div style={{height:8,borderRadius:8,background:"rgba(0,0,0,.06)",overflow:"hidden",maxWidth:200,marginTop:8}}>
                <div style={{height:"100%",borderRadius:8,background:wellbeing.color,width:`${wellbeing.score}%`,transition:"width 1s ease"}}/>
              </div>
              <div style={{fontSize:12,color:wellbeing.color,fontWeight:700,marginTop:4}}>{wellbeing.score}/100 wellbeing score</div>
              {/* Real behavioral breakdown */}
              {behaviorSummary && (
                <div style={{display:"flex",gap:12,marginTop:10,flexWrap:"wrap"}}>
                  {[
                    {label:"Avg Time/Q",   value:`${behaviorSummary.avgTimePerQuestion}s`, warn: behaviorSummary.avgTimePerQuestion > 60},
                    {label:"Option Changes",value:behaviorSummary.totalOptionChanges,       warn: behaviorSummary.totalOptionChanges > 5},
                    {label:"Revisits",     value:behaviorSummary.totalRevisits,             warn: behaviorSummary.totalRevisits > 3},
                    {label:"Accuracy",     value:`${behaviorSummary.accuracy}%`,            warn: behaviorSummary.accuracy < 50},
                  ].map((m,i)=>(
                    <div key={i} style={{textAlign:"center",background:m.warn?"rgba(239,68,68,.08)":"rgba(16,185,129,.08)",
                      border:`1px solid ${m.warn?"rgba(239,68,68,.2)":"rgba(16,185,129,.2)"}`,borderRadius:8,padding:"4px 10px",minWidth:60}}>
                      <div style={{fontSize:13,fontWeight:900,color:m.warn?"#ef4444":"#10b981"}}>{m.value}</div>
                      <div style={{fontSize:9,color:"rgba(30,27,75,.4)",fontWeight:700,textTransform:"uppercase"}}>{m.label}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button onClick={toggleCalmMode} className="wb-btn"
              style={{background:calmMode?"#dcfce7":"#eef2ff",color:calmMode?"#16a34a":"#6366f1"}}>
              {calmMode?"🟢 Calm Mode ON":"⚡ Calm Mode OFF"}
            </button>
          </div>
        </div>

        {/* SMART WATCH INTEGRATION SECTION */}
        <div className="wb-card" style={{borderLeft:`6px solid #6366f1`}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
             <div className="wb-ct" style={{marginBottom:0}}>⌚ My Smart Watch</div>
             <div style={{fontSize:10,fontWeight:900,color:"#6366f1",background:"#eef2ff",padding:"2px 8px",borderRadius:10}}>LIVE CONNECTED</div>
          </div>
          <div style={{display:"flex",gap:24,alignItems:"center",flexWrap:"wrap"}}>
             <div style={{width:100,height:100,borderRadius:"50%",background:"#0f172a",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",border:"4px solid #334155",boxShadow:"0 10px 20px rgba(0,0,0,0.1)"}}>
                <div style={{color:"#ef4444",fontSize:12,animation:"pulse 1s infinite"}}>❤️</div>
                <div style={{color:"#fff",fontSize:22,fontWeight:900}}>{vitals.heartRate}</div>
                <div style={{color:"#94a3b8",fontSize:8,fontWeight:700}}>BPM</div>
             </div>
             <div style={{flex:1}}>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(80px, 1fr))",gap:10}}>
                   <div style={{background:"#f8fafc",padding:8,borderRadius:12,textAlign:"center"}}>
                      <div style={{fontSize:14,fontWeight:900,color:"#1e1b4b"}}>{vitals.stressLevel}%</div>
                      <div style={{fontSize:8,fontWeight:700,color:"#94a3b8"}}>STRESS</div>
                   </div>
                   <div style={{background:"#f8fafc",padding:8,borderRadius:12,textAlign:"center"}}>
                      <div style={{fontSize:14,fontWeight:900,color:"#1e1b4b"}}>{vitals.steps}</div>
                      <div style={{fontSize:8,fontWeight:700,color:"#94a3b8"}}>STEPS</div>
                   </div>
                   <div style={{background:"#f8fafc",padding:8,borderRadius:12,textAlign:"center"}}>
                      <div style={{fontSize:14,fontWeight:900,color:"#1e1b4b"}}>{vitals.oxygenLevels}%</div>
                      <div style={{fontSize:8,fontWeight:700,color:"#94a3b8"}}>SPO2</div>
                   </div>
                </div>
                {watchAdvice && (
                  <div style={{marginTop:12,background:"#eff6ff",padding:10,borderRadius:12,border:"1px inset rgba(99,102,241,.1)"}}>
                     <div style={{fontSize:9,fontWeight:900,color:"#3b82f6",marginBottom:2}}>AI COACHING INSIGHT</div>
                     <div style={{fontSize:11,fontWeight:700,color:"#1e3a8a"}}>{watchAdvice}</div>
                  </div>
                )}
             </div>
             <div style={{textAlign:"center"}}>
                <button onClick={handleWatchSync} disabled={isSyncing} className="wb-btn" style={{background:"#6366f1",color:"white",width:"100%"}}>
                   {isSyncing ? "Syncing..." : "Sync Watch"}
                </button>
                {lastSync && <div style={{fontSize:9,color:"#94a3b8",marginTop:5,fontWeight:700}}>LAST SYNC: {lastSync}</div>}
             </div>
          </div>
        </div>

        {/* GOOGLE FIT PROMO */}
        <div style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.06), rgba(14,165,233,0.06))', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 20, padding: '16px 20px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
           <div>
              <div style={{ fontSize: 13, fontWeight: 900, color: '#10b981', display: 'flex', alignItems: 'center', gap: 6 }}>
                 <Watch size={16} /> ⚡ Pro Sync with Google Fit
              </div>
              <p style={{ fontSize: 11, color: '#64748b', fontWeight: 600, marginTop: 2 }}>Sync steps, heart rate & sleep automatically from your real Smart Watch.</p>
           </div>
           <button onClick={() => window.location.href='/google-fit'} className="wb-btn" style={{ background: '#10b981', color: 'white', padding: '8px 16px' }}>
              Connect Now
           </button>
        </div>

        {/* Breathing */}
        <div className="wb-card">
          <div className="wb-ct">🫁 4-7-8 Breathing Exercise</div>
          <div style={{display:"flex",gap:24,alignItems:"center",flexWrap:"wrap"}}>
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:12}}>
              <div className="wb-bc"
                style={{color:breathing?curStep.color:"#6366f1",transform:`scale(${breathing?curStep.scale:1})`,background:breathing?`${curStep.color}10`:"rgba(99,102,241,.05)"}}
                onClick={()=>{if(!breathing){setBStep(0);setBTimer(BREATH_STEPS[0].dur);setBCycles(0);}setBreathing(b=>!b);}}>
                <div style={{fontSize:24}}>{!breathing?"▶":bStep===0?"😮":"😤"}</div>
                <div style={{fontSize:13,fontWeight:800,color:breathing?curStep.color:"#6366f1"}}>{!breathing?"Start":curStep.label}</div>
                {breathing&&<div style={{fontSize:24,fontWeight:900,fontFamily:"monospace",color:curStep.color}}>{bTimer}s</div>}
              </div>
              {bCycles>0&&<div style={{fontSize:12,color:"#10b981",fontWeight:700}}>✓ {bCycles} cycle{bCycles>1?"s":""} done!</div>}
            </div>
            <div style={{flex:1,minWidth:180}}>
              {BREATH_STEPS.map((s,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                  <div style={{width:30,height:30,borderRadius:"50%",background:`${s.color}15`,border:`2px solid ${s.color}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:900,color:s.color,flexShrink:0}}>{s.dur}s</div>
                  <div style={{fontSize:13,fontWeight:700,color:s.color}}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tips */}
        <div style={{background:"rgba(238,242,255,.7)",border:"1.5px solid rgba(99,102,241,.12)",borderRadius:16,padding:"18px 20px",marginBottom:18}}>
          <div style={{fontSize:11,fontWeight:700,color:"rgba(99,102,241,.4)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:8}}>💡 Wellbeing Tip</div>
          <div style={{fontSize:15,fontWeight:600,color:"#1e1b4b"}}><span style={{fontSize:20,marginRight:8}}>{TIPS[tipIdx].icon}</span>{TIPS[tipIdx].tip}</div>
          <button onClick={()=>setTipIdx(i=>(i+1)%TIPS.length)} className="wb-btn" style={{background:"#eef2ff",color:"#6366f1",marginTop:12,padding:"6px 14px",fontSize:12}}>Next tip →</button>
        </div>

        {/* Stress config */}
        <div className="wb-card">
          <div className="wb-ct">⚙️ Stress Detection Settings</div>
          <div className="wb-cfg">
            {Object.entries(form).filter(([k])=>!["id","userId"].includes(k)).map(([key,val])=>(
              <div key={key}>
                <div className="wb-lbl">{key.replace(/([A-Z])/g," $1").toLowerCase()}</div>
                <input type="number" value={val} className="wb-inp"
                  onChange={e=>setForm(f=>({...f,[key]:Number(e.target.value)}))}/>
              </div>
            ))}
          </div>
          <div style={{marginTop:16,display:"flex",alignItems:"center",gap:12}}>
            <button onClick={saveConfig} disabled={savingCfg} className="wb-btn" style={{background:"#6366f1",color:"white"}}>
              {savingCfg?"Saving...":"💾 Save Settings"}
            </button>
            {cfgSaved&&<span style={{color:"#10b981",fontWeight:700,fontSize:13}}>✓ Saved!</span>}
          </div>
        </div>
      </>
    </UserLayout>
  );
}
