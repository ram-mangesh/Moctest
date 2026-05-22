import { useEffect, useState } from "react";
import api from "../../Api/axios";
import { useNavigate } from "react-router-dom";

/* ================================================================
   WELLBEING WIDGET — Compact card shown on Home page
================================================================ */

export default function WellbeingWidget() {
  const [attempts, setAttempts] = useState([]);
  const [dismissed, setDismissed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/user/test/attempts").then(r=>setAttempts(r.data||[])).catch(()=>{});
  }, []);

  if (dismissed) return null;

  const sorted = [...attempts].sort((a,b)=>new Date(b.attemptedAt)-new Date(a.attemptedAt));
  const recent = sorted.slice(0,5);
  const avgRecent = recent.length ? recent.reduce((s,a)=>s+a.scorePercent,0)/recent.length : 60;
  const daysAgo = sorted.length ? Math.floor((Date.now()-new Date(sorted[0].attemptedAt))/86400000) : 0;
  let score = 60+(avgRecent>70?20:avgRecent<40?-20:0)-(daysAgo>7?20:0);
  score = Math.min(100,Math.max(0,score));
  const status = score>=70?"good":score>=40?"moderate":"high";
  const cfg = {
    good:    { icon:"🌟", label:"You're doing great!",       color:"#10b981", bg:"linear-gradient(135deg,#f0fdf4,#dcfce7)", border:"rgba(16,185,129,.25)" },
    moderate:{ icon:"💛", label:"Take a short break today",  color:"#f59e0b", bg:"linear-gradient(135deg,#fffbeb,#fef9c3)", border:"rgba(245,158,11,.25)" },
    high:    { icon:"❤️‍🩹", label:"High stress detected — rest needed",color:"#ef4444",bg:"linear-gradient(135deg,#fff1f2,#fee2e2)",border:"rgba(239,68,68,.25)" },
  }[status];

  return (
    <div style={{background:cfg.bg,border:`1.5px solid ${cfg.border}`,borderRadius:16,padding:"14px 18px",marginBottom:22,display:"flex",alignItems:"center",gap:14,animation:"fadeUp .4s ease both",flexWrap:"wrap"}}>
      <div style={{fontSize:28,flexShrink:0}}>{cfg.icon}</div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontSize:13,fontWeight:800,color:cfg.color}}>{cfg.label}</div>
        <div style={{fontSize:11,color:"rgba(30,27,75,.4)",marginTop:2}}>Wellbeing score: {score}/100</div>
      </div>
      <button onClick={()=>navigate("/wellbeing")}
        style={{fontSize:12,fontWeight:700,color:cfg.color,background:"rgba(255,255,255,.7)",border:`1px solid ${cfg.border}`,borderRadius:10,padding:"6px 14px",cursor:"pointer",whiteSpace:"nowrap"}}>
        View Details →
      </button>
      <button onClick={()=>setDismissed(true)}
        style={{fontSize:16,color:"rgba(30,27,75,.25)",background:"none",border:"none",cursor:"pointer",padding:"0 4px",flexShrink:0}}>×</button>
    </div>
  );
}
