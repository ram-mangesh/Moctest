import React from "react";
import api from "../Api/axios";

const diffCfg = {
  EASY:      { c:"#10b981", bg:"rgba(16,185,129,.15)",  label:"🟢 Easy"      },
  MEDIUM:    { c:"#f59e0b", bg:"rgba(245,158,11,.15)",  label:"🟡 Medium"    },
  DIFFICULT: { c:"#ef4444", bg:"rgba(239,68,68,.15)",   label:"🔴 Hard"      },
};
const typeCfg = {
  MCQ:   { c:"#6366f1", bg:"rgba(99,102,241,.15)",  label:"MCQ"     },
  MULTI: { c:"#a855f7", bg:"rgba(168,85,247,.15)",  label:"Multi ✓" },
  NAQ:   { c:"#f59e0b", bg:"rgba(245,158,11,.15)",  label:"Numeric" },
};

const QuestionList = ({ questions, onEdit, refresh, isDark }) => {
  const d = isDark;

  const remove = async (id) => {
    if (!window.confirm("Delete this question?")) return;
    await api.delete(`/admin/questions/${id}`);
    refresh();
  };

  return (
    <div className="ql-wrap">
      <div className="ql-hdr">
        <h3 className={`ql-title ${d ? "t-dark" : "t-light"}`}>❓ Questions</h3>
        <span className="ql-count" style={{ background: "rgba(245,158,11,.12)", color: "#fbbf24" }}>
          {questions.length} questions
        </span>
      </div>

      {questions.length === 0 && (
        <div className={`ql-empty ${d ? "ql-empty-dark" : "ql-empty-light"}`}>
          <span>📋</span>
          <p>No questions yet — use the form above to add some!</p>
        </div>
      )}

      <div className="ql-list">
        {questions.map((q, i) => {
          const diff = diffCfg[q.difficulty] || diffCfg.EASY;
          const type = typeCfg[q.type] || typeCfg.MCQ;
          return (
            <div
              key={q.id}
              className={`ql-item ${d ? "ql-item-dark" : "ql-item-light"}`}
              style={{ "--delay": `${i * .045}s` }}
            >
              {/* Top row */}
              <div className="ql-top">
                <div className="ql-badges">
                  <span className="ql-badge" style={{ background: type.bg, color: type.c }}>{type.label}</span>
                  <span className="ql-badge" style={{ background: diff.bg, color: diff.c }}>{diff.label}</span>
                </div>
                <span className={`ql-num ${d ? "t-muted-dark" : "t-muted-light"}`}>#{i + 1}</span>
              </div>

              <p className={`ql-q ${d ? "t-dark" : "t-light"}`}>{q.question}</p>

              {q.options?.length > 0 && (
                <div className="ql-opts">
                  {q.options.map((opt, oi) => {
                    const correct = (q.type === "MCQ" && q.correct === oi) || (q.type === "MULTI" && q.correctMultiple?.includes(oi));
                    return (
                      <div key={oi} className={`ql-opt ${correct ? "ql-opt-correct" : d ? "ql-opt-dark" : "ql-opt-light"}`}>
                        <span className="ql-opt-dot" style={correct ? { background: "rgba(16,185,129,.25)", color: "#34d399" } : {}}>
                          {String.fromCharCode(65 + oi)}
                        </span>
                        <span>{opt}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {q.type === "NAQ" && (
                <div className={`ql-naq ${d ? "ql-naq-dark" : "ql-naq-light"}`}>
                  Answer: <strong>{q.correctNumeric}</strong>
                  {q.tolerance > 0 && <span> ± {q.tolerance}</span>}
                </div>
              )}

              <div className={`ql-foot ${d ? "ql-foot-dark" : "ql-foot-light"}`}>
                <span className={`ql-topic ${d ? "t-muted-dark" : "t-muted-light"}`}>📁 {q.topic?.name}</span>
                <div className="ql-actions">
                  <button className="ql-edit" onClick={() => onEdit(q)}>✏️ Edit</button>
                  <button className="ql-del"  onClick={() => remove(q.id)}>🗑️ Delete</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        .ql-wrap { display:flex;flex-direction:column;gap:14px; }
        .ql-hdr  { display:flex;align-items:center;justify-content:space-between; }
        .ql-title{ font-size:15px;font-weight:700; }
        .ql-count{ font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px; }

        .ql-empty {
          text-align:center;padding:40px 20px;border-radius:14px;border:1.5px dashed;
        }
        .ql-empty-dark  { background:rgba(255,255,255,.02);border-color:rgba(255,255,255,.1);color:rgba(255,255,255,.35); }
        .ql-empty-dark span { font-size:36px;display:block;margin-bottom:8px; }
        .ql-empty-light { background:rgba(245,158,11,.03);border-color:rgba(245,158,11,.2);color:#9ca3af; }
        .ql-empty-light span { font-size:36px;display:block;margin-bottom:8px; }

        .ql-list { display:flex;flex-direction:column;gap:10px; }

        .ql-item {
          border-radius:14px;padding:16px;
          display:flex;flex-direction:column;gap:10px;
          border:1.5px solid;
          transition:all .22s;
          animation:itemIn .36s ease both;
          animation-delay:var(--delay,0s);
        }
        @keyframes itemIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }

        .ql-item-dark {
          background:rgba(255,255,255,.04);
          border-color:rgba(255,255,255,.07);
        }
        .ql-item-dark:hover {
          background:rgba(255,255,255,.07);
          border-color:rgba(245,158,11,.3);
          box-shadow:0 4px 20px rgba(245,158,11,.1);
          transform:translateY(-1px);
        }
        .ql-item-light {
          background:#fff;
          border-color:rgba(245,158,11,.14);
          box-shadow:0 2px 8px rgba(245,158,11,.05);
        }
        .ql-item-light:hover {
          border-color:rgba(245,158,11,.3);
          box-shadow:0 6px 22px rgba(245,158,11,.1);
          transform:translateY(-1px);
        }

        .ql-top   { display:flex;align-items:center;justify-content:space-between; }
        .ql-badges{ display:flex;gap:6px; }
        .ql-badge { font-size:10.5px;font-weight:700;padding:3px 9px;border-radius:20px;letter-spacing:.04em; }
        .ql-num   { font-size:11px; }

        .ql-q { font-size:14px;font-weight:600;line-height:1.5; }

        .ql-opts { display:grid;grid-template-columns:1fr 1fr;gap:6px; }
        @media(max-width:500px){ .ql-opts{ grid-template-columns:1fr; } }

        .ql-opt {
          display:flex;align-items:center;gap:8px;
          padding:6px 10px;border-radius:8px;font-size:12.5px;
        }
        .ql-opt-correct { background:rgba(16,185,129,.1);color:#34d399;font-weight:600; }
        .ql-opt-dark    { background:rgba(255,255,255,.04);color:rgba(255,255,255,.55); }
        .ql-opt-light   { background:#f9fafb;color:#4b5563; }

        .ql-opt-dot {
          width:20px;height:20px;border-radius:6px;flex-shrink:0;
          background:rgba(99,102,241,.12);color:#818cf8;
          font-size:10px;font-weight:800;
          display:flex;align-items:center;justify-content:center;
        }

        .ql-naq { font-size:13px;padding:8px 12px;border-radius:8px; }
        .ql-naq-dark  { background:rgba(245,158,11,.08);color:rgba(255,255,255,.7); }
        .ql-naq-light { background:rgba(245,158,11,.06);color:#78350f; }

        .ql-foot {
          display:flex;align-items:center;justify-content:space-between;
          padding-top:10px;border-top:1px solid;
        }
        .ql-foot-dark  { border-color:rgba(255,255,255,.06); }
        .ql-foot-light { border-color:#f3f4f6; }

        .ql-topic { font-size:11.5px;font-weight:500; }
        .ql-actions{ display:flex;gap:6px; }
        .ql-edit {
          padding:5px 11px;border-radius:7px;font-size:11.5px;font-weight:600;
          cursor:pointer;border:none;
          background:rgba(99,102,241,.12);color:#818cf8;
          transition:all .2s;
        }
        .ql-edit:hover { background:rgba(99,102,241,.22);transform:scale(1.05); }
        .ql-del {
          padding:5px 11px;border-radius:7px;font-size:11.5px;font-weight:600;
          cursor:pointer;border:none;
          background:rgba(239,68,68,.12);color:#f87171;
          transition:all .2s;
        }
        .ql-del:hover { background:rgba(239,68,68,.22);transform:scale(1.05); }

        .t-dark  { color:#f1f5f9; }
        .t-light { color:#1f2937; }
        .t-muted-dark  { color:rgba(255,255,255,.4); }
        .t-muted-light { color:#6b7280; }
      `}</style>
    </div>
  );
};

export default QuestionList;
