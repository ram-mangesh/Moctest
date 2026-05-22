import React, { useEffect, useState } from "react";
import api from "../Api/axios";

/**
 * SharedStyles — Light Glassmorphic
 * Used across ExamManager, SubjectManager, TopicManager, QuestionManager
 */
export const SharedStyles = () => (
  <style>{`
    /* ── Manager wrapper ── */
    .mgr { display:flex;flex-direction:column;gap:18px;max-width:720px;margin:0 auto; }

    /* ── Form card ── */
    .mgr-card {
      border-radius:18px;padding:22px;
      background:rgba(255,255,255,0.82);
      backdrop-filter:blur(20px) saturate(180%);
      border:1.5px solid rgba(99,102,241,0.14);
      box-shadow:0 4px 24px rgba(99,102,241,0.09),inset 0 1px 0 rgba(255,255,255,.9);
      transition:box-shadow .3s,transform .25s;
      animation:fadeUp .4s ease both;
    }
    .mgr-card:hover {
      box-shadow:0 8px 36px rgba(99,102,241,.16),inset 0 1px 0 rgba(255,255,255,.9);
      transform:translateY(-1px);
    }
    @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }

    .mgr-card-header { display:flex;align-items:center;gap:10px;margin-bottom:16px; }
    .mgr-card-icon   { font-size:22px; }
    .mgr-card-title  { font-size:15px;font-weight:800;color:#1e1b4b;letter-spacing:-.01em; }

    .mgr-row { display:flex;gap:10px;flex-wrap:wrap; }

    /* ── Inputs ── */
    .mgr-input {
      flex:1;min-width:180px;
      padding:10px 14px;border-radius:11px;font-size:14px;
      outline:none;transition:border .2s,box-shadow .2s;
      font-family:inherit;
      background:rgba(255,255,255,.9);
      border:1.5px solid rgba(99,102,241,.2);
      color:#1e1b4b;
    }
    .mgr-input::placeholder { color:rgba(99,102,241,.38); }
    .mgr-input:focus { border-color:var(--focus,#6366f1);box-shadow:0 0 0 3px rgba(99,102,241,.12);background:#fff; }
    .mgr-input:disabled { opacity:.45;cursor:not-allowed; }

    /* ── Buttons ── */
    .mgr-btn {
      padding:10px 20px;border-radius:11px;font-size:13.5px;font-weight:800;
      color:#fff;border:none;cursor:pointer;white-space:nowrap;
      transition:transform .2s,box-shadow .2s,filter .2s;
      font-family:inherit;
      position:relative;overflow:hidden;
    }
    .mgr-btn::after {
      content:'';position:absolute;inset:0;
      background:radial-gradient(circle at 50%,rgba(255,255,255,.4)0%,transparent 70%);
      opacity:0;transition:opacity .2s;
    }
    .mgr-btn:active::after { opacity:1; }
    .mgr-btn:hover { transform:translateY(-2px);filter:brightness(1.07); }
    .mgr-btn:active { transform:translateY(0); }
    .mgr-btn:disabled { opacity:.5;cursor:not-allowed;transform:none; }

    .mgr-ghost {
      padding:10px 16px;border-radius:11px;font-size:13.5px;font-weight:600;
      cursor:pointer;transition:all .2s;white-space:nowrap;border:1.5px solid;
      background:rgba(255,255,255,.7);color:#6366f1;border-color:rgba(99,102,241,.2);
      font-family:inherit;
    }
    .mgr-ghost:hover { background:rgba(99,102,241,.08);border-color:rgba(99,102,241,.35); }

    /* ── List header ── */
    .mgr-list-hdr { display:flex;align-items:center;justify-content:space-between;padding:0 4px; }
    .mgr-list-title { font-size:13.5px;font-weight:800;color:#1e1b4b; }
    .mgr-count { font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px; }

    /* ── Empty ── */
    .mgr-empty {
      text-align:center;padding:44px 20px;border-radius:16px;
      background:rgba(255,255,255,.55);
      border:1.5px dashed rgba(99,102,241,.22);
      color:rgba(99,102,241,.5);
      animation:fadeUp .4s ease .1s both;
    }
    .mgr-empty-icon { font-size:36px;display:block;margin-bottom:10px;animation:float 3s ease-in-out infinite; }
    @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-7px)} }
    .mgr-empty p { font-size:13.5px;font-weight:600; }

    /* ── List ── */
    .mgr-list { display:flex;flex-direction:column;gap:8px; }

    .mgr-item {
      display:flex;align-items:center;justify-content:space-between;
      padding:13px 16px;border-radius:13px;
      background:rgba(255,255,255,.78);
      border:1.5px solid rgba(99,102,241,.1);
      box-shadow:0 2px 10px rgba(99,102,241,.06);
      transition:all .22s cubic-bezier(.4,0,.2,1);
      animation:itemIn .35s ease both;
      animation-delay:var(--delay,0s);
    }
    @keyframes itemIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
    .mgr-item:hover {
      background:rgba(99,102,241,.05);
      border-color:rgba(var(--hover-rgb,99,102,241),.3);
      box-shadow:0 6px 24px rgba(var(--hover-rgb,99,102,241),.14);
      transform:translateY(-2px) translateX(2px);
    }

    .mgr-item-l { display:flex;align-items:center;gap:12px; }
    .mgr-num {
      width:28px;height:28px;border-radius:9px;
      font-size:12px;font-weight:800;
      display:flex;align-items:center;justify-content:center;flex-shrink:0;
    }
    .mgr-name { font-size:14px;font-weight:700;color:#1e1b4b; }
    .mgr-actions { display:flex;gap:7px; }

    .mgr-edit {
      padding:6px 12px;border-radius:8px;font-size:12px;font-weight:700;
      cursor:pointer;border:none;transition:all .2s;
      background:rgba(99,102,241,.1);color:#4338ca;
    }
    .mgr-edit:hover { background:rgba(99,102,241,.2);transform:scale(1.06); }

    .mgr-del {
      padding:6px 12px;border-radius:8px;font-size:12px;font-weight:700;
      cursor:pointer;border:none;transition:all .2s;
      background:rgba(239,68,68,.1);color:#dc2626;
    }
    .mgr-del:hover { background:rgba(239,68,68,.2);transform:scale(1.06); }

    /* ── Select ── */
    .mgr-select {
      width:100%;padding:10px 14px;border-radius:11px;font-size:14px;
      outline:none;cursor:pointer;transition:border .2s;font-family:inherit;
      background:rgba(255,255,255,.9);
      border:1.5px solid rgba(99,102,241,.2);
      color:#1e1b4b;
    }
    .mgr-select:focus { border-color:var(--focus,#6366f1);box-shadow:0 0 0 3px rgba(99,102,241,.12);background:#fff; }
    .mgr-select:disabled { opacity:.45;cursor:not-allowed; }
    .mgr-select option { background:#fff;color:#1e1b4b; }

    .mgr-label { display:block;font-size:10.5px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;margin-bottom:7px;color:rgba(99,102,241,.55); }

    .mgr-grid-2 { display:grid;grid-template-columns:1fr 1fr;gap:12px; }
    @media(max-width:500px){ .mgr-grid-2{ grid-template-columns:1fr; } }
    .mgr-field { margin-bottom:0; }

    /* Typography helpers */
    .t-dark  { color:#1e1b4b; }
    .t-light { color:#1e1b4b; }
    .t-muted-dark  { color:rgba(99,102,241,.55); }
    .t-muted-light { color:rgba(99,102,241,.55); }

    @media(max-width:600px){
      .mgr { gap:14px; }
      .mgr-card { padding:16px; }
      .mgr-row { gap:8px; }
    }
  `}</style>
);

/* ═══════════════════════════════════════════
   ExamManager
═══════════════════════════════════════════ */
const ExamManager = () => {
  const [exams, setExams] = useState([]);
  const [name, setName] = useState("");
  const [editExam, setEditExam] = useState(null);

  const loadExams = async () => {
    const res = await api.get("/admin/exams");
    setExams(res.data);
  };
  useEffect(() => { loadExams(); }, []);

  const submit = async () => {
    if (!name.trim()) { alert("Exam name required"); return; }
    if (editExam) await api.put(`/admin/exams/${editExam.id}`, { name });
    else          await api.post("/admin/exams", { name });
    setName(""); setEditExam(null); loadExams();
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this exam?")) return;
    await api.delete(`/admin/exams/${id}`);
    loadExams();
  };

  return (
    <div className="mgr">
      <div className="mgr-card">
        <div className="mgr-card-header">
          <span className="mgr-card-icon">📝</span>
          <span className="mgr-card-title">{editExam ? "Update Exam" : "Add New Exam"}</span>
        </div>
        <div className="mgr-row">
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && submit()}
            placeholder="Exam name (e.g. SSC CGL, UPSC...)"
            className="mgr-input"
            style={{ "--focus": "#6366f1" }}
          />
          <button
            onClick={submit}
            className="mgr-btn"
            style={{ background: "linear-gradient(135deg,#6366f1,#06b6d4)", boxShadow: "0 4px 16px rgba(99,102,241,.35)" }}
          >
            {editExam ? "✏️ Update" : "➕ Add Exam"}
          </button>
          {editExam && (
            <button onClick={() => { setEditExam(null); setName(""); }} className="mgr-ghost">Cancel</button>
          )}
        </div>
      </div>

      <div className="mgr-list-hdr">
        <span className="mgr-list-title">All Exams</span>
        <span className="mgr-count" style={{ background: "rgba(99,102,241,.1)", color: "#4338ca" }}>
          {exams.length} total
        </span>
      </div>

      {exams.length === 0 && (
        <div className="mgr-empty">
          <span className="mgr-empty-icon">📭</span>
          <p>No exams yet — add one above!</p>
        </div>
      )}

      <div className="mgr-list">
        {exams.map((exam, i) => (
          <div
            key={exam.id}
            className="mgr-item"
            style={{ "--delay": `${i * 0.05}s`, "--hover-rgb": "99,102,241" }}
          >
            <div className="mgr-item-l">
              <span className="mgr-num" style={{ background: "rgba(99,102,241,.1)", color: "#4338ca" }}>{i + 1}</span>
              <span className="mgr-name">{exam.name}</span>
            </div>
            <div className="mgr-actions">
              <button className="mgr-edit" onClick={() => { setEditExam(exam); setName(exam.name); }}>
                ✏️ Edit
              </button>
              <button className="mgr-del" onClick={() => remove(exam.id)}>🗑️ Delete</button>
            </div>
          </div>
        ))}
      </div>

      <SharedStyles />
    </div>
  );
};

export default ExamManager;