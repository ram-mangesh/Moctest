import React, { useEffect, useState } from "react";
import api from "../Api/axios";

/**
 * TeacherAiGenerator — Light Glassmorphic redesign
 * Matches the admin panel theme exactly.
 * Bug fixed: difficulty "HARD" → "DIFFICULT"
 */
const TeacherAiGenerator = () => {
  const [file,       setFile]       = useState(null);
  const [exams,      setExams]      = useState([]);
  const [subjects,   setSubjects]   = useState([]);
  const [topics,     setTopics]     = useState([]);
  const [examId,     setExamId]     = useState("");
  const [subjectId,  setSubjectId]  = useState("");
  const [topicId,    setTopicId]    = useState("");
  const [prompt,     setPrompt]     = useState("");
  const [count,      setCount]      = useState(5);
  const [type,       setType]       = useState("MCQ");
  const [difficulty, setDifficulty] = useState("EASY");
  const [drafts,     setDrafts]     = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [editId,     setEditId]     = useState(null);
  const [editQ,      setEditQ]      = useState("");
  const [editOpts,   setEditOpts]   = useState([]);
  const [dragOver,   setDragOver]   = useState(false);
  const [step,       setStep]       = useState(1); // 1=scope 2=config 3=drafts

  useEffect(() => { api.get("/admin/exams").then(r => setExams(r.data)).catch(() => {}); }, []);

  const loadSubjects = async (eid) => {
    const r = await api.get(`/admin/subjects?examId=${eid}`);
    setSubjects(r.data); setSubjectId(""); setTopics([]); setTopicId("");
  };
  const loadTopics = async (sid) => {
    const r = await api.get(`/admin/topics?subjectId=${sid}`);
    setTopics(r.data); setTopicId("");
  };
  const loadDrafts = async () => {
    const r = await api.get(`/review/drafts/topic/${topicId}`);
    setDrafts(r.data || []);
  };

  const generate = async () => {
    if (!file)    return alert("Upload a file first");
    if (!topicId) return alert("Select a topic first");
    const fd = new FormData();
    fd.append("file", file);
    fd.append("topicId", Number(topicId));
    fd.append("prompt", prompt);
    fd.append("questionCount", count);
    fd.append("type", type);
    fd.append("difficulty", difficulty);
    try {
      setLoading(true);
      await api.post("/assign/generate", fd, { headers: { "Content-Type": "multipart/form-data" } });
      await loadDrafts();
      setStep(3);
    } catch (err) {
      console.error(err);
      alert("AI generation failed");
    } finally { setLoading(false); }
  };

  const approve = async () => {
    await api.post(`/approve?topicId=${topicId}`);
    alert("✅ Questions approved and moved to live");
    setDrafts([]);
    setStep(1);
  };

  const removeDraft = async (id) => {
    if (!window.confirm("Delete this question?")) return;
    await api.delete(`/admin/questions/${id}`);
    await loadDrafts();
  };

  const saveEdit = async (q) => {
    await api.put(`/review/drafts/${q.id}`, { ...q, question: editQ, options: editOpts });
    setEditId(null);
    await loadDrafts();
  };

  // ── Styling helpers ────────────────────────────────────────────────────
  const glass = {
    background: "rgba(255,255,255,.82)",
    backdropFilter: "blur(20px) saturate(180%)",
    WebkitBackdropFilter: "blur(20px) saturate(180%)",
    border: "1.5px solid rgba(99,102,241,.13)",
    borderRadius: 18,
    boxShadow: "0 4px 24px rgba(99,102,241,.09),inset 0 1px 0 rgba(255,255,255,.9)",
  };

  const inpStyle = {
    width: "100%", padding: "10px 14px", borderRadius: 11, fontFamily: "inherit",
    fontSize: 14, outline: "none",
    background: "rgba(255,255,255,.9)",
    border: "1.5px solid rgba(99,102,241,.2)", color: "#1e1b4b",
    transition: "border .2s, box-shadow .2s",
  };

  const focusIn  = e => { e.target.style.borderColor="#6366f1"; e.target.style.boxShadow="0 0 0 3px rgba(99,102,241,.12)"; e.target.style.background="#fff"; };
  const focusOut = e => { e.target.style.borderColor="rgba(99,102,241,.2)"; e.target.style.boxShadow="none"; e.target.style.background="rgba(255,255,255,.9)"; };

  const diffCfg = {
    EASY:      { label:"🟢 Easy",      color:"#059669", bg:"rgba(16,185,129,.1)",  border:"rgba(16,185,129,.3)"  },
    MEDIUM:    { label:"🟡 Medium",    color:"#b45309", bg:"rgba(245,158,11,.1)",  border:"rgba(245,158,11,.3)"  },
    DIFFICULT: { label:"🔴 Difficult", color:"#dc2626", bg:"rgba(239,68,68,.1)",   border:"rgba(239,68,68,.3)"   },
  };
  const typeCfg = {
    MCQ:   { label:"🔘 MCQ",   color:"#4338ca", bg:"rgba(99,102,241,.1)",  border:"rgba(99,102,241,.3)"  },
    MULTI: { label:"☑️ Multi", color:"#7c3aed", bg:"rgba(139,92,246,.1)",  border:"rgba(139,92,246,.3)"  },
    NAQ:   { label:"🔢 NAQ",   color:"#0369a1", bg:"rgba(6,182,212,.1)",   border:"rgba(6,182,212,.3)"   },
  };

  const stepDone = (n) => n < step;
  const stepActive = (n) => n === step;

  return (
    <>
      <style>{`
        @keyframes fadeUp  { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes itemIn  { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimGen { from{background-position:-200% 0} to{background-position:200% 0} }
        @keyframes spin    { to{transform:rotate(360deg)} }
        @keyframes aiGlow  {
          0%,100%{box-shadow:0 6px 28px rgba(16,185,129,.3)}
          50%{box-shadow:0 8px 40px rgba(16,185,129,.5)}
        }
        @keyframes shim { from{transform:translateX(-100%)} to{transform:translateX(200%)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }

        .aig-tab-btn {
          padding:9px 16px;border-radius:10px;font-size:13px;font-weight:700;
          cursor:pointer;border:1.5px solid;transition:all .2s;font-family:inherit;
          background:rgba(255,255,255,.7);
        }
        .aig-tab-btn:hover { transform:translateY(-1px); }
        .aig-tab-btn.on   { transform:scale(1.04);box-shadow:0 4px 14px rgba(0,0,0,.08); }

        .aig-counter {
          display:flex;align-items:center;border-radius:11px;overflow:hidden;
          border:1.5px solid rgba(99,102,241,.2);background:rgba(255,255,255,.8);
          width:fit-content;
        }
        .aig-cnt-btn {
          width:38px;height:40px;border:none;cursor:pointer;font-size:18px;font-weight:800;
          background:rgba(99,102,241,.08);color:#6366f1;
          transition:background .18s;display:flex;align-items:center;justify-content:center;
          font-family:inherit;
        }
        .aig-cnt-btn:hover { background:rgba(99,102,241,.18); }
        .aig-cnt-val { width:44px;text-align:center;font-size:15px;font-weight:800;color:#1e1b4b;font-variant-numeric:tabular-nums; }

        .aig-file-drop {
          display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;
          padding:30px 20px;border-radius:14px;cursor:pointer;transition:all .25s;
          border:2px dashed rgba(99,102,241,.25);
          background:rgba(99,102,241,.03);
          min-height:130px;position:relative;
        }
        .aig-file-drop:hover, .aig-file-drop.drag { border-color:rgba(99,102,241,.55);background:rgba(99,102,241,.07); }
        .aig-file-drop.has-file { border-style:solid;border-color:rgba(16,185,129,.35);background:rgba(16,185,129,.04); }
        .aig-file-inp { position:absolute;inset:0;opacity:0;cursor:pointer;width:100%;height:100%; }

        .aig-gen-btn {
          width:100%;padding:14px;border-radius:13px;font-size:15px;font-weight:900;
          color:#fff;border:none;cursor:pointer;font-family:inherit;
          background:linear-gradient(135deg,#10b981,#06b6d4,#6366f1);
          background-size:200% 200%;
          box-shadow:0 6px 28px rgba(16,185,129,.3);
          transition:all .25s;
          position:relative;overflow:hidden;
          animation:aiGlow 2.5s ease-in-out infinite;
        }
        .aig-gen-btn::before {
          content:'';position:absolute;top:0;left:-100%;width:60%;height:100%;
          background:linear-gradient(120deg,transparent,rgba(255,255,255,.22),transparent);
          animation:shim 2.5s linear infinite;
        }
        .aig-gen-btn:hover:not(:disabled) { transform:translateY(-3px);box-shadow:0 10px 36px rgba(16,185,129,.45);filter:brightness(1.06); }
        .aig-gen-btn:active { transform:translateY(0); }
        .aig-gen-btn:disabled { opacity:.55;cursor:not-allowed;animation:none;box-shadow:0 4px 14px rgba(16,185,129,.18); }

        .aig-draft-card {
          border-radius:14px;padding:16px 18px;
          background:rgba(255,255,255,.8);
          border:1.5px solid rgba(99,102,241,.12);
          box-shadow:0 2px 14px rgba(99,102,241,.07);
          transition:all .22s;
          animation:itemIn .35s ease both;
        }
        .aig-draft-card:hover { border-color:rgba(99,102,241,.25);box-shadow:0 6px 24px rgba(99,102,241,.13);transform:translateY(-1px); }

        .aig-approve-btn {
          padding:13px 28px;border-radius:13px;font-size:14.5px;font-weight:900;
          color:#fff;border:none;cursor:pointer;font-family:inherit;
          background:linear-gradient(135deg,#059669,#06b6d4);
          box-shadow:0 6px 22px rgba(5,150,105,.3);
          transition:all .25s;
        }
        .aig-approve-btn:hover { transform:translateY(-2px);box-shadow:0 10px 32px rgba(5,150,105,.42);filter:brightness(1.06); }

        .aig-step-track {
          display:flex;align-items:center;gap:0;margin-bottom:24px;
          animation:fadeUp .4s ease both;
        }
        .aig-step-node {
          display:flex;flex-direction:column;align-items:center;gap:5px;
          flex-shrink:0;
        }
        .aig-step-circle {
          width:34px;height:34px;border-radius:50%;
          display:flex;align-items:center;justify-content:center;
          font-size:13px;font-weight:900;border:2px solid;
          transition:all .3s;position:relative;
        }
        .aig-step-lbl { font-size:10.5px;font-weight:700;white-space:nowrap; }
        .aig-step-line { flex:1;height:2px;border-radius:2px;transition:background .4s;min-width:24px; }

        @media(max-width:640px){
          .aig-grid-2 { grid-template-columns:1fr!important; }
          .aig-grid-3 { grid-template-columns:1fr!important; }
        }
      `}</style>

      <div style={{ maxWidth: 820, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>

        {/* ─── Hero header ─────────────────────────────────────── */}
        <div style={{ ...glass, padding: "22px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap", animation: "fadeUp .4s ease both" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{
              width: 50, height: 50, borderRadius: 15,
              background: "linear-gradient(135deg,#10b981,#06b6d4,#6366f1)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 26, boxShadow: "0 6px 20px rgba(16,185,129,.32)",
              flexShrink: 0,
            }}>🤖</div>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 900, color: "#1e1b4b", letterSpacing: "-.02em", marginBottom: 3 }}>
                AI Question Generator
              </h2>
              <p style={{ fontSize: 12.5, color: "rgba(99,102,241,.6)", lineHeight: 1.4 }}>
                Upload a study document and let AI craft exam-ready questions instantly
              </p>
            </div>
          </div>
          {/* AI powered pill */}
          <div style={{
            position: "relative", overflow: "hidden",
            padding: "8px 18px", borderRadius: 22,
            background: "linear-gradient(135deg,#10b981,#06b6d4,#6366f1)",
            color: "#fff", fontSize: 12.5, fontWeight: 900, letterSpacing: ".03em",
            boxShadow: "0 4px 18px rgba(16,185,129,.3)",
            whiteSpace: "nowrap", flexShrink: 0,
            animation: "aiGlow 2.5s ease-in-out infinite",
          }}>
            ✨ Powered by AI
            <span style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(120deg,transparent,rgba(255,255,255,.3),transparent)",
              animation: "shim 2.5s linear infinite",
            }} />
          </div>
        </div>

        {/* ─── Step tracker ─────────────────────────────────────── */}
        <div className="aig-step-track">
          {[
            { n: 1, label: "Scope"    },
            { n: 2, label: "Configure" },
            { n: 3, label: "Drafts"   },
          ].map((s, i, arr) => {
            const done   = stepDone(s.n);
            const active = stepActive(s.n);
            return (
              <React.Fragment key={s.n}>
                <div className="aig-step-node" onClick={() => done && setStep(s.n)} style={{ cursor: done ? "pointer" : "default" }}>
                  <div className="aig-step-circle" style={
                    done   ? { background: "linear-gradient(135deg,#6366f1,#8b5cf6)", borderColor: "transparent", color: "#fff", boxShadow: "0 4px 14px rgba(99,102,241,.3)" } :
                    active ? { background: "rgba(99,102,241,.1)", borderColor: "#6366f1", color: "#6366f1", boxShadow: "0 0 0 4px rgba(99,102,241,.12)" } :
                             { background: "transparent", borderColor: "rgba(99,102,241,.2)", color: "rgba(99,102,241,.35)" }
                  }>
                    {done ? "✓" : s.n}
                  </div>
                  <span className="aig-step-lbl" style={{
                    color: done || active ? "#6366f1" : "rgba(99,102,241,.35)",
                    fontWeight: active ? 800 : 600,
                  }}>{s.label}</span>
                </div>
                {i < arr.length - 1 && (
                  <div className="aig-step-line" style={{
                    background: done
                      ? "linear-gradient(90deg,#6366f1,#8b5cf6)"
                      : "rgba(99,102,241,.12)",
                    marginBottom: 18,
                  }} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* ─── Step 1: Upload + Scope ───────────────────────────── */}
        {step === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 18, animation: "fadeUp .38s ease both" }}>

            {/* File upload */}
            <div style={{ ...glass, padding: "20px 22px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <span style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase", color: "rgba(99,102,241,.5)" }}>
                  📄  Step 1 — Upload Material
                </span>
              </div>
              <label
                className={`aig-file-drop${dragOver ? " drag" : ""}${file ? " has-file" : ""}`}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) setFile(f); }}
              >
                <input
                  className="aig-file-inp"
                  type="file"
                  accept=".pdf,.docx,.doc,.txt"
                  onChange={e => setFile(e.target.files[0])}
                />
                <span style={{ fontSize: 34 }}>{file ? "✅" : "📂"}</span>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: file ? "#059669" : "#4338ca" }}>
                    {file ? file.name : "Click or drag & drop your file"}
                  </div>
                  <div style={{ fontSize: 12, color: "rgba(99,102,241,.45)", marginTop: 4 }}>
                    {file ? `${(file.size / 1024).toFixed(0)} KB · ready to process` : "PDF, DOCX, TXT supported"}
                  </div>
                </div>
                {file && (
                  <button
                    onClick={e => { e.preventDefault(); e.stopPropagation(); setFile(null); }}
                    style={{
                      position: "absolute", top: 10, right: 12,
                      background: "rgba(239,68,68,.1)", border: "1.5px solid rgba(239,68,68,.25)",
                      color: "#dc2626", borderRadius: 8, padding: "3px 10px",
                      fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                    }}
                  >
                    Remove
                  </button>
                )}
              </label>
            </div>

            {/* Scope selects */}
            <div style={{ ...glass, padding: "20px 22px" }}>
              <span style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase", color: "rgba(99,102,241,.5)", display: "block", marginBottom: 14 }}>
                🎯  Step 2 — Select Scope
              </span>
              <div className="aig-grid-3" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                {[
                  { label: "Exam", val: examId, opts: exams, disabled: false,
                    onChange: e => { setExamId(e.target.value); loadSubjects(e.target.value); }, ph: "— Choose Exam —" },
                  { label: "Subject", val: subjectId, opts: subjects, disabled: !examId,
                    onChange: e => { setSubjectId(e.target.value); loadTopics(e.target.value); }, ph: "— Choose Subject —" },
                  { label: "Topic", val: topicId, opts: topics, disabled: !subjectId,
                    onChange: e => setTopicId(e.target.value), ph: "— Choose Topic —" },
                ].map(s => (
                  <div key={s.label}>
                    <label style={{ display: "block", fontSize: 10.5, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".1em", color: "rgba(99,102,241,.55)", marginBottom: 7 }}>
                      {s.label}
                    </label>
                    <select
                      value={s.val} onChange={s.onChange} disabled={s.disabled}
                      style={{ ...inpStyle, cursor: s.disabled ? "not-allowed" : "pointer", opacity: s.disabled ? .5 : 1 }}
                      onFocus={focusIn} onBlur={focusOut}
                    >
                      <option value="">{s.ph}</option>
                      {s.opts.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                if (!file)    return alert("Upload a file first");
                if (!topicId) return alert("Select a topic first");
                setStep(2);
              }}
              style={{
                padding: "12px 28px", borderRadius: 12, fontSize: 14, fontWeight: 800,
                color: "#fff", border: "none", cursor: "pointer", fontFamily: "inherit",
                background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                boxShadow: "0 4px 18px rgba(99,102,241,.32)",
                transition: "all .22s", alignSelf: "flex-start",
              }}
              onMouseEnter={e => { e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = "0 8px 28px rgba(99,102,241,.42)"; }}
              onMouseLeave={e => { e.target.style.transform = "translateY(0)"; e.target.style.boxShadow = "0 4px 18px rgba(99,102,241,.32)"; }}
            >
              Next — Configure →
            </button>
          </div>
        )}

        {/* ─── Step 2: Configure ────────────────────────────────── */}
        {step === 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 18, animation: "fadeUp .38s ease both" }}>
            <div style={{ ...glass, padding: "22px" }}>
              <span style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase", color: "rgba(99,102,241,.5)", display: "block", marginBottom: 18 }}>
                ⚙️  Step 3 — Configure Generation
              </span>

              <div className="aig-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 18 }}>
                {/* Count */}
                <div>
                  <label style={{ display: "block", fontSize: 10.5, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".1em", color: "rgba(99,102,241,.55)", marginBottom: 10 }}>
                    Question Count
                  </label>
                  <div className="aig-counter">
                    <button className="aig-cnt-btn" onClick={() => setCount(c => Math.max(1, c - 1))}>−</button>
                    <span className="aig-cnt-val">{count}</span>
                    <button className="aig-cnt-btn" onClick={() => setCount(c => Math.min(50, c + 1))}>+</button>
                  </div>
                  <div style={{ fontSize: 11, color: "rgba(99,102,241,.4)", marginTop: 6 }}>Max 50 per generation</div>
                </div>

                {/* Question type */}
                <div>
                  <label style={{ display: "block", fontSize: 10.5, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".1em", color: "rgba(99,102,241,.55)", marginBottom: 10 }}>
                    Question Type
                  </label>
                  <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                    {Object.entries(typeCfg).map(([k, v]) => (
                      <button
                        key={k}
                        className={`aig-tab-btn${type === k ? " on" : ""}`}
                        style={{
                          background: type === k ? v.bg : "rgba(255,255,255,.7)",
                          color:      type === k ? v.color : "rgba(99,102,241,.45)",
                          borderColor: type === k ? v.border : "rgba(99,102,241,.15)",
                        }}
                        onClick={() => setType(k)}
                      >
                        {v.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Difficulty */}
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: "block", fontSize: 10.5, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".1em", color: "rgba(99,102,241,.55)", marginBottom: 10 }}>
                  Difficulty
                </label>
                <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
                  {Object.entries(diffCfg).map(([k, v]) => (
                    <button
                      key={k}
                      className={`aig-tab-btn${difficulty === k ? " on" : ""}`}
                      style={{
                        background: difficulty === k ? v.bg : "rgba(255,255,255,.7)",
                        color:      difficulty === k ? v.color : "rgba(99,102,241,.45)",
                        borderColor: difficulty === k ? v.border : "rgba(99,102,241,.15)",
                      }}
                      onClick={() => setDifficulty(k)}
                    >
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom prompt */}
              <div>
                <label style={{ display: "block", fontSize: 10.5, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".1em", color: "rgba(99,102,241,.55)", marginBottom: 8 }}>
                  💬  Custom Instructions (optional)
                </label>
                <textarea
                  rows={3}
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  placeholder="e.g. Focus on formulas. Avoid definition questions. Use simple language..."
                  style={{ ...inpStyle, resize: "vertical", lineHeight: 1.6 }}
                  onFocus={focusIn} onBlur={focusOut}
                />
              </div>
            </div>

            {/* Summary card */}
            <div style={{
              ...glass,
              padding: "14px 18px",
              display: "flex", alignItems: "center", flexWrap: "wrap", gap: 16,
            }}>
              <span style={{ fontSize: 12, color: "rgba(99,102,241,.5)", fontWeight: 600 }}>Ready to generate:</span>
              {[
                { label: "File",       val: file?.name?.substring(0,22) + (file?.name?.length > 22 ? "…" : "") || "—" },
                { label: "Topic",      val: topics.find(t => t.id == topicId)?.name || "—" },
                { label: "Questions",  val: count },
                { label: "Type",       val: type },
                { label: "Difficulty", val: difficulty },
              ].map(x => (
                <div key={x.label} style={{
                  padding: "4px 10px", borderRadius: 8, fontSize: 12,
                  background: "rgba(99,102,241,.08)", border: "1px solid rgba(99,102,241,.15)",
                }}>
                  <span style={{ color: "rgba(99,102,241,.5)", fontWeight: 600 }}>{x.label}: </span>
                  <span style={{ color: "#4338ca", fontWeight: 800 }}>{x.val}</span>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={() => setStep(1)}
                style={{
                  padding: "12px 20px", borderRadius: 12, fontSize: 13.5, fontWeight: 700,
                  background: "rgba(255,255,255,.8)", border: "1.5px solid rgba(99,102,241,.2)",
                  color: "#6366f1", cursor: "pointer", fontFamily: "inherit", transition: "all .22s",
                }}
                onMouseEnter={e => { e.target.style.background = "rgba(99,102,241,.08)"; }}
                onMouseLeave={e => { e.target.style.background = "rgba(255,255,255,.8)"; }}
              >
                ← Back
              </button>
              <button className="aig-gen-btn" style={{ flex: 1 }} disabled={loading} onClick={generate}>
                {loading
                  ? <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                      <span style={{ width: 20, height: 20, border: "3px solid rgba(255,255,255,.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin .7s linear infinite", flexShrink: 0 }} />
                      Generating questions...
                    </span>
                  : "✨ Generate Questions with AI"
                }
              </button>
            </div>
          </div>
        )}

        {/* ─── Step 3: Drafts ───────────────────────────────────── */}
        {step === 3 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 18, animation: "fadeUp .38s ease both" }}>
            {/* Header */}
            <div style={{ ...glass, padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 900, color: "#1e1b4b", letterSpacing: "-.02em" }}>
                  📋 Generated Questions
                </h3>
                <p style={{ fontSize: 12.5, color: "rgba(99,102,241,.6)", marginTop: 3 }}>
                  Review, edit or remove — then approve to push live
                </p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{
                  padding: "4px 14px", borderRadius: 20, fontSize: 12, fontWeight: 800,
                  background: "rgba(16,185,129,.1)", color: "#059669",
                  border: "1px solid rgba(16,185,129,.25)",
                }}>
                  {drafts.length} question{drafts.length !== 1 ? "s" : ""}
                </span>
                <button
                  onClick={() => setStep(2)}
                  style={{
                    padding: "7px 14px", borderRadius: 9, fontSize: 12, fontWeight: 700,
                    background: "rgba(99,102,241,.1)", border: "1.5px solid rgba(99,102,241,.2)",
                    color: "#6366f1", cursor: "pointer", fontFamily: "inherit",
                  }}
                >
                  ← Regenerate
                </button>
              </div>
            </div>

            {drafts.length === 0 ? (
              <div style={{ ...glass, padding: "48px 24px", textAlign: "center" }}>
                <div style={{ fontSize: 44, marginBottom: 12 }}>📭</div>
                <p style={{ fontSize: 15, fontWeight: 700, color: "#4338ca", marginBottom: 4 }}>No drafts found</p>
                <p style={{ fontSize: 13, color: "rgba(99,102,241,.5)" }}>Go back and generate questions</p>
              </div>
            ) : (
              <>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {drafts.map((q, i) => {
                    const dc = diffCfg[q.difficulty] || diffCfg.EASY;
                    const tc = typeCfg[q.type] || typeCfg.MCQ;
                    return (
                      <div key={q.id} className="aig-draft-card" style={{ animationDelay: `${i * .05}s` }}>
                        {/* Top */}
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
                          <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                            <span style={{ fontSize: 10.5, fontWeight: 800, padding: "3px 10px", borderRadius: 20, background: tc.bg, color: tc.color, border: `1px solid ${tc.border}` }}>{tc.label}</span>
                            <span style={{ fontSize: 10.5, fontWeight: 800, padding: "3px 10px", borderRadius: 20, background: dc.bg, color: dc.color, border: `1px solid ${dc.border}` }}>{dc.label}</span>
                            <span style={{ fontSize: 11, color: "rgba(99,102,241,.4)", fontWeight: 600 }}>#{i + 1}</span>
                          </div>
                          <div style={{ display: "flex", gap: 6 }}>
                            {editId === q.id ? (
                              <>
                                <button onClick={() => saveEdit(q)} style={{ padding: "5px 12px", borderRadius: 8, fontSize: 11.5, fontWeight: 700, cursor: "pointer", border: "none", background: "rgba(16,185,129,.12)", color: "#059669", fontFamily: "inherit", transition: "all .18s" }}>💾 Save</button>
                                <button onClick={() => setEditId(null)} style={{ padding: "5px 12px", borderRadius: 8, fontSize: 11.5, fontWeight: 700, cursor: "pointer", border: "1.5px solid rgba(99,102,241,.15)", background: "rgba(255,255,255,.7)", color: "rgba(99,102,241,.5)", fontFamily: "inherit" }}>Cancel</button>
                              </>
                            ) : (
                              <>
                                <button onClick={() => { setEditId(q.id); setEditQ(q.question); setEditOpts(q.options || []); }} style={{ padding: "5px 12px", borderRadius: 8, fontSize: 11.5, fontWeight: 700, cursor: "pointer", border: "none", background: "rgba(99,102,241,.1)", color: "#4338ca", fontFamily: "inherit", transition: "all .18s" }}>✏️ Edit</button>
                                <button onClick={() => removeDraft(q.id)} style={{ padding: "5px 12px", borderRadius: 8, fontSize: 11.5, fontWeight: 700, cursor: "pointer", border: "none", background: "rgba(239,68,68,.1)", color: "#dc2626", fontFamily: "inherit", transition: "all .18s" }}>🗑️</button>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Question */}
                        {editId === q.id ? (
                          <textarea
                            value={editQ}
                            onChange={e => setEditQ(e.target.value)}
                            rows={3}
                            style={{ ...inpStyle, resize: "vertical", marginBottom: 10, lineHeight: 1.55 }}
                            onFocus={focusIn} onBlur={focusOut}
                          />
                        ) : (
                          <p style={{ fontSize: 14, fontWeight: 600, color: "#1e1b4b", lineHeight: 1.5, marginBottom: 10 }}>
                            {q.question}
                          </p>
                        )}

                        {/* Options */}
                        {q.options?.length > 0 && (
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                            {(editId === q.id ? editOpts : q.options).map((opt, oi) => {
                              const isCorrect = q.type === "MCQ"
                                ? q.correct === oi
                                : q.correctMultiple?.includes(oi);
                              return editId === q.id ? (
                                <input
                                  key={oi}
                                  value={opt}
                                  onChange={e => { const u = [...editOpts]; u[oi] = e.target.value; setEditOpts(u); }}
                                  style={{ ...inpStyle, fontSize: 13 }}
                                  onFocus={focusIn} onBlur={focusOut}
                                />
                              ) : (
                                <div key={oi} style={{
                                  display: "flex", alignItems: "center", gap: 8,
                                  padding: "7px 11px", borderRadius: 9, fontSize: 13,
                                  background: isCorrect ? "rgba(16,185,129,.08)" : "rgba(99,102,241,.05)",
                                  border: `1.5px solid ${isCorrect ? "rgba(16,185,129,.25)" : "rgba(99,102,241,.1)"}`,
                                  color: isCorrect ? "#059669" : "#4338ca",
                                  fontWeight: isCorrect ? 700 : 500,
                                }}>
                                  <span style={{
                                    width: 20, height: 20, borderRadius: 6, flexShrink: 0,
                                    background: isCorrect ? "rgba(16,185,129,.18)" : "rgba(99,102,241,.1)",
                                    color: isCorrect ? "#059669" : "#6366f1",
                                    fontSize: 10, fontWeight: 900,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                  }}>
                                    {String.fromCharCode(65 + oi)}
                                  </span>
                                  {opt}
                                  {isCorrect && <span style={{ marginLeft: "auto", fontSize: 14 }}>✓</span>}
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {q.type === "NAQ" && (
                          <div style={{
                            marginTop: 8, padding: "8px 12px", borderRadius: 9, fontSize: 13, fontWeight: 700,
                            background: "rgba(16,185,129,.08)", border: "1.5px solid rgba(16,185,129,.22)", color: "#059669",
                          }}>
                            Answer: {q.correctNumeric}
                            {q.tolerance > 0 && <span style={{ opacity: .6, fontWeight: 500 }}> ± {q.tolerance}</span>}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Approve */}
                <div style={{
                  ...glass, padding: "18px 22px",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  flexWrap: "wrap", gap: 16,
                }}>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 800, color: "#1e1b4b" }}>Ready to publish?</p>
                    <p style={{ fontSize: 12.5, color: "rgba(99,102,241,.55)", marginTop: 2 }}>
                      All {drafts.length} questions will move to the live question bank
                    </p>
                  </div>
                  <button className="aig-approve-btn" onClick={approve}>
                    ✅ Approve All & Publish
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default TeacherAiGenerator;