import React, { useEffect, useState } from "react";
import api from "../Api/axios";

const emptyForm = {
  question: "", type: "MCQ", difficulty: "EASY",
  options: ["", "", "", ""], correct: 0,
  correctMultiple: [], correctNumeric: "", tolerance: ""
};

const QuestionForm = ({ topicId, editQuestion, setEditQuestion, refresh, isDark }) => {
  const [form, setForm] = useState(emptyForm);
  const d = isDark;

  useEffect(() => {
    if (editQuestion) {
      setForm({
        question: editQuestion.question || "",
        type: editQuestion.type || "MCQ",
        difficulty: editQuestion.difficulty || "EASY",
        options: editQuestion.options || ["", "", "", ""],
        correct: editQuestion.correct ?? 0,
        correctMultiple: editQuestion.correctMultiple || [],
        correctNumeric: editQuestion.correctNumeric || "",
        tolerance: editQuestion.tolerance || ""
      });
    } else setForm(emptyForm);
  }, [editQuestion]);

  const handleOptionChange = (i, value) => {
    const u = [...form.options]; u[i] = value;
    setForm({ ...form, options: u });
  };

  const handleMultiCorrect = (i) => {
    const u = form.correctMultiple.includes(i)
      ? form.correctMultiple.filter(x => x !== i)
      : [...form.correctMultiple, i];
    setForm({ ...form, correctMultiple: u });
  };

  const submit = async () => {
    if (!topicId) return alert("Select topic first");
    if (!form.question.trim()) return alert("Enter question");
    const payload = {
      question: form.question, topicId: Number(topicId),
      type: form.type, difficulty: form.difficulty,
      options: form.type !== "NAQ" ? form.options : null,
      correct: form.type === "MCQ" ? form.correct : null,
      correctMultiple: form.type === "MULTI" ? form.correctMultiple : null,
      correctNumeric: form.type === "NAQ" ? Number(form.correctNumeric) : null,
      tolerance: form.type === "NAQ" ? Number(form.tolerance) : null
    };
    try {
      if (editQuestion) {
        await api.put(`/admin/questions/${editQuestion.id}`, payload);
      } else {
        await api.post("/admin/questions", payload);
      }
      setForm(emptyForm); setEditQuestion(null); refresh();
    } catch (err) {
      console.error(err); alert("❌ Failed to save question");
    }
  };

  const diffColors = { EASY: ["#10b981","rgba(16,185,129,.15)"], MEDIUM: ["#f59e0b","rgba(245,158,11,.15)"], DIFFICULT: ["#ef4444","rgba(239,68,68,.15)"] };
  const [dc, dbg] = diffColors[form.difficulty] || diffColors.EASY;

  return (
    <div className={`qf-wrap ${d ? "qf-dark" : "qf-light"}`}>
      {/* Header */}
      <div className="qf-hdr">
        <span className="qf-hdr-icon">{editQuestion ? "✏️" : "➕"}</span>
        <span className={`qf-hdr-title ${d ? "t-dark" : "t-light"}`}>{editQuestion ? "Edit Question" : "Add Question"}</span>
        {editQuestion && (
          <button className="qf-cancel" onClick={() => { setEditQuestion(null); setForm(emptyForm); }}>✕ Cancel</button>
        )}
      </div>

      {/* Question */}
      <textarea
        value={form.question}
        onChange={e => setForm({ ...form, question: e.target.value })}
        placeholder="Type your question here..."
        rows={3}
        className={`qf-textarea ${d ? "qf-field-dark" : "qf-field-light"}`}
      />

      {/* Type + Difficulty */}
      <div className="qf-row-2">
        <div>
          <label className={`qf-label ${d ? "t-muted-dark" : "t-muted-light"}`}>Question Type</label>
          <div className="qf-tabs">
            {[["MCQ","🔘"],["MULTI","☑️"],["NAQ","🔢"]].map(([t,ic]) => (
              <button
                key={t}
                className={`qf-tab ${form.type === t ? "qf-tab-on" : ""} ${d ? "qf-tab-dark" : "qf-tab-light"}`}
                style={form.type === t ? { background: "rgba(99,102,241,.2)", color: "#818cf8", borderColor: "rgba(99,102,241,.4)" } : {}}
                onClick={() => setForm({ ...form, type: t })}
              >{ic} {t}</button>
            ))}
          </div>
        </div>
        <div>
          <label className={`qf-label ${d ? "t-muted-dark" : "t-muted-light"}`}>Difficulty</label>
          <div className="qf-tabs">
            {[["EASY","🟢"],["MEDIUM","🟡"],["DIFFICULT","🔴"]].map(([diff,ic]) => {
              const [c,bg] = diffColors[diff];
              return (
                <button
                  key={diff}
                  className={`qf-tab ${form.difficulty === diff ? "qf-tab-on" : ""} ${d ? "qf-tab-dark" : "qf-tab-light"}`}
                  style={form.difficulty === diff ? { background: bg, color: c, borderColor: `${c}60` } : {}}
                  onClick={() => setForm({ ...form, difficulty: diff })}
                >{ic} {diff}</button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Options */}
      {form.type !== "NAQ" && (
        <div>
          <label className={`qf-label ${d ? "t-muted-dark" : "t-muted-light"}`}>Answer Options</label>
          <div className="qf-options">
            {form.options.map((opt, i) => {
              const isCorrect = (form.type === "MCQ" && form.correct === i) || (form.type === "MULTI" && form.correctMultiple.includes(i));
              return (
                <div key={i} className="qf-opt-row">
                  <span className={`qf-opt-letter ${isCorrect ? "qf-opt-correct" : d ? "qf-opt-idle-dark" : "qf-opt-idle-light"}`}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  <input
                    value={opt}
                    onChange={e => handleOptionChange(i, e.target.value)}
                    placeholder={`Option ${String.fromCharCode(65 + i)}`}
                    className={`qf-opt-input ${isCorrect ? "qf-opt-input-correct" : ""} ${d ? "qf-field-dark" : "qf-field-light"}`}
                  />
                  <button
                    className={`qf-mark ${isCorrect ? "qf-mark-on" : d ? "qf-mark-dark" : "qf-mark-light"}`}
                    onClick={() => form.type === "MCQ" ? setForm({ ...form, correct: i }) : handleMultiCorrect(i)}
                  >{isCorrect ? "✅" : "○"}</button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* NAQ */}
      {form.type === "NAQ" && (
        <div className="qf-row-2">
          <div>
            <label className={`qf-label ${d ? "t-muted-dark" : "t-muted-light"}`}>🔢 Correct Answer</label>
            <input type="number" placeholder="e.g. 42"
              value={form.correctNumeric}
              onChange={e => setForm({ ...form, correctNumeric: e.target.value })}
              className={`qf-input ${d ? "qf-field-dark" : "qf-field-light"}`}
            />
          </div>
          <div>
            <label className={`qf-label ${d ? "t-muted-dark" : "t-muted-light"}`}>± Tolerance</label>
            <input type="number" placeholder="e.g. 0.5"
              value={form.tolerance}
              onChange={e => setForm({ ...form, tolerance: e.target.value })}
              className={`qf-input ${d ? "qf-field-dark" : "qf-field-light"}`}
            />
          </div>
        </div>
      )}

      <button onClick={submit} className="qf-submit" style={{ background: `linear-gradient(135deg,#f59e0b,#ef4444)` }}>
        {editQuestion ? "✏️ Update Question" : "✅ Save Question"}
      </button>

      <style>{`
        .qf-wrap {
          border-radius:16px;padding:20px;
          display:flex;flex-direction:column;gap:16px;
        }
        .qf-dark  {
          background:rgba(255,255,255,.04);
          border:1.5px solid rgba(255,255,255,.08);
        }
        .qf-light {
          background:linear-gradient(135deg,rgba(245,158,11,.05),rgba(239,68,68,.03));
          border:1.5px solid rgba(245,158,11,.18);
        }

        .qf-hdr { display:flex;align-items:center;gap:10px; }
        .qf-hdr-icon { font-size:20px; }
        .qf-hdr-title { flex:1;font-size:15px;font-weight:700; }
        .qf-cancel {
          padding:5px 12px;border-radius:8px;font-size:12px;font-weight:600;
          background:rgba(239,68,68,.12);color:#f87171;border:none;cursor:pointer;transition:all .2s;
        }
        .qf-cancel:hover { background:rgba(239,68,68,.22); }

        .qf-label { display:block;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;margin-bottom:8px; }
        .t-muted-dark  { color:rgba(255,255,255,.4); }
        .t-muted-light { color:#6b7280; }

        .qf-field-dark {
          background:rgba(255,255,255,.06);
          border:1.5px solid rgba(255,255,255,.1);
          color:#f1f5f9;
        }
        .qf-field-dark::placeholder { color:rgba(255,255,255,.28); }
        .qf-field-dark:focus { border-color:#f59e0b;box-shadow:0 0 0 3px rgba(245,158,11,.2); }

        .qf-field-light { background:#fff;border:1.5px solid rgba(245,158,11,.22);color:#1f2937; }
        .qf-field-light::placeholder { color:#9ca3af; }
        .qf-field-light:focus { border-color:#f59e0b;box-shadow:0 0 0 3px rgba(245,158,11,.12); }

        .qf-textarea {
          width:100%;padding:12px 14px;border-radius:11px;font-size:14px;
          outline:none;resize:vertical;transition:border .2s,box-shadow .2s;
          font-family:inherit;line-height:1.55;
        }
        .qf-input {
          width:100%;padding:10px 14px;border-radius:11px;font-size:14px;
          outline:none;transition:border .2s,box-shadow .2s;font-family:inherit;
        }

        .qf-row-2 { display:grid;grid-template-columns:1fr 1fr;gap:16px; }
        @media(max-width:520px){ .qf-row-2{ grid-template-columns:1fr; } }

        .qf-tabs { display:flex;gap:6px;flex-wrap:wrap; }
        .qf-tab {
          padding:7px 12px;border-radius:9px;font-size:12px;font-weight:600;
          cursor:pointer;border:1.5px solid;transition:all .2s;
        }
        .qf-tab-dark  { background:transparent;color:rgba(255,255,255,.45);border-color:rgba(255,255,255,.1); }
        .qf-tab-dark:hover  { border-color:rgba(255,255,255,.25);color:rgba(255,255,255,.8); }
        .qf-tab-light { background:#fff;color:#6b7280;border-color:#e5e7eb; }
        .qf-tab-light:hover { border-color:#f59e0b;color:#d97706; }
        .qf-tab-on { transform:scale(1.04); }

        .qf-options { display:flex;flex-direction:column;gap:8px; }
        .qf-opt-row { display:flex;align-items:center;gap:8px; }
        .qf-opt-letter {
          width:28px;height:28px;border-radius:8px;flex-shrink:0;
          display:flex;align-items:center;justify-content:center;
          font-size:11.5px;font-weight:800;transition:all .2s;
        }
        .qf-opt-correct   { background:rgba(16,185,129,.2);color:#34d399; }
        .qf-opt-idle-dark { background:rgba(255,255,255,.07);color:rgba(255,255,255,.4); }
        .qf-opt-idle-light{ background:#f3f4f6;color:#6b7280; }

        .qf-opt-input {
          flex:1;padding:9px 12px;border-radius:9px;font-size:13.5px;
          outline:none;transition:all .2s;font-family:inherit;
        }
        .qf-opt-input-correct { border-color:rgba(16,185,129,.4) !important; }

        .qf-mark {
          width:30px;height:30px;border-radius:50%;border:none;
          background:transparent;cursor:pointer;font-size:16px;
          display:flex;align-items:center;justify-content:center;
          transition:transform .2s;flex-shrink:0;
        }
        .qf-mark:hover { transform:scale(1.25); }
        .qf-mark-dark  { color:rgba(255,255,255,.3); }
        .qf-mark-light { color:#d1d5db; }
        .qf-mark-on { animation:markPop .3s cubic-bezier(.34,1.56,.64,1); }
        @keyframes markPop { from{transform:scale(.5)} to{transform:scale(1)} }

        .qf-submit {
          padding:12px 28px;border-radius:12px;font-size:15px;font-weight:800;
          color:#fff;border:none;cursor:pointer;
          transition:transform .2s,box-shadow .2s,filter .2s;
          box-shadow:0 4px 18px rgba(245,158,11,.35);
          align-self:flex-start;
        }
        .qf-submit:hover { transform:translateY(-3px);filter:brightness(1.1);box-shadow:0 8px 28px rgba(245,158,11,.5); }
        .qf-submit:active { transform:translateY(0); }

        .t-dark  { color:#f1f5f9; }
        .t-light { color:#1f2937; }
      `}</style>
    </div>
  );
};

export default QuestionForm;
