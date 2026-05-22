import { useState, useEffect, useCallback } from "react";
import api from "../Api/axios";

/* ================================================================
   STUDENT INSIGHTS — Admin panel for monitoring student performance
   ▸ Search students
   ▸ Per-student attempt history with scores & trends
   ▸ Weak topic detection
   ▸ Wellbeing risk indicator
   ▸ Question-level drill-down review
================================================================ */

export default function StudentInsights() {
  const [search, setSearch]         = useState("");
  const [students, setStudents]     = useState([]);
  const [loading, setLoading]       = useState(false);
  const [selected, setSelected]     = useState(null);   // { id, name, email }
  const [attempts, setAttempts]     = useState([]);
  const [attLoading, setAttLoading] = useState(false);
  const [reviewAttemptId, setReviewAttemptId] = useState(null);
  const [reviewData, setReviewData] = useState([]);
  const [reviewLoading, setReviewLoading]     = useState(false);

  /* ── Search students ────────────────────────── */
  const doSearch = useCallback(async (q) => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/students/search?name=${encodeURIComponent(q)}`);
      setStudents(res.data || []);
    } catch { setStudents([]); }
    setLoading(false);
  }, []);

  useEffect(() => {
    doSearch("");  // load all students on mount
  }, [doSearch]);

  const handleSearch = (v) => { setSearch(v); doSearch(v); };

  /* ── Select student → load attempts ────────── */
  const selectStudent = async (stu) => {
    setSelected(stu);
    setAttempts([]);
    setReviewAttemptId(null);
    setReviewData([]);
    setAttLoading(true);
    try {
      const res = await api.get(`/admin/students/${stu.id}/attempts`);
      setAttempts(res.data || []);
    } catch { setAttempts([]); }
    setAttLoading(false);
  };

  /* ── Review an attempt ─────────────────────── */
  const openReview = async (attemptId) => {
    if (reviewAttemptId === attemptId) { setReviewAttemptId(null); return; }
    setReviewAttemptId(attemptId);
    setReviewLoading(true);
    try {
      const res = await api.get(`/admin/students/attempts/${attemptId}/review`);
      setReviewData(res.data || []);
    } catch { setReviewData([]); }
    setReviewLoading(false);
  };

  /* ── Derived stats ──────────────────────────── */
  const avgScore = attempts.length
    ? Math.round(attempts.reduce((s, a) => s + a.scorePercent, 0) / attempts.length) : 0;

  const topicMap = {};
  attempts.forEach(a => {
    const k = a.topicName || "Unknown";
    if (!topicMap[k]) topicMap[k] = { total: 0, scoreSum: 0 };
    topicMap[k].total++;
    topicMap[k].scoreSum += a.scorePercent;
  });
  const topicStats = Object.entries(topicMap)
    .map(([name, d]) => ({ name, avg: Math.round(d.scoreSum / d.total), count: d.total }))
    .sort((a, b) => a.avg - b.avg);
  const weakTopics = topicStats.filter(t => t.avg < 50);

  // simple wellbeing risk
  const sorted = [...attempts].sort((a, b) => new Date(b.attemptedAt) - new Date(a.attemptedAt));
  const recent5 = sorted.slice(0, 5);
  const recent5Avg = recent5.length ? Math.round(recent5.reduce((s, a) => s + a.scorePercent, 0) / recent5.length) : 0;
  const daysInactive = sorted.length ? Math.floor((Date.now() - new Date(sorted[0].attemptedAt)) / 86400000) : 999;
  const riskLevel = (recent5Avg < 40 || daysInactive > 14) ? "high" : (recent5Avg < 60 || daysInactive > 7) ? "moderate" : "low";
  const riskCfg = {
    low:      { icon: "🟢", label: "Low Risk",      color: "#10b981", bg: "#f0fdf4" },
    moderate: { icon: "🟡", label: "Moderate Risk",  color: "#f59e0b", bg: "#fffbeb" },
    high:     { icon: "🔴", label: "High Risk",      color: "#ef4444", bg: "#fff1f2" },
  }[riskLevel];

  // streak
  const streakCount = (() => {
    if (!sorted.length) return 0;
    let streak = 0;
    const today = new Date(); today.setHours(0,0,0,0);
    for (let i = 0; i < sorted.length; i++) {
      const d = new Date(sorted[i].attemptedAt); d.setHours(0,0,0,0);
      const diff = Math.floor((today - d) / 86400000);
      if (diff <= streak + 1) streak = diff + 1;
      else break;
    }
    return streak;
  })();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800;900&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);}}
        @keyframes barGrow{from{width:0!important;}}
        .si-ey{display:inline-flex;align-items:center;gap:6px;font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#2563eb;background:rgba(37,99,235,.09);border:1px solid rgba(37,99,235,.18);border-radius:20px;padding:4px 12px;margin-bottom:10px;}
        .si-ey::before{content:'';width:5px;height:5px;border-radius:50%;background:#2563eb;}
        .si-title{font-family:'Plus Jakarta Sans',sans-serif;font-size:24px;font-weight:900;letter-spacing:-.03em;color:#0f172a;margin-bottom:4px;}
        .si-sub{font-size:13px;color:rgba(37,99,235,.45);margin-bottom:22px;}
        .si-searchbox{display:flex;align-items:center;gap:10px;background:rgba(255,255,255,.9);border:1.5px solid rgba(37,99,235,.15);border-radius:14px;padding:10px 16px;margin-bottom:18px;transition:all .2s;}
        .si-searchbox:focus-within{border-color:#2563eb;box-shadow:0 0 0 3px rgba(37,99,235,.1);}
        .si-searchbox input{border:none;outline:none;background:transparent;font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;color:#0f172a;width:100%;}
        .si-searchbox input::placeholder{color:rgba(37,99,235,.3);}
        .si-list{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:10px;margin-bottom:24px;}
        .si-stu{background:rgba(255,255,255,.9);border:1.5px solid rgba(37,99,235,.1);border-radius:14px;padding:14px 16px;cursor:pointer;transition:all .2s;animation:fadeUp .35s ease both;}
        .si-stu:hover{transform:translateY(-2px);box-shadow:0 6px 24px rgba(37,99,235,.12);border-color:rgba(37,99,235,.25);}
        .si-stu.active{border-color:#2563eb;background:rgba(37,99,235,.06);box-shadow:0 4px 20px rgba(37,99,235,.15);}
        .si-stu-name{font-size:14px;font-weight:800;color:#0f172a;margin-bottom:2px;}
        .si-stu-email{font-size:11px;color:rgba(37,99,235,.4);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
        .si-panel{background:rgba(255,255,255,.92);border:1.5px solid rgba(37,99,235,.1);border-radius:18px;padding:22px 24px;margin-bottom:18px;animation:fadeUp .35s ease both;}
        .si-panel-title{font-size:15px;font-weight:800;color:#0f172a;margin-bottom:14px;display:flex;align-items:center;gap:8px;}
        .si-stat-row{display:flex;gap:12px;margin-bottom:18px;flex-wrap:wrap;}
        .si-stat{border-radius:14px;padding:12px 16px;min-width:110;flex:1;}
        .si-stat-val{font-size:22px;font-weight:900;}
        .si-stat-lbl{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;opacity:.6;margin-top:2px;}
        .si-att-row{display:flex;align-items:center;gap:12px;padding:10px 14px;background:rgba(237,240,255,.5);border:1px solid rgba(37,99,235,.08);border-radius:12px;margin-bottom:8px;cursor:pointer;transition:all .2s;}
        .si-att-row:hover{background:rgba(37,99,235,.06);transform:translateX(4px);}
        .si-att-row.open{background:rgba(37,99,235,.08);border-color:rgba(37,99,235,.2);}
        .si-bar{height:6px;border-radius:6px;background:rgba(37,99,235,.08);overflow:hidden;flex:1;max-width:120px;}
        .si-bar-fill{height:100%;border-radius:6px;animation:barGrow .8s ease;}
        .si-rev-card{background:rgba(255,255,255,.95);border:1px solid rgba(37,99,235,.1);border-radius:12px;padding:12px 14px;margin:6px 0;animation:fadeUp .3s ease both;}
        .si-empty{text-align:center;padding:40px;color:rgba(37,99,235,.35);font-size:14px;font-weight:600;}
        .si-back{background:none;border:1.5px solid rgba(37,99,235,.2);border-radius:10px;padding:6px 14px;font-size:12px;font-weight:700;color:#2563eb;cursor:pointer;margin-bottom:14px;transition:all .2s;}
        .si-back:hover{background:rgba(37,99,235,.06);}
      `}</style>

      <div className="si-ey">👨‍🎓 Student Insights</div>
      <h2 className="si-title">Student Performance Monitor</h2>
      <p className="si-sub">Search and analyze individual student performance, identify weak topics, and monitor wellbeing risks</p>

      {/* ── SEARCH ── */}
      <div className="si-searchbox">
        <span style={{fontSize:16,flexShrink:0}}>🔍</span>
        <input value={search} onChange={e=>handleSearch(e.target.value)}
          placeholder="Search students by name..." />
        {search && <button onClick={()=>handleSearch("")} style={{background:"none",border:"none",fontSize:16,color:"rgba(37,99,235,.4)",cursor:"pointer"}}>×</button>}
      </div>

      {/* ── STUDENT LIST ── */}
      {!selected && (
        <>
          {loading && <div className="si-empty">⏳ Loading students...</div>}
          {!loading && students.length === 0 && (
            <div className="si-empty">No students found</div>
          )}
          <div className="si-list">
            {students.map((s,i)=>(
              <div key={s.id} className="si-stu" style={{animationDelay:`${i*.04}s`}}
                onClick={()=>selectStudent(s)}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{width:36,height:36,borderRadius:"50%",background:"linear-gradient(135deg,#2563eb,#0d9488)",color:"white",fontSize:14,fontWeight:900,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    {s.name?.charAt(0)?.toUpperCase()||"?"}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div className="si-stu-name">{s.name}</div>
                    <div className="si-stu-email">{s.email}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── SELECTED STUDENT DETAIL ── */}
      {selected && (
        <>
          <button className="si-back" onClick={()=>{setSelected(null);setAttempts([]);setReviewAttemptId(null);}}>
            ← Back to all students
          </button>

          {/* Student header */}
          <div className="si-panel" style={{background:"linear-gradient(135deg,rgba(37,99,235,.06),rgba(13,148,136,.04))"}}>
            <div style={{display:"flex",alignItems:"center",gap:14,flexWrap:"wrap"}}>
              <div style={{width:50,height:50,borderRadius:"50%",background:"linear-gradient(135deg,#2563eb,#0d9488)",color:"white",fontSize:20,fontWeight:900,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                {selected.name?.charAt(0)?.toUpperCase()||"?"}
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:18,fontWeight:900,color:"#0f172a"}}>{selected.name}</div>
                <div style={{fontSize:12,color:"rgba(37,99,235,.5)"}}>{selected.email}</div>
              </div>
              {attempts.length > 0 && (
                <div style={{display:"flex",alignItems:"center",gap:8,padding:"6px 14px",borderRadius:20,
                  background:riskCfg.bg,border:`1.5px solid ${riskCfg.color}40`}}>
                  <span style={{fontSize:14}}>{riskCfg.icon}</span>
                  <span style={{fontSize:12,fontWeight:800,color:riskCfg.color}}>{riskCfg.label}</span>
                </div>
              )}
            </div>
          </div>

          {attLoading && <div className="si-empty">⏳ Loading attempts...</div>}

          {!attLoading && attempts.length === 0 && (
            <div className="si-empty">📝 This student has no test attempts yet.</div>
          )}

          {!attLoading && attempts.length > 0 && (
            <>
              {/* Stats */}
              <div className="si-stat-row">
                {[
                  {label:"Total Tests", val:attempts.length, color:"#2563eb", bg:"rgba(37,99,235,.06)"},
                  {label:"Avg Score",   val:`${avgScore}%`,  color:avgScore>=60?"#10b981":"#ef4444", bg:avgScore>=60?"#f0fdf4":"#fff1f2"},
                  {label:"Weak Topics", val:weakTopics.length, color:weakTopics.length?"#ef4444":"#10b981", bg:weakTopics.length?"#fff1f2":"#f0fdf4"},
                  {label:"Study Streak",val:`${streakCount}d`, color:"#7c3aed", bg:"rgba(124,58,237,.06)"},
                  {label:"Days Inactive",val:daysInactive > 200 ? "N/A" : `${daysInactive}d`, color:daysInactive>7?"#ef4444":"#10b981", bg:daysInactive>7?"#fff1f2":"#f0fdf4"},
                ].map((s,i)=>(
                  <div key={i} className="si-stat" style={{background:s.bg,border:`1.5px solid ${s.color}25`}}>
                    <div className="si-stat-val" style={{color:s.color}}>{s.val}</div>
                    <div className="si-stat-lbl" style={{color:s.color}}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Weak topics */}
              {weakTopics.length > 0 && (
                <div className="si-panel" style={{borderColor:"rgba(239,68,68,.2)"}}>
                  <div className="si-panel-title" style={{color:"#ef4444"}}>⚠️ Weak Topics (avg &lt; 50%)</div>
                  <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                    {weakTopics.map((t,i)=>(
                      <div key={i} style={{background:"#fff1f2",border:"1.5px solid rgba(239,68,68,.2)",borderRadius:10,padding:"6px 12px"}}>
                        <div style={{fontSize:13,fontWeight:800,color:"#ef4444"}}>{t.name}</div>
                        <div style={{fontSize:11,color:"rgba(239,68,68,.5)"}}>{t.avg}% avg · {t.count} test{t.count>1?"s":""}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Topic breakdown */}
              <div className="si-panel">
                <div className="si-panel-title">📊 Topic Performance Breakdown</div>
                {topicStats.map((t,i)=>{
                  const fillColor = t.avg>=70?"#10b981":t.avg>=50?"#f59e0b":"#ef4444";
                  return (
                    <div key={i} style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
                      <div style={{width:130,fontSize:12,fontWeight:700,color:"#0f172a",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flexShrink:0}}>{t.name}</div>
                      <div style={{flex:1,height:8,borderRadius:8,background:"rgba(37,99,235,.06)",overflow:"hidden"}}>
                        <div style={{height:"100%",borderRadius:8,background:fillColor,width:`${t.avg}%`,animation:"barGrow .8s ease"}}/>
                      </div>
                      <div style={{fontSize:12,fontWeight:800,color:fillColor,minWidth:40,textAlign:"right"}}>{t.avg}%</div>
                      <div style={{fontSize:10,color:"rgba(37,99,235,.35)",minWidth:30}}>{t.count}x</div>
                    </div>
                  );
                })}
              </div>

              {/* Attempt history */}
              <div className="si-panel">
                <div className="si-panel-title">📋 Test Attempt History</div>
                {attempts.map((a,i) => {
                  const fillColor = a.scorePercent>=70?"#10b981":a.scorePercent>=50?"#f59e0b":"#ef4444";
                  const isOpen = reviewAttemptId === a.attemptId;
                  return (
                    <div key={a.attemptId||i}>
                      <div className={`si-att-row${isOpen?" open":""}`} onClick={()=>openReview(a.attemptId)}>
                        <div style={{width:28,height:28,borderRadius:"50%",background:`${fillColor}15`,border:`1.5px solid ${fillColor}40`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:900,color:fillColor,flexShrink:0}}>
                          {i+1}
                        </div>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:13,fontWeight:700,color:"#0f172a",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                            {a.topicName || a.examName || "Test"}
                          </div>
                          <div style={{fontSize:10,color:"rgba(37,99,235,.4)"}}>
                            {a.examName && `${a.examName} › `}{a.subjectName && `${a.subjectName} › `}
                            {new Date(a.attemptedAt).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}
                          </div>
                        </div>
                        <div className="si-bar">
                          <div className="si-bar-fill" style={{width:`${a.scorePercent}%`,background:fillColor}}/>
                        </div>
                        <div style={{fontSize:13,fontWeight:900,color:fillColor,minWidth:40,textAlign:"right"}}>{Math.round(a.scorePercent)}%</div>
                        <div style={{fontSize:11,color:"rgba(37,99,235,.3)"}}>
                          {a.correct}/{a.total}
                        </div>
                        <div style={{fontSize:14,color:"rgba(37,99,235,.3)",transition:"transform .2s",transform:isOpen?"rotate(180deg)":"rotate(0)"}}>▼</div>
                      </div>

                      {/* Question-level review */}
                      {isOpen && (
                        <div style={{padding:"4px 0 8px 40px"}}>
                          {reviewLoading && <div style={{fontSize:12,color:"rgba(37,99,235,.4)",padding:8}}>Loading review...</div>}
                          {!reviewLoading && reviewData.length === 0 && (
                            <div style={{fontSize:12,color:"rgba(37,99,235,.35)",padding:8}}>No question data available</div>
                          )}
                          {!reviewLoading && reviewData.map((q, qi) => {
                            const isCorrect = q.correct;
                            return (
                              <div key={qi} className="si-rev-card" style={{animationDelay:`${qi*.03}s`,borderLeft:`3px solid ${isCorrect?"#10b981":"#ef4444"}`}}>
                                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
                                  <div style={{fontSize:13,fontWeight:600,color:"#0f172a",flex:1}}>
                                    <span style={{fontWeight:800,color:isCorrect?"#10b981":"#ef4444",marginRight:6}}>Q{q.questionNumber}</span>
                                    {q.questionText}
                                  </div>
                                  <span style={{fontSize:10,fontWeight:800,padding:"2px 8px",borderRadius:20,flexShrink:0,
                                    background:isCorrect?"#dcfce7":"#fee2e2",color:isCorrect?"#16a34a":"#dc2626"}}>
                                    {isCorrect ? "✓ Correct" : "✗ Wrong"}
                                  </span>
                                </div>
                                {q.type === "MCQ" && (
                                  <div style={{fontSize:11,color:"rgba(0,0,0,.5)",marginTop:6}}>
                                    {q.studentSelected && <span>Student: <strong style={{color:isCorrect?"#16a34a":"#dc2626"}}>{q.studentSelected}</strong> · </span>}
                                    Correct: <strong style={{color:"#16a34a"}}>{q.correctAnswer}</strong>
                                  </div>
                                )}
                                {q.type === "MULTI" && (
                                  <div style={{fontSize:11,color:"rgba(0,0,0,.5)",marginTop:6}}>
                                    {q.studentSelectedMultiple?.length > 0 && <span>Student: <strong style={{color:isCorrect?"#16a34a":"#dc2626"}}>{q.studentSelectedMultiple.join(", ")}</strong> · </span>}
                                    Correct: <strong style={{color:"#16a34a"}}>{q.correctAnswerMultiple?.join(", ")}</strong>
                                  </div>
                                )}
                                {q.type === "NAQ" && (
                                  <div style={{fontSize:11,color:"rgba(0,0,0,.5)",marginTop:6}}>
                                    {q.studentNumeric != null && <span>Student: <strong style={{color:isCorrect?"#16a34a":"#dc2626"}}>{q.studentNumeric}</strong> · </span>}
                                    Correct: <strong style={{color:"#16a34a"}}>{q.correctNumeric}</strong>
                                    {q.tolerance != null && <span> (±{q.tolerance})</span>}
                                  </div>
                                )}
                                {q.difficulty && (
                                  <span style={{fontSize:9,fontWeight:700,marginTop:6,display:"inline-block",padding:"2px 6px",borderRadius:10,
                                    background:q.difficulty==="EASY"?"#dcfce7":q.difficulty==="DIFFICULT"?"#fee2e2":"#fef9c3",
                                    color:q.difficulty==="EASY"?"#16a34a":q.difficulty==="DIFFICULT"?"#dc2626":"#ca8a04"}}>
                                    {q.difficulty}
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </>
      )}
    </>
  );
}
