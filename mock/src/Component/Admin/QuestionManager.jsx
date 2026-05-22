import React, { useEffect, useState } from "react";
import api from "../Api/axios";
import QuestionForm from "./QuestionForm";
import QuestionList from "./QuestionList";
import { SharedStyles } from "./ExamManager";

const QuestionManager = ({ isDark }) => {
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [examId, setExamId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [topicId, setTopicId] = useState("");
  const [editQuestion, setEditQuestion] = useState(null);
  const d = isDark;

  useEffect(() => {
    api.get("/admin/exams").then(r => setExams(r.data)).catch(() => alert("Failed to load exams"));
  }, []);

  const loadSubjects = async (eid) => {
    if (!eid) return;
    const res = await api.get(`/admin/subjects?examId=${eid}`);
    setSubjects(res.data); setSubjectId(""); setTopics([]); setTopicId(""); setQuestions([]); setEditQuestion(null);
  };

  const loadTopics = async (sid) => {
    if (!sid) return;
    const res = await api.get(`/admin/topics?subjectId=${sid}`);
    setTopics(res.data); setTopicId(""); setQuestions([]); setEditQuestion(null);
  };

  const loadQuestions = async (tid) => {
    if (!tid) return;
    const res = await api.get(`/admin/questions?topicId=${tid}`);
    setQuestions(res.data);
  };

  const step = !examId ? 1 : !subjectId ? 2 : !topicId ? 3 : 4;

  return (
    <div className="mgr" style={{ maxWidth: 900 }}>

      {/* Stepper */}
      <div className={`qm-stepper ${d ? "qm-stepper-dark" : "qm-stepper-light"}`}>
        {["Exam", "Subject", "Topic", "Questions"].map((s, i) => {
          const done = step > i + 1;
          const active = step === i + 1;
          return (
            <React.Fragment key={s}>
              <div className={`qm-step ${done ? "qm-done" : active ? "qm-active" : "qm-idle"}`}>
                <div className="qm-dot">
                  {done ? "✓" : i + 1}
                </div>
                <span className="qm-step-label">{s}</span>
              </div>
              {i < 3 && <div className={`qm-line ${done ? "qm-line-done" : ""}`} />}
            </React.Fragment>
          );
        })}
      </div>

      {/* Selects */}
      <div className="qm-selects">
        {[
          { label: "📝 Select Exam", val: examId, opts: exams, onChange: e => { setExamId(e.target.value); loadSubjects(e.target.value); }, disabled: false, placeholder: "— Choose Exam —" },
          { label: "📚 Select Subject", val: subjectId, opts: subjects, onChange: e => { setSubjectId(e.target.value); loadTopics(e.target.value); }, disabled: !examId, placeholder: "— Choose Subject —" },
          { label: "🗂️ Select Topic", val: topicId, opts: topics, onChange: e => { setTopicId(e.target.value); loadQuestions(e.target.value); }, disabled: !subjectId, placeholder: "— Choose Topic —" },
        ].map(({ label, val, opts, onChange, disabled, placeholder }) => (
          <div key={label} className="qm-sel-wrap">
            <label className={`mgr-label ${d ? "mgr-label-dark" : "mgr-label-light"}`}>{label}</label>
            <select
              value={val} onChange={onChange} disabled={disabled}
              className={`mgr-select ${d ? "mgr-select-dark" : "mgr-select-light"}`}
              style={{ "--focus": "#f59e0b" }}
            >
              <option value="">{placeholder}</option>
              {opts.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
            </select>
          </div>
        ))}
      </div>

      {/* Hint */}
      {!topicId && (
        <div className={`qm-hint ${d ? "qm-hint-dark" : "qm-hint-light"}`}>
          <span className="qm-hint-icon">👆</span>
          <p className={d ? "t-muted-dark" : "t-muted-light"}>Select an Exam → Subject → Topic above to manage questions</p>
        </div>
      )}

      {/* Form + List */}
      {topicId && (
        <div className="qm-content">
          <QuestionForm
            topicId={Number(topicId)}
            editQuestion={editQuestion}
            setEditQuestion={setEditQuestion}
            refresh={() => loadQuestions(topicId)}
            isDark={isDark}
          />
          <QuestionList
            questions={questions}
            onEdit={setEditQuestion}
            refresh={() => loadQuestions(topicId)}
            isDark={isDark}
          />
        </div>
      )}

      <SharedStyles isDark={isDark} />
      <style>{`
        .qm-stepper {
          display:flex;align-items:center;
          padding:14px 18px;border-radius:14px;flex-wrap:wrap;gap:4px;
        }
        .qm-stepper-dark  { background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07); }
        .qm-stepper-light { background:rgba(245,158,11,.05);border:1.5px solid rgba(245,158,11,.15); }

        .qm-step { display:flex;align-items:center;gap:7px;flex-shrink:0; }
        .qm-dot {
          width:26px;height:26px;border-radius:50%;
          display:flex;align-items:center;justify-content:center;
          font-size:11px;font-weight:800;flex-shrink:0;
          transition:all .3s;border:2px solid;
        }
        .qm-idle .qm-dot   { border-color:rgba(255,255,255,.12);background:transparent;color:rgba(255,255,255,.3); }
        .qm-active .qm-dot { border-color:#f59e0b;background:rgba(245,158,11,.15);color:#f59e0b;box-shadow:0 0 0 4px rgba(245,158,11,.15); }
        .qm-done .qm-dot   { border-color:transparent;background:linear-gradient(135deg,#f59e0b,#ef4444);color:#fff; }

        .qm-step-label { font-size:12px;font-weight:600;transition:color .3s; }
        .qm-idle .qm-step-label   { color:rgba(255,255,255,.3); }
        .qm-active .qm-step-label { color:#f59e0b;font-weight:700; }
        .qm-done .qm-step-label   { color:#f59e0b; }

        .qm-stepper-light .qm-idle .qm-dot   { border-color:#e5e7eb;background:#fff;color:#9ca3af; }
        .qm-stepper-light .qm-idle .qm-step-label   { color:#9ca3af; }

        .qm-line { flex:1;min-width:20px;height:2px;background:rgba(255,255,255,.08);border-radius:2px;transition:background .3s;margin:0 6px; }
        .qm-line-done { background:linear-gradient(90deg,#f59e0b,#ef4444); }
        .qm-stepper-light .qm-line { background:#e5e7eb; }

        .qm-selects { display:grid;grid-template-columns:repeat(3,1fr);gap:14px; }
        @media(max-width:620px){ .qm-selects{ grid-template-columns:1fr; } }

        .qm-hint {
          text-align:center;padding:48px 20px;border-radius:16px;border:1.5px dashed;
        }
        .qm-hint-dark  { background:rgba(255,255,255,.02);border-color:rgba(245,158,11,.2); }
        .qm-hint-light { background:rgba(245,158,11,.03);border-color:rgba(245,158,11,.25); }
        .qm-hint-icon  { font-size:40px;display:block;margin-bottom:12px;animation:hintBounce 1.8s ease-in-out infinite; }
        @keyframes hintBounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        .qm-hint p { font-size:14px;font-weight:500; }

        .qm-content { display:flex;flex-direction:column;gap:16px;animation:fadeUp .35s ease; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  );
};

export default QuestionManager;
