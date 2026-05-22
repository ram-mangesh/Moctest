import { useState } from "react";
import api from "../../Api/axios";

/* ─── day type config ─── */
const DAY_TYPES = {
  study:    { grad:"linear-gradient(135deg,rgba(99,102,241,.08),rgba(139,92,246,.05))",  border:"rgba(99,102,241,.18)",  badgeBg:"rgba(99,102,241,.1)",   badgeColor:"#4f46e5", icon:"📚", label:"Study"    },
  practice: { grad:"linear-gradient(135deg,rgba(124,58,237,.08),rgba(168,85,247,.05))", border:"rgba(124,58,237,.18)",  badgeBg:"rgba(124,58,237,.1)",  badgeColor:"#7c3aed", icon:"✏️", label:"Practice" },
  revision: { grad:"linear-gradient(135deg,rgba(5,150,105,.08),rgba(16,185,129,.05))",  border:"rgba(5,150,105,.18)",   badgeBg:"rgba(5,150,105,.1)",   badgeColor:"#059669", icon:"🔄", label:"Revision" },
  rest:     { grad:"linear-gradient(135deg,rgba(148,163,184,.06),rgba(203,213,225,.04))",border:"rgba(148,163,184,.18)",badgeBg:"rgba(148,163,184,.1)",badgeColor:"#64748b", icon:"😴", label:"Rest"     },
  exam:     { grad:"linear-gradient(135deg,rgba(239,68,68,.08),rgba(252,165,165,.05))", border:"rgba(239,68,68,.22)",   badgeBg:"rgba(239,68,68,.1)",   badgeColor:"#dc2626", icon:"🎯", label:"Exam Day" },
};

/* ─── CSS ─── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,400&display=swap');

*, *::before, *::after { box-sizing: border-box; }

:root {
  --sp-glass:  rgba(255,255,255,.84);
  --sp-glass2: rgba(255,255,255,.68);
  --sp-border: rgba(99,102,241,.14);
  --sp-ink:    #1a1740;
  --sp-ink2:   rgba(67,56,202,.65);
  --sp-ink3:   rgba(99,102,241,.42);
  --sp-a:      #4f46e5;
  --sp-grad:   linear-gradient(135deg,#4f46e5 0%,#7c3aed 55%,#0284c7 100%);
  --sp-sh:     0 6px 32px rgba(99,102,241,.12),inset 0 1px 0 rgba(255,255,255,.95);
  --sp-sh2:    0 12px 48px rgba(99,102,241,.16),inset 0 1px 0 rgba(255,255,255,.98);
}

@keyframes sp_up     { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
@keyframes sp_pop    { from{opacity:0;transform:scale(.96)}       to{opacity:1;transform:scale(1)} }
@keyframes sp_shimmer{ 0%{background-position:-250% 0} 100%{background-position:250% 0} }
@keyframes sp_spin   { to{transform:rotate(360deg)} }
@keyframes sp_prog   { from{width:0} }
@keyframes sp_orb1   { 0%{transform:translate(0,0)scale(1)} 100%{transform:translate(48px,64px)scale(1.08)} }
@keyframes sp_orb2   { 0%{transform:translate(0,0)scale(1)} 100%{transform:translate(-40px,50px)scale(1.06)} }
@keyframes sp_float  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
@keyframes sp_check  { 0%{transform:scale(0)} 60%{transform:scale(1.15)} 100%{transform:scale(1)} }

/* ── page root ── */
.sp-root {
  font-family:'Plus Jakarta Sans',sans-serif;
  min-height:100vh;
  color:var(--sp-ink);
  position:relative;
}

/* ── bg ── */
.sp-bg { position:fixed;inset:0;pointer-events:none;z-index:0;overflow:hidden; }
.sp-orb { position:absolute;border-radius:50%;filter:blur(72px); }
.sp-orb1 { width:520px;height:520px;top:-160px;left:-100px; background:radial-gradient(circle,rgba(99,102,241,.17)0%,transparent 65%); animation:sp_orb1 22s ease-in-out infinite alternate; }
.sp-orb2 { width:440px;height:440px;bottom:-100px;right:-80px; background:radial-gradient(circle,rgba(168,85,247,.13)0%,transparent 65%); animation:sp_orb2 26s ease-in-out infinite alternate 5s; }
.sp-orb3 { width:300px;height:300px;top:38%;left:42%; background:radial-gradient(circle,rgba(236,72,153,.08)0%,transparent 65%); animation:sp_orb1 18s ease-in-out infinite alternate 9s; }
.sp-dotgrid { position:absolute;inset:0;background-image:radial-gradient(circle,rgba(99,102,241,.13) 1px,transparent 1px);background-size:30px 30px;opacity:.2; }

/* ── content wrapper ── */
.sp-wrap { position:relative;z-index:1;max-width:820px;margin:0 auto;padding:32px 24px 64px; }

/* ── page header ── */
.sp-eyebrow {
  display:inline-flex;align-items:center;gap:6px;
  font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;
  color:var(--sp-a);background:rgba(99,102,241,.09);
  border:1px solid rgba(99,102,241,.18);border-radius:20px;
  padding:4px 13px;margin-bottom:10px;
}
.sp-eyebrow::before { content:'';width:5px;height:5px;border-radius:50%;background:var(--sp-a); }
.sp-title { font-size:28px;font-weight:900;color:var(--sp-ink);letter-spacing:-.035em;line-height:1.15;margin-bottom:5px; }
.sp-title span {
  background:var(--sp-grad);
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
}
.sp-subtitle { font-size:14px;color:var(--sp-ink3);font-weight:400;margin-bottom:28px; }

/* ── glass card ── */
.sp-card {
  background:var(--sp-glass);
  backdrop-filter:blur(26px) saturate(200%);
  -webkit-backdrop-filter:blur(26px) saturate(200%);
  border:1.5px solid var(--sp-border);
  border-radius:22px;
  box-shadow:var(--sp-sh);
  position:relative;overflow:hidden;
}
.sp-card::before {
  content:'';position:absolute;top:0;left:0;right:0;height:3px;
  background:var(--sp-grad);border-radius:22px 22px 0 0;
}

/* ── setup card ── */
.sp-setup { padding:26px 28px;margin-bottom:22px; }
.sp-setup-grid { display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:18px; }
@media(max-width:600px){ .sp-setup-grid { grid-template-columns:1fr; } }

.sp-label { font-size:11.5px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--sp-ink3);margin-bottom:7px;display:block; }

.sp-input {
  width:100%;background:rgba(238,240,255,.6);
  border:1.5px solid rgba(99,102,241,.15);border-radius:13px;
  padding:11px 14px;color:var(--sp-ink);font-family:'Plus Jakarta Sans',sans-serif;
  font-size:13.5px;font-weight:500;outline:none;
  transition:border-color .2s,box-shadow .2s,background .2s;
}
.sp-input:focus {
  border-color:var(--sp-a);background:rgba(255,255,255,.9);
  box-shadow:0 0 0 3px rgba(99,102,241,.12);
}
.sp-input::placeholder { color:rgba(99,102,241,.35); }

/* generate button */
.sp-gen-btn {
  width:100%;padding:12px 20px;border-radius:13px;border:none;cursor:pointer;
  background:var(--sp-grad);color:#fff;
  font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;font-weight:800;
  box-shadow:0 4px 18px rgba(79,70,229,.38);
  transition:all .22s;position:relative;overflow:hidden;letter-spacing:.01em;
}
.sp-gen-btn::before {
  content:'';position:absolute;inset:0;
  background:linear-gradient(120deg,transparent,rgba(255,255,255,.2),transparent);
  transform:translateX(-100%);transition:transform .5s;
}
.sp-gen-btn:hover::before { transform:translateX(100%); }
.sp-gen-btn:hover { transform:translateY(-2px);box-shadow:0 8px 28px rgba(79,70,229,.48); }
.sp-gen-btn:active { transform:scale(.97); }
.sp-gen-btn:disabled { background:rgba(99,102,241,.25);cursor:not-allowed;transform:none;box-shadow:none; }

/* pills row */
.sp-pills { display:flex;gap:9px;flex-wrap:wrap;margin-top:14px; }
.sp-pill {
  display:inline-flex;align-items:center;gap:6px;
  font-size:12px;font-weight:700;padding:5px 14px;border-radius:20px;
  border:1.5px solid;
}

/* ── loading ── */
.sp-loading { text-align:center;padding:64px 20px;animation:sp_pop .3s ease both; }
.sp-spinner { width:44px;height:44px;border-radius:50%;border:4px solid rgba(99,102,241,.15);border-top-color:var(--sp-a);animation:sp_spin .7s linear infinite;margin:0 auto 20px; }
.sp-loading-title { font-size:16px;font-weight:700;color:var(--sp-ink);margin-bottom:5px; }
.sp-loading-sub   { font-size:13px;color:var(--sp-ink3); }

/* ── progress card ── */
.sp-prog-card { padding:22px 26px;margin-bottom:20px; }
.sp-prog-top { display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:16px; }
.sp-prog-summary { font-size:14px;font-weight:600;color:var(--sp-ink);line-height:1.6;flex:1; }
.sp-prog-pct { font-size:36px;font-weight:900;letter-spacing:-.04em;line-height:1; }
.sp-prog-bar-wrap { height:8px;background:rgba(99,102,241,.1);border-radius:8px;overflow:hidden; }
.sp-prog-bar { height:100%;border-radius:8px;background:var(--sp-grad);transition:width .6s cubic-bezier(.4,0,.2,1); }
.sp-prog-meta { display:flex;justify-content:space-between;margin-top:6px; }
.sp-prog-meta-txt { font-size:11.5px;font-weight:600;color:var(--sp-ink3); }

/* ── legend row ── */
.sp-legend { display:flex;gap:10px;flex-wrap:wrap;margin-bottom:18px; }
.sp-legend-item { display:flex;align-items:center;gap:5px;font-size:11.5px;font-weight:600;color:var(--sp-ink2); }
.sp-legend-dot { width:8px;height:8px;border-radius:50%; }

/* ── day cards ── */
.sp-days { display:flex;flex-direction:column;gap:12px; }

.sp-day {
  border-radius:18px;border:1.5px solid;
  padding:18px 20px;
  transition:box-shadow .2s,transform .2s;
  animation:sp_up .4s ease both;
  position:relative;overflow:hidden;
}
.sp-day:hover {
  transform:translateX(4px);
  box-shadow:0 6px 24px rgba(99,102,241,.12);
}
.sp-day.past { opacity:.6; }
.sp-day.today::after {
  content:'';position:absolute;left:0;top:0;bottom:0;width:3.5px;border-radius:18px 0 0 18px;
  background:var(--sp-grad);
}

.sp-day-hdr { display:flex;align-items:flex-start;gap:13px; }
.sp-day-icon { font-size:24px;flex-shrink:0;margin-top:1px; }
.sp-day-meta { flex:1;min-width:0; }
.sp-day-badges { display:flex;align-items:center;gap:7px;flex-wrap:wrap;margin-bottom:6px; }
.sp-day-badge {
  font-size:10.5px;font-weight:800;padding:3px 10px;border-radius:20px;
  letter-spacing:.04em;text-transform:uppercase;
}
.sp-day-today-badge {
  font-size:10.5px;font-weight:800;padding:3px 10px;border-radius:20px;
  background:var(--sp-grad);color:#fff;letter-spacing:.04em;
}
.sp-day-label { font-size:13px;font-weight:700;color:var(--sp-ink2); }
.sp-day-hours { font-size:11.5px;font-weight:600;color:var(--sp-ink3); }
.sp-day-title { font-size:14.5px;font-weight:700;color:var(--sp-ink);margin-bottom:10px;line-height:1.4; }

/* topics chips */
.sp-topics { display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px; }
.sp-topic-chip {
  font-size:11.5px;font-weight:600;padding:4px 11px;
  border-radius:20px;border:1.5px solid rgba(99,102,241,.14);
  background:rgba(255,255,255,.7);color:var(--sp-ink2);
  backdrop-filter:blur(8px);
}

/* task checklist */
.sp-tasks { display:flex;flex-direction:column;gap:7px;margin-bottom:10px; }
.sp-task-row { display:flex;align-items:center;gap:10px;cursor:pointer;group:true; }
.sp-checkbox {
  width:18px;height:18px;border-radius:6px;
  border:2px solid rgba(99,102,241,.28);
  background:rgba(255,255,255,.8);
  display:flex;align-items:center;justify-content:center;
  flex-shrink:0;transition:all .2s;cursor:pointer;
}
.sp-checkbox.done {
  background:var(--sp-a);border-color:var(--sp-a);
  box-shadow:0 2px 8px rgba(79,70,229,.3);
  animation:sp_check .25s cubic-bezier(.34,1.56,.64,1) both;
}
.sp-checkbox-tick { font-size:11px;color:#fff;font-weight:900;line-height:1; }
.sp-task-text { font-size:13px;font-weight:500;color:var(--sp-ink);transition:all .2s;line-height:1.5; }
.sp-task-text.done { text-decoration:line-through;color:var(--sp-ink3); }

/* day progress circle */
.sp-day-prog { flex-shrink:0;text-align:center; }
.sp-day-prog-num { font-size:15px;font-weight:900;color:var(--sp-ink);line-height:1; }
.sp-day-prog-lbl { font-size:10px;font-weight:600;color:var(--sp-ink3);margin-top:2px; }

/* tip */
.sp-tip {
  display:flex;align-items:flex-start;gap:7px;
  background:rgba(255,255,255,.55);border:1px solid rgba(99,102,241,.12);
  border-radius:11px;padding:9px 12px;margin-top:8px;backdrop-filter:blur(8px);
}
.sp-tip-icon { font-size:14px;flex-shrink:0;margin-top:1px; }
.sp-tip-text { font-size:12px;font-weight:500;color:var(--sp-ink2);line-height:1.6;font-style:italic; }

/* ── regen button ── */
.sp-regen-btn {
  padding:10px 28px;border-radius:14px;cursor:pointer;
  background:rgba(255,255,255,.8);backdrop-filter:blur(14px);
  border:1.5px solid rgba(99,102,241,.2);color:var(--sp-a);
  font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;font-weight:700;
  transition:all .2s;box-shadow:0 2px 12px rgba(99,102,241,.1);
}
.sp-regen-btn:hover { background:rgba(238,240,255,.95);border-color:rgba(99,102,241,.38);transform:translateY(-1px);box-shadow:0 5px 18px rgba(99,102,241,.18); }

/* ── download btn ── */
.sp-dl-btn {
  display:inline-flex;align-items:center;gap:6px;
  font-size:12px;font-weight:700;color:var(--sp-ink3);
  background:none;border:none;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;
  transition:color .15s;padding:0;margin-top:4px;
}
.sp-dl-btn:hover { color:var(--sp-a); }

/* empty state */
.sp-empty {
  text-align:center;padding:56px 28px;
  animation:sp_pop .4s ease both;
}
.sp-empty-icon { font-size:52px;margin-bottom:16px;animation:sp_float 3s ease-in-out infinite; }
.sp-empty-title { font-size:18px;font-weight:800;color:var(--sp-ink);margin-bottom:6px;letter-spacing:-.02em; }
.sp-empty-sub   { font-size:13.5px;color:var(--sp-ink3);line-height:1.65;max-width:340px;margin:0 auto; }

/* stat strip */
.sp-stats { display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px; }
@media(max-width:500px){ .sp-stats { grid-template-columns:1fr 1fr; } }
.sp-stat {
  background:var(--sp-glass2);backdrop-filter:blur(14px);
  border:1.5px solid var(--sp-border);border-radius:16px;padding:14px;text-align:center;
  transition:transform .2s,box-shadow .2s;
}
.sp-stat:hover { transform:translateY(-2px);box-shadow:0 6px 20px rgba(99,102,241,.12); }
.sp-stat-val { font-size:22px;font-weight:900;letter-spacing:-.03em;line-height:1; }
.sp-stat-lbl { font-size:10.5px;font-weight:600;letter-spacing:.05em;text-transform:uppercase;color:var(--sp-ink3);margin-top:4px; }
`;

/* ─── fallback demo ─── */
const generateDemoPlan = (examDate, daysLeft, examName) => {
  const types = ["study","study","practice","study","practice","revision","rest"];
  const days  = [];
  for (let i = 0; i < Math.min(daysLeft, 7); i++) {
    const d = new Date(); d.setDate(d.getDate() + i);
    days.push({
      date:     d.toISOString().split("T")[0],
      dayLabel: `Day ${i+1} — ${["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][d.getDay()]} ${d.getDate()} ${d.toLocaleString("default",{month:"short"})}`,
      type:     i === daysLeft-1 ? "exam" : types[i % 7],
      title:    i === daysLeft-1 ? "Exam Day! You've got this 🎯" : `Study Session ${i+1}`,
      topics:   ["Quantitative Aptitude","Reasoning Ability"],
      hours:    types[i%7]==="rest" ? 0 : 3,
      tasks:    ["Review key concepts from notes","Solve 10 practice questions","Make a quick revision sheet"],
      tip:      "Stay consistent — small daily efforts compound into big results.",
    });
  }
  return { summary:`${daysLeft}-day focused plan for ${examName||"your exam"}`, totalHours: daysLeft*3, days };
};

/* ─── COMPONENT ─── */
const SmartStudyPlanner = () => {
  const [examDate,  setExamDate]  = useState("");
  const [examName,  setExamName]  = useState("");
  const [plan,      setPlan]      = useState(null);
  const [loading,   setLoading]   = useState(false);
  const [checked,   setChecked]   = useState(() => {
    try { return JSON.parse(localStorage.getItem("study_plan_checked") || "{}"); }
    catch { return {}; }
  });

  const today = new Date(); today.setHours(0,0,0,0);

  const daysUntilExam = examDate
    ? Math.ceil((new Date(examDate) - today) / 86400000)
    : 0;

  const generatePlan = async () => {
    if (!examDate) return;
    setLoading(true); setPlan(null);
    try {
      let histCtx = "";
      try {
        const hist = await api.get("/user/test/attempts");
        if (hist.data?.length > 0) {
          const weak   = hist.data.filter(a=>a.scorePercent<60).map(a=>`${a.topicName}(${Math.round(a.scorePercent)}%)`).slice(0,8);
          const strong = hist.data.filter(a=>a.scorePercent>=75).map(a=>a.topicName).slice(0,5);
          histCtx = `\nWeak topics (need focus): ${weak.join(", ")||"None yet"}\nStrong topics: ${strong.join(", ")||"None yet"}\nTotal attempts: ${hist.data.length}`;
        }
      } catch {}

      const prompt = `Create a personalised study plan for a student preparing for ${examName||"their upcoming exam"}.
Days until exam: ${daysUntilExam} days (Exam on: ${examDate})
Today: ${today.toDateString()}${histCtx}

Return ONLY valid JSON, no other text:
{"summary":"Brief 1-sentence plan strategy","totalHours":<number>,"days":[{"date":"YYYY-MM-DD","dayLabel":"Day 1 — Mon 17 Mar","type":"study|practice|revision|rest|exam","title":"Short day title","topics":["Topic 1","Topic 2"],"hours":<number 1-6>,"tasks":["Task 1","Task 2","Task 3"],"tip":"One motivational tip"}]}

Rules: max ${Math.min(daysUntilExam,14)} days, prioritise weak topics first half, revision second half, 1-2 rest days/week, last day = light revision, exam day = short entry.`;

      const res      = await api.post("/user/ai/chat", prompt, { headers:{ "Content-Type":"text/plain" } });
      const raw      = typeof res.data === "string" ? res.data : JSON.stringify(res.data);
      const jsonMatch= raw.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        setPlan(JSON.parse(jsonMatch[0]));
        setChecked({}); localStorage.removeItem("study_plan_checked");
      } else throw new Error("bad format");
    } catch {
      setPlan(generateDemoPlan(examDate, daysUntilExam, examName));
    } finally { setLoading(false); }
  };

  const toggleCheck = (dIdx, tIdx) => {
    const k = `${dIdx}-${tIdx}`;
    const u = { ...checked, [k]: !checked[k] };
    setChecked(u); localStorage.setItem("study_plan_checked", JSON.stringify(u));
  };

  const totalTasks    = plan ? plan.days.reduce((a,d)=>a+(d.tasks?.length||0),0) : 0;
  const doneTasks     = Object.values(checked).filter(Boolean).length;
  const overallPct    = totalTasks > 0 ? Math.round((doneTasks/totalTasks)*100) : 0;
  const studyDays     = plan ? plan.days.filter(d=>d.type!=="rest"&&d.type!=="exam").length : 0;
  const restDays      = plan ? plan.days.filter(d=>d.type==="rest").length : 0;

  const downloadPlan = () => {
    if (!plan) return;
    const txt = `STUDY PLAN — ${examName||"Exam"}\nGenerated: ${new Date().toDateString()}\n${"─".repeat(50)}\n\n${plan.summary}\nTotal study time: ${plan.totalHours}h\n\n`
      + plan.days.map(d=>`${d.dayLabel} (${d.hours}h) — ${d.title}\n${(d.tasks||[]).map(t=>`  • ${t}`).join("\n")}${d.tip?`\n  💡 ${d.tip}`:""}`).join("\n\n");
    const a = Object.assign(document.createElement("a"),{ href:URL.createObjectURL(new Blob([txt],{type:"text/plain"})), download:`study-plan-${examName||"exam"}.txt` });
    a.click(); URL.revokeObjectURL(a.href);
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="sp-root">
        {/* bg */}
        <div className="sp-bg">
          <div className="sp-orb sp-orb1"/><div className="sp-orb sp-orb2"/><div className="sp-orb sp-orb3"/>
          <div className="sp-dotgrid"/>
        </div>

        <div className="sp-wrap">

          {/* ── PAGE HEADER ── */}
          <div style={{ animation:"sp_up .4s ease both" }}>
            <div className="sp-eyebrow">AI-Powered</div>
            <h1 className="sp-title">Smart Study <span>Planner</span></h1>
            <p className="sp-subtitle">AI reads your weak topics and builds a personalised day-by-day plan for your exam</p>
          </div>

          {/* ── SETUP CARD ── */}
          <div className="sp-card sp-setup" style={{ animation:"sp_up .4s ease .05s both" }}>
            <div className="sp-setup-grid">
              <div>
                <label className="sp-label">Exam Name</label>
                <input
                  type="text" value={examName}
                  onChange={e=>setExamName(e.target.value)}
                  placeholder="e.g. GATE 2026, JEE Main…"
                  className="sp-input"
                />
              </div>
              <div>
                <label className="sp-label">Exam Date</label>
                <input
                  type="date" value={examDate}
                  onChange={e=>setExamDate(e.target.value)}
                  min={new Date(Date.now()+86400000).toISOString().split("T")[0]}
                  className="sp-input"
                />
              </div>
            </div>

            <button
              onClick={generatePlan}
              disabled={!examDate||loading}
              className="sp-gen-btn"
            >
              {loading ? "⏳ AI is planning your schedule…" : "✨ Generate My Personalised Plan"}
            </button>

            {/* info pills */}
            {examDate && (
              <div className="sp-pills" style={{ animation:"sp_up .3s ease both" }}>
                <span className="sp-pill" style={{ background:"rgba(99,102,241,.09)", borderColor:"rgba(99,102,241,.2)", color:"#4f46e5" }}>
                  📅 {daysUntilExam} days to go
                </span>
                {plan && (
                  <>
                    <span className="sp-pill" style={{ background:"rgba(5,150,105,.09)", borderColor:"rgba(5,150,105,.2)", color:"#059669" }}>
                      ⏱ {plan.totalHours}h total study
                    </span>
                    <span className="sp-pill" style={{ background:"rgba(124,58,237,.09)", borderColor:"rgba(124,58,237,.2)", color:"#7c3aed" }}>
                      📚 {studyDays} study days
                    </span>
                    <span className="sp-pill" style={{ background:"rgba(148,163,184,.09)", borderColor:"rgba(148,163,184,.2)", color:"#64748b" }}>
                      😴 {restDays} rest days
                    </span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* ── LOADING ── */}
          {loading && (
            <div className="sp-card" style={{ padding:0, overflow:"hidden" }}>
              <div className="sp-loading">
                <div className="sp-spinner"/>
                <div className="sp-loading-title">Building your personalised plan…</div>
                <div className="sp-loading-sub">Reading your performance history and weak topics</div>
              </div>
            </div>
          )}

          {/* ── PLAN ── */}
          {plan && !loading && (
            <div style={{ animation:"sp_up .4s ease both" }}>

              {/* stat strip */}
              <div className="sp-stats">
                {[
                  { val:`${overallPct}%`, lbl:"Completed",   color:"#4f46e5" },
                  { val:`${doneTasks}/${totalTasks}`, lbl:"Tasks Done", color:"#7c3aed" },
                  { val:`${plan.totalHours}h`, lbl:"Total Study", color:"#059669" },
                ].map((s,i) => (
                  <div key={i} className="sp-stat">
                    <div className="sp-stat-val" style={{ color:s.color }}>{s.val}</div>
                    <div className="sp-stat-lbl">{s.lbl}</div>
                  </div>
                ))}
              </div>

              {/* progress card */}
              <div className="sp-card sp-prog-card" style={{ marginBottom:20 }}>
                <div className="sp-prog-top">
                  <div>
                    <div style={{ fontSize:11, fontWeight:700, letterSpacing:".08em", textTransform:"uppercase", color:"var(--sp-ink3)", marginBottom:6 }}>Your Plan</div>
                    <div className="sp-prog-summary">{plan.summary}</div>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <div className="sp-prog-pct" style={{ background:"var(--sp-grad)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>
                      {overallPct}%
                    </div>
                    <button className="sp-dl-btn" onClick={downloadPlan}>⬇ Download plan</button>
                  </div>
                </div>
                <div className="sp-prog-bar-wrap">
                  <div className="sp-prog-bar" style={{ width:`${overallPct}%` }}/>
                </div>
                <div className="sp-prog-meta">
                  <span className="sp-prog-meta-txt">{doneTasks} of {totalTasks} tasks completed</span>
                  <span className="sp-prog-meta-txt">{totalTasks - doneTasks} remaining</span>
                </div>
              </div>

              {/* legend */}
              <div className="sp-legend">
                {Object.entries(DAY_TYPES).map(([k,v]) => (
                  <div key={k} className="sp-legend-item">
                    <div className="sp-legend-dot" style={{ background:v.badgeColor }}/>
                    {v.icon} {v.label}
                  </div>
                ))}
              </div>

              {/* day cards */}
              <div className="sp-days">
                {plan.days.map((day, dIdx) => {
                  const ts       = DAY_TYPES[day.type] || DAY_TYPES.study;
                  const tasks    = day.tasks || [];
                  const doneC    = tasks.filter((_,ti)=>checked[`${dIdx}-${ti}`]).length;
                  const isPast   = day.date && new Date(day.date) < today;
                  const isToday  = day.date && new Date(day.date).toDateString() === today.toDateString();
                  const dayPct   = tasks.length > 0 ? Math.round((doneC/tasks.length)*100) : null;

                  return (
                    <div
                      key={dIdx}
                      className={`sp-day${isPast?" past":""}${isToday?" today":""}`}
                      style={{
                        background: ts.grad,
                        borderColor: ts.border,
                        animationDelay: `${dIdx * .05}s`,
                      }}
                    >
                      <div className="sp-day-hdr">
                        {/* icon */}
                        <div className="sp-day-icon">{ts.icon}</div>

                        {/* meta */}
                        <div className="sp-day-meta">
                          {/* badges row */}
                          <div className="sp-day-badges">
                            <span className="sp-day-badge" style={{ background:ts.badgeBg, color:ts.badgeColor }}>{ts.label}</span>
                            {isToday && <span className="sp-day-today-badge">Today</span>}
                            <span className="sp-day-label">{day.dayLabel}</span>
                            {day.hours > 0 && (
                              <span className="sp-day-hours">{day.hours}h</span>
                            )}
                          </div>

                          {/* title */}
                          <div className="sp-day-title">{day.title}</div>

                          {/* topics */}
                          {day.topics?.length > 0 && (
                            <div className="sp-topics">
                              {day.topics.map((t,i) => (
                                <span key={i} className="sp-topic-chip">{t}</span>
                              ))}
                            </div>
                          )}

                          {/* tasks */}
                          {tasks.length > 0 && (
                            <div className="sp-tasks">
                              {tasks.map((task, tIdx) => {
                                const k    = `${dIdx}-${tIdx}`;
                                const done = !!checked[k];
                                return (
                                  <div key={tIdx} className="sp-task-row" onClick={() => toggleCheck(dIdx,tIdx)}>
                                    <div className={`sp-checkbox${done?" done":""}`}>
                                      {done && <span className="sp-checkbox-tick">✓</span>}
                                    </div>
                                    <span className={`sp-task-text${done?" done":""}`}>{task}</span>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* tip */}
                          {day.tip && (
                            <div className="sp-tip">
                              <span className="sp-tip-icon">💡</span>
                              <span className="sp-tip-text">{day.tip}</span>
                            </div>
                          )}
                        </div>

                        {/* day progress */}
                        {tasks.length > 0 && (
                          <div className="sp-day-prog">
                            {/* mini ring */}
                            <svg width="44" height="44" viewBox="0 0 44 44" style={{ transform:"rotate(-90deg)" }}>
                              <circle cx="22" cy="22" r="18" fill="none" stroke="rgba(99,102,241,.1)" strokeWidth="3.5"/>
                              <circle cx="22" cy="22" r="18" fill="none"
                                stroke={ts.badgeColor}
                                strokeWidth="3.5"
                                strokeLinecap="round"
                                strokeDasharray={`${2*Math.PI*18}`}
                                strokeDashoffset={`${2*Math.PI*18*(1-dayPct/100)}`}
                                style={{ transition:"stroke-dashoffset .5s cubic-bezier(.4,0,.2,1)" }}
                              />
                            </svg>
                            <div className="sp-day-prog-num" style={{ marginTop:-36, position:"relative" }}>{dayPct}%</div>
                            <div className="sp-day-prog-lbl">{doneC}/{tasks.length}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* regen */}
              <div style={{ textAlign:"center", marginTop:28 }}>
                <button className="sp-regen-btn" onClick={generatePlan}>
                  🔄 Regenerate Plan
                </button>
              </div>
            </div>
          )}

          {/* ── EMPTY STATE ── */}
          {!plan && !loading && (
            <div className="sp-card" style={{ padding:0, overflow:"hidden" }}>
              <div className="sp-empty">
                <div className="sp-empty-icon">🗓️</div>
                <div className="sp-empty-title">Your plan will appear here</div>
                <div className="sp-empty-sub">Enter your exam name and date above, then tap <strong>"Generate My Personalised Plan"</strong> to get a day-by-day schedule tailored to your weak topics.</div>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
};

export default SmartStudyPlanner;