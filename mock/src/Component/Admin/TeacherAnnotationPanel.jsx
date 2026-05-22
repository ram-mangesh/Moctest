import { useEffect, useState, useRef } from "react";
import api from "../Api/axios";

/* ── Config ── */
const TAG_OPTIONS = [
  { value: "tip",      label: "💡 Tip",       color: "#3b82f6", bg: "rgba(59,130,246,.1)",  border: "rgba(59,130,246,.25)"  },
  { value: "strength", label: "✅ Strength",  color: "#10b981", bg: "rgba(16,185,129,.1)",  border: "rgba(16,185,129,.25)"  },
  { value: "weakness", label: "⚠️ Weakness",  color: "#f59e0b", bg: "rgba(245,158,11,.1)",  border: "rgba(245,158,11,.25)"  },
];

const fmtDate = (d) => {
  if (!d) return "";
  try { return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }); }
  catch { return ""; }
};

const scoreColor = (pct) => {
  const n = Number(pct);
  if (n >= 75) return "#059669";
  if (n >= 50) return "#b45309";
  return "#dc2626";
};

/* ── QuestionReviewCard ── */
const QuestionReviewCard = ({ q }) => {
  const [open, setOpen] = useState(false);

  let borderColor, bgColor, statusIcon;
  if (!q.hasAnswerData) {
    borderColor = "rgba(99,102,241,.15)"; bgColor = "rgba(255,255,255,.75)"; statusIcon = "📄";
  } else if (q.correct) {
    borderColor = "rgba(16,185,129,.25)"; bgColor = "rgba(16,185,129,.05)"; statusIcon = "✅";
  } else {
    borderColor = "rgba(239,68,68,.25)";  bgColor = "rgba(239,68,68,.04)";  statusIcon = "❌";
  }

  return (
    <div style={{
      borderRadius: 13, border: `1.5px solid ${borderColor}`,
      background: bgColor,
      backdropFilter: "blur(12px)",
      padding: "14px 16px", marginBottom: 10,
      transition: "all .22s", boxShadow: "0 2px 12px rgba(99,102,241,.06)",
      animation: "itemIn .3s ease both",
    }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          width: "100%", textAlign: "left", background: "none", border: "none",
          cursor: "pointer", display: "flex", alignItems: "flex-start", gap: 10, padding: 0,
        }}
      >
        <span style={{ fontSize: 15, marginTop: 1 }}>{statusIcon}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 13.5, fontWeight: 700, color: "#1e1b4b", lineHeight: 1.45 }}>
            Q{q.questionNumber}.{" "}
            <span style={{ fontWeight: 500 }}>{q.questionText}</span>
          </p>
          <div style={{ display: "flex", gap: 8, marginTop: 5, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: 11, color: "rgba(99,102,241,.5)", fontWeight: 600 }}>
              {q.type} · {q.difficulty}
            </span>
            {q.hasAnswerData && !q.correct && (
              <span style={{ fontSize: 11, color: "#dc2626", fontWeight: 700, background: "rgba(239,68,68,.1)", padding: "2px 8px", borderRadius: 6 }}>
                Wrong
              </span>
            )}
            {q.hasAnswerData && q.correct && (
              <span style={{ fontSize: 11, color: "#059669", fontWeight: 700, background: "rgba(16,185,129,.1)", padding: "2px 8px", borderRadius: 6 }}>
                Correct
              </span>
            )}
            {!q.hasAnswerData && (
              <span style={{ fontSize: 11, color: "rgba(99,102,241,.4)", fontStyle: "italic" }}>no answer data</span>
            )}
          </div>
        </div>
        <span style={{ color: "rgba(99,102,241,.4)", fontSize: 12, marginTop: 3 }}>{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div style={{ marginTop: 12, borderTop: "1px solid rgba(99,102,241,.1)", paddingTop: 12 }}>
          {!q.hasAnswerData ? (
            <div>
              <div style={{
                borderRadius: 10, padding: "10px 14px",
                background: "rgba(16,185,129,.08)", border: "1.5px solid rgba(16,185,129,.2)",
              }}>
                <p style={{ fontSize: 11, fontWeight: 800, color: "#059669", marginBottom: 5, textTransform: "uppercase", letterSpacing: ".06em" }}>Correct answer</p>
                <p style={{ fontSize: 13.5, color: "#1e1b4b", fontWeight: 500 }}>{q.correctAnswer || "—"}</p>
              </div>
              <p style={{ fontSize: 11.5, color: "rgba(99,102,241,.4)", marginTop: 8, fontStyle: "italic" }}>
                Student's answer not available for this attempt.
              </p>
            </div>
          ) : q.type === "MCQ" ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div style={{ borderRadius: 10, padding: "10px 14px", background: "rgba(239,68,68,.06)", border: "1.5px solid rgba(239,68,68,.2)" }}>
                <p style={{ fontSize: 11, fontWeight: 800, color: "#dc2626", marginBottom: 5, textTransform: "uppercase", letterSpacing: ".06em" }}>Student answered</p>
                <p style={{ fontSize: 13, color: "#1e1b4b" }}>{q.studentSelected || <em style={{ color: "rgba(99,102,241,.4)" }}>Not answered</em>}</p>
              </div>
              <div style={{ borderRadius: 10, padding: "10px 14px", background: "rgba(16,185,129,.06)", border: "1.5px solid rgba(16,185,129,.2)" }}>
                <p style={{ fontSize: 11, fontWeight: 800, color: "#059669", marginBottom: 5, textTransform: "uppercase", letterSpacing: ".06em" }}>Correct answer</p>
                <p style={{ fontSize: 13, color: "#1e1b4b" }}>{q.correctAnswer || "—"}</p>
              </div>
            </div>
          ) : q.type === "NAQ" ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div style={{ borderRadius: 10, padding: "10px 14px", background: "rgba(239,68,68,.06)", border: "1.5px solid rgba(239,68,68,.2)" }}>
                <p style={{ fontSize: 11, fontWeight: 800, color: "#dc2626", marginBottom: 5, textTransform: "uppercase", letterSpacing: ".06em" }}>Student answered</p>
                <p style={{ fontSize: 13, fontFamily: "monospace", color: "#1e1b4b" }}>
                  {q.studentNumeric != null ? q.studentNumeric : <em style={{ color: "rgba(99,102,241,.4)" }}>Not answered</em>}
                </p>
              </div>
              <div style={{ borderRadius: 10, padding: "10px 14px", background: "rgba(16,185,129,.06)", border: "1.5px solid rgba(16,185,129,.2)" }}>
                <p style={{ fontSize: 11, fontWeight: 800, color: "#059669", marginBottom: 5, textTransform: "uppercase", letterSpacing: ".06em" }}>Correct answer</p>
                <p style={{ fontSize: 13, fontFamily: "monospace", color: "#1e1b4b" }}>
                  {q.correctNumeric}{q.tolerance > 0 && <span style={{ color: "rgba(99,102,241,.45)", fontSize: 11 }}> (±{q.tolerance})</span>}
                </p>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {(q.options || []).map((opt, i) => {
                const correctSet = new Set((q.correctAnswerMultiple || []).map(s => s.toLowerCase()));
                const studentSet = new Set((q.studentSelectedMultiple || []).map(s => s.toLowerCase()));
                const isCorrect = correctSet.has(opt.toLowerCase());
                const isSelected = studentSet.has(opt.toLowerCase());
                let bg = "rgba(255,255,255,.7)"; let bc = "rgba(99,102,241,.12)"; let badge = null;
                if (isCorrect && isSelected) { bg="rgba(16,185,129,.08)"; bc="rgba(16,185,129,.3)"; badge="✅ Correct"; }
                else if (isCorrect)           { bg="rgba(16,185,129,.06)"; bc="rgba(16,185,129,.25)"; badge="✅ Missed"; }
                else if (isSelected)          { bg="rgba(239,68,68,.06)"; bc="rgba(239,68,68,.25)"; badge="❌ Wrong pick"; }
                return (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    borderRadius: 9, padding: "8px 12px",
                    background: bg, border: `1.5px solid ${bc}`, fontSize: 13, color: "#1e1b4b",
                  }}>
                    <span>{opt}</span>
                    {badge && <span style={{ fontSize: 11, fontWeight: 700, color: isCorrect ? "#059669" : "#dc2626" }}>{badge}</span>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════
   Main Panel
═══════════════════════════════════════════ */
const TeacherAnnotationPanel = () => {
  const [query,     setQuery]     = useState("");
  const [students,  setStudents]  = useState([]);
  const [searching, setSearching] = useState(false);
  const [showDrop,  setShowDrop]  = useState(false);
  const searchRef = useRef(null);

  const [student,   setStudent]   = useState(null);
  const [attempts,  setAttempts]  = useState([]);
  const [loadingA,  setLoadingA]  = useState(false);

  const [activeAttempt, setActive]   = useState(null);
  const [reviewData,    setReview]   = useState([]);
  const [loadingR,      setLoadingR] = useState(false);
  const [showAll,       setShowAll]  = useState(false);

  const [note,        setNote]        = useState("");
  const [tag,         setTag]         = useState("weakness");
  const [saving,      setSaving]      = useState(false);
  const [annotations, setAnnotations] = useState([]);

  useEffect(() => {
    if (!query.trim()) { setStudents([]); setShowDrop(false); return; }
    const t = setTimeout(() => {
      setSearching(true);
      api.get(`/admin/students/search?name=${encodeURIComponent(query)}`)
        .then(r => { setStudents(r.data || []); setShowDrop(true); })
        .catch(() => setStudents([]))
        .finally(() => setSearching(false));
    }, 350);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    const h = e => { if (searchRef.current && !searchRef.current.contains(e.target)) setShowDrop(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const selectStudent = (s) => {
    setStudent(s); setQuery(s.name); setShowDrop(false);
    setActive(null); setReview([]); setAnnotations([]);
    setLoadingA(true);
    api.get(`/admin/students/${s.id}/attempts`)
      .then(r => setAttempts(r.data || []))
      .catch(() => setAttempts([]))
      .finally(() => setLoadingA(false));
  };

  const openReview = (attempt) => {
    setActive(attempt); setNote(""); setTag("weakness"); setShowAll(false); setLoadingR(true);
    Promise.all([
      api.get(`/admin/students/attempts/${attempt.attemptId}/review`),
      api.get(`/admin/annotations/${attempt.attemptId}`),
    ])
      .then(([rev, ann]) => { setReview(rev.data || []); setAnnotations(ann.data || []); })
      .catch(() => { setReview([]); setAnnotations([]); })
      .finally(() => setLoadingR(false));
  };

  const submitAnnotation = async () => {
    if (!note.trim()) return alert("Note cannot be empty");
    setSaving(true);
    try {
      await api.post("/admin/annotations", { attemptId: activeAttempt.attemptId, note, tag });
      setNote("");
      const r = await api.get(`/admin/annotations/${activeAttempt.attemptId}`);
      setAnnotations(r.data || []);
      alert("✅ Annotation saved. Student notified by email.");
    } catch (err) {
      alert("❌ Failed: " + (err.response?.data || err.message));
    } finally {
      setSaving(false);
    }
  };

  const withData    = reviewData.filter(q => q.hasAnswerData);
  const noData      = reviewData.length > 0 && withData.length === 0;
  const wrongQ      = withData.filter(q => !q.correct);
  const correctQ    = withData.filter(q => q.correct);
  const displayList = showAll ? reviewData : (withData.length > 0 ? wrongQ : reviewData);

  /* glass style helpers */
  const card = {
    borderRadius: 18, padding: "20px 22px",
    background: "rgba(255,255,255,.82)",
    backdropFilter: "blur(20px) saturate(180%)",
    WebkitBackdropFilter: "blur(20px) saturate(180%)",
    border: "1.5px solid rgba(99,102,241,.13)",
    boxShadow: "0 4px 24px rgba(99,102,241,.09),inset 0 1px 0 rgba(255,255,255,.9)",
  };
  const inputStyle = {
    width: "100%", padding: "10px 14px", borderRadius: 11, fontFamily: "inherit",
    fontSize: 14, outline: "none",
    background: "rgba(255,255,255,.9)",
    border: "1.5px solid rgba(99,102,241,.2)", color: "#1e1b4b",
    transition: "border .2s, box-shadow .2s",
  };

  return (
    <>
      <style>{`
        @keyframes itemIn  { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }

        .ann-step-pill {
          display:inline-flex;align-items:center;gap:6px;
          padding:5px 12px;border-radius:20px;
          font-size:11px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;
          background:rgba(99,102,241,.1);color:#4338ca;
          border:1.5px solid rgba(99,102,241,.18);
          margin-bottom:12px;
        }
        .ann-step-num {
          width:20px;height:20px;border-radius:50%;
          background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;
          font-size:10px;font-weight:900;display:flex;align-items:center;justify-content:center;flex-shrink:0;
        }

        .ann-tag-btn {
          padding:9px 16px;border-radius:10px;font-size:13px;font-weight:700;
          cursor:pointer;border:1.5px solid;transition:all .22s;
          font-family:inherit;
        }
        .ann-tag-btn:hover { transform:translateY(-1px); }
        .ann-tag-btn.active { transform:scale(1.04); box-shadow:0 4px 14px rgba(0,0,0,.1); }

        .ann-table-hdr th {
          padding:10px 14px;font-size:10.5px;font-weight:800;
          text-transform:uppercase;letter-spacing:.1em;
          color:rgba(99,102,241,.55);
          background:rgba(99,102,241,.06);
          border-bottom:1px solid rgba(99,102,241,.12);
        }
        .ann-table-hdr th:first-child { border-radius:10px 0 0 0; }
        .ann-table-hdr th:last-child  { border-radius:0 10px 0 0; }

        .ann-tr {
          transition:background .18s;
          border-bottom:1px solid rgba(99,102,241,.08);
          animation:itemIn .3s ease both;
        }
        .ann-tr:hover { background:rgba(99,102,241,.04); }
        .ann-tr.selected { background:rgba(99,102,241,.07); }
        .ann-tr td { padding:12px 14px; }

        .ann-review-btn {
          padding:6px 14px;border-radius:8px;font-size:12px;font-weight:700;
          border:none;cursor:pointer;transition:all .22s;font-family:inherit;
        }
        .ann-review-btn:hover { transform:translateY(-1px); }

        .ann-textarea {
          width:100%;border-radius:11px;font-family:inherit;font-size:14px;
          outline:none;resize:none;line-height:1.6;
          background:rgba(255,255,255,.9);
          border:1.5px solid rgba(99,102,241,.2);
          color:#1e1b4b;padding:12px 14px;
          transition:border .2s,box-shadow .2s;
        }
        .ann-textarea:focus { border-color:#6366f1;box-shadow:0 0 0 3px rgba(99,102,241,.12);background:#fff; }
        .ann-textarea::placeholder { color:rgba(99,102,241,.38); }

        .ann-save-btn {
          width:100%;padding:12px;border-radius:12px;font-size:14.5px;font-weight:800;
          color:#fff;border:none;cursor:pointer;font-family:inherit;
          background:linear-gradient(135deg,#6366f1,#8b5cf6);
          box-shadow:0 4px 18px rgba(99,102,241,.35);
          transition:all .22s;
        }
        .ann-save-btn:hover:not(:disabled) { transform:translateY(-2px);box-shadow:0 8px 28px rgba(99,102,241,.45);filter:brightness(1.07); }
        .ann-save-btn:disabled { background:rgba(99,102,241,.25);cursor:not-allowed;box-shadow:none; }

        @media(max-width:600px){
          .ann-score-cols { grid-template-columns:1fr!important; }
        }
      `}</style>

      <div style={{ maxWidth: 860, margin: "0 auto", display: "flex", flexDirection: "column", gap: 18 }}>

        {/* Header */}
        <div style={{ ...card, animation: "fadeUp .4s ease both" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 13,
              background: "linear-gradient(135deg,#06b6d4,#6366f1)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 22, boxShadow: "0 4px 14px rgba(6,182,212,.3)",
            }}>✏️</div>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 900, color: "#1e1b4b", letterSpacing: "-.02em" }}>
                Faculty Annotation Panel
              </h2>
              <p style={{ fontSize: 12.5, color: "rgba(99,102,241,.6)", marginTop: 2 }}>
                Review student attempts and write personalised feedback
              </p>
            </div>
          </div>
        </div>

        {/* Step 1 — Student Search */}
        <div style={{ ...card, animation: "fadeUp .4s ease .06s both" }}>
          <div className="ann-step-pill">
            <span className="ann-step-num">1</span>
            Search Student
          </div>
          <div ref={searchRef} style={{ position: "relative" }}>
            <input
              type="text"
              value={query}
              onChange={e => { setQuery(e.target.value); setStudent(null); }}
              placeholder="🔍  Type student name..."
              style={inputStyle}
              onFocus={e => { e.target.style.borderColor="#6366f1"; e.target.style.boxShadow="0 0 0 3px rgba(99,102,241,.12)"; e.target.style.background="#fff"; }}
              onBlur={e => { e.target.style.borderColor="rgba(99,102,241,.2)"; e.target.style.boxShadow="none"; e.target.style.background="rgba(255,255,255,.9)"; }}
            />
            {searching && (
              <div style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)" }}>
                <div style={{ width: 18, height: 18, border: "2.5px solid rgba(99,102,241,.2)", borderTopColor: "#6366f1", borderRadius: "50%", animation: "spin .7s linear infinite" }} />
              </div>
            )}
            {showDrop && students.length > 0 && (
              <div style={{
                position: "absolute", zIndex: 20, top: "calc(100% + 6px)", left: 0, right: 0,
                background: "rgba(255,255,255,.97)",
                backdropFilter: "blur(20px)",
                border: "1.5px solid rgba(99,102,241,.18)",
                borderRadius: 14, overflow: "hidden",
                boxShadow: "0 12px 40px rgba(99,102,241,.18)",
                animation: "slideDown .22s ease",
              }}>
                {students.map(s => (
                  <button
                    key={s.id}
                    onClick={() => selectStudent(s)}
                    style={{
                      width: "100%", textAlign: "left", padding: "12px 16px",
                      background: "transparent", border: "none", borderBottom: "1px solid rgba(99,102,241,.08)",
                      cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between",
                      transition: "background .15s", fontFamily: "inherit",
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(99,102,241,.06)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <span style={{ fontSize: 13.5, fontWeight: 700, color: "#1e1b4b" }}>{s.name}</span>
                    <span style={{ fontSize: 11.5, color: "rgba(99,102,241,.5)" }}>{s.email}</span>
                  </button>
                ))}
              </div>
            )}
            {showDrop && !searching && students.length === 0 && (
              <div style={{
                position: "absolute", zIndex: 20, top: "calc(100% + 6px)", left: 0, right: 0,
                background: "rgba(255,255,255,.97)", backdropFilter: "blur(20px)",
                border: "1.5px solid rgba(99,102,241,.18)", borderRadius: 14,
                padding: "16px", textAlign: "center",
                fontSize: 13, color: "rgba(99,102,241,.5)", fontWeight: 600,
                boxShadow: "0 12px 40px rgba(99,102,241,.15)",
              }}>
                No students found
              </div>
            )}
          </div>
        </div>

        {/* Step 2 — Attempts */}
        {student && (
          <div style={{ ...card, animation: "fadeUp .4s ease .1s both" }}>
            <div className="ann-step-pill">
              <span className="ann-step-num">2</span>
              Select Attempt
              <span style={{ fontWeight: 500, textTransform: "none", letterSpacing: 0, color: "#6366f1" }}>
                — {student.name}
              </span>
            </div>

            {loadingA ? (
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "16px 0", color: "rgba(99,102,241,.6)", fontSize: 13.5 }}>
                <div style={{ width: 18, height: 18, border: "2.5px solid rgba(99,102,241,.2)", borderTopColor: "#6366f1", borderRadius: "50%", animation: "spin .7s linear infinite" }} />
                Loading attempts...
              </div>
            ) : attempts.length === 0 ? (
              <p style={{ fontSize: 13.5, color: "rgba(99,102,241,.5)", padding: "12px 0", fontWeight: 600 }}>No test attempts found.</p>
            ) : (
              <div style={{ overflowX: "auto", borderRadius: 12, border: "1.5px solid rgba(99,102,241,.12)" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 520 }}>
                  <thead><tr className="ann-table-hdr">
                    <th style={{ textAlign: "left" }}>Exam / Topic</th>
                    <th style={{ textAlign: "center" }}>Score</th>
                    <th style={{ textAlign: "center" }}>Result</th>
                    <th style={{ textAlign: "left" }}>Date</th>
                    <th style={{ textAlign: "center" }}>Action</th>
                  </tr></thead>
                  <tbody>
                    {attempts.map((a, i) => (
                      <tr key={a.attemptId}
                        className={`ann-tr${activeAttempt?.attemptId === a.attemptId ? " selected" : ""}`}
                        style={{ animationDelay: `${i * .05}s` }}
                      >
                        <td>
                          <p style={{ fontSize: 13.5, fontWeight: 700, color: "#1e1b4b" }}>{a.examName}</p>
                          <p style={{ fontSize: 11.5, color: "rgba(99,102,241,.5)", marginTop: 2 }}>{a.subjectName} · {a.topicName}</p>
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <span style={{ fontSize: 15, fontWeight: 900, color: scoreColor(a.scorePercent) }}>
                            {Number(a.scorePercent).toFixed(0)}%
                          </span>
                        </td>
                        <td style={{ textAlign: "center", fontSize: 12, color: "rgba(99,102,241,.6)", fontWeight: 600 }}>
                          {a.correct}/{a.total} correct
                        </td>
                        <td style={{ fontSize: 12, color: "rgba(99,102,241,.5)" }}>{fmtDate(a.attemptedAt)}</td>
                        <td style={{ textAlign: "center" }}>
                          <button
                            onClick={() => openReview(a)}
                            className="ann-review-btn"
                            style={activeAttempt?.attemptId === a.attemptId ? {
                              background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff",
                              boxShadow: "0 4px 14px rgba(99,102,241,.3)",
                            } : {
                              background: "rgba(99,102,241,.1)", color: "#4338ca",
                            }}
                          >
                            {activeAttempt?.attemptId === a.attemptId ? "📋 Reviewing" : "Review"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Step 3 — Review & Annotate */}
        {activeAttempt && (
          <div style={{
            borderRadius: 18, overflow: "hidden",
            border: "1.5px solid rgba(99,102,241,.2)",
            boxShadow: "0 8px 36px rgba(99,102,241,.14)",
            animation: "fadeUp .4s ease .14s both",
          }}>
            {/* Review header */}
            <div style={{
              background: "linear-gradient(135deg,rgba(99,102,241,.1),rgba(139,92,246,.07))",
              backdropFilter: "blur(16px)",
              padding: "16px 20px",
              borderBottom: "1px solid rgba(99,102,241,.15)",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 800, color: "#1e1b4b" }}>Step 3 — Review Answers</h3>
                  <p style={{ fontSize: 12.5, color: "#6366f1", marginTop: 3 }}>
                    {activeAttempt.examName} · {activeAttempt.topicName} ·{" "}
                    <strong style={{ color: scoreColor(activeAttempt.scorePercent) }}>
                      {Number(activeAttempt.scorePercent).toFixed(0)}%
                    </strong>
                    {" "}· {activeAttempt.correct}/{activeAttempt.total} correct
                  </p>
                </div>
                {withData.length > 0 && (
                  <div style={{ display: "flex", gap: 10, fontSize: 12.5, fontWeight: 700 }}>
                    <span style={{ color: "#059669", background: "rgba(16,185,129,.1)", padding: "4px 12px", borderRadius: 20 }}>
                      ✅ {correctQ.length} correct
                    </span>
                    <span style={{ color: "#dc2626", background: "rgba(239,68,68,.1)", padding: "4px 12px", borderRadius: 20 }}>
                      ❌ {wrongQ.length} wrong
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div style={{
              padding: "20px",
              background: "rgba(255,255,255,.78)",
              backdropFilter: "blur(20px)",
              display: "flex", flexDirection: "column", gap: 18,
            }}>
              {/* No data banner */}
              {noData && (
                <div style={{
                  display: "flex", alignItems: "flex-start", gap: 12,
                  padding: "14px 16px", borderRadius: 12,
                  background: "rgba(245,158,11,.08)", border: "1.5px solid rgba(245,158,11,.25)",
                }}>
                  <span style={{ fontSize: 18, marginTop: 1 }}>⚠️</span>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "#b45309" }}>Answer data not available for this attempt</p>
                    <p style={{ fontSize: 12, color: "#d97706", marginTop: 4, lineHeight: 1.55 }}>
                      This test was taken before answer tracking was enabled. You can still see all questions and correct answers below, and write annotations based on the student's overall score ({activeAttempt.correct}/{activeAttempt.total} correct, {Number(activeAttempt.scorePercent).toFixed(0)}%).
                    </p>
                  </div>
                </div>
              )}

              {/* Question list */}
              {loadingR ? (
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 0", color: "rgba(99,102,241,.6)", fontSize: 13.5 }}>
                  <div style={{ width: 18, height: 18, border: "2.5px solid rgba(99,102,241,.2)", borderTopColor: "#6366f1", borderRadius: "50%", animation: "spin .7s linear infinite" }} />
                  Loading questions...
                </div>
              ) : reviewData.length === 0 ? (
                <div style={{ textAlign: "center", padding: "24px 0" }}>
                  <p style={{ fontSize: 32, marginBottom: 8 }}>📭</p>
                  <p style={{ fontSize: 14, color: "rgba(99,102,241,.5)", fontWeight: 600 }}>No questions found for this topic</p>
                </div>
              ) : (
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                    <p style={{ fontSize: 12.5, fontWeight: 700, color: "rgba(99,102,241,.6)" }}>
                      {showAll ? `All ${reviewData.length} questions` : withData.length > 0 ? `${wrongQ.length} wrong answer${wrongQ.length !== 1 ? "s" : ""}` : `${reviewData.length} questions`}
                    </p>
                    <button
                      onClick={() => setShowAll(v => !v)}
                      style={{ fontSize: 12, fontWeight: 700, color: "#6366f1", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}
                    >
                      {showAll ? "Show wrong only" : "Show all questions"}
                    </button>
                  </div>
                  {displayList.length === 0 && withData.length > 0 ? (
                    <div style={{ textAlign: "center", padding: "16px 0", color: "#059669", fontWeight: 700, fontSize: 14 }}>
                      🎉 Student answered all questions correctly!
                    </div>
                  ) : (
                    displayList.map(q => <QuestionReviewCard key={q.questionId} q={q} />)
                  )}
                </div>
              )}

              {/* Annotation Form */}
              <div style={{ borderTop: "1px solid rgba(99,102,241,.12)", paddingTop: 18 }}>
                <div className="ann-step-pill">
                  <span className="ann-step-num">4</span>
                  Write Annotation
                  <span style={{ fontWeight: 500, textTransform: "none", letterSpacing: 0, color: "rgba(99,102,241,.5)" }}>
                    (student notified by email)
                  </span>
                </div>

                {/* Tags */}
                <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
                  {TAG_OPTIONS.map(t => (
                    <button
                      key={t.value}
                      onClick={() => setTag(t.value)}
                      className={`ann-tag-btn${tag === t.value ? " active" : ""}`}
                      style={{
                        background: tag === t.value ? t.bg : "rgba(255,255,255,.7)",
                        color:      tag === t.value ? t.color : "rgba(99,102,241,.5)",
                        borderColor: tag === t.value ? t.border : "rgba(99,102,241,.15)",
                      }}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* Hint */}
                {noData && !note && (
                  <div style={{
                    marginBottom: 12, padding: "10px 14px", borderRadius: 10,
                    background: "rgba(99,102,241,.06)", border: "1.5px solid rgba(99,102,241,.16)",
                    fontSize: 12.5, color: "#4338ca", lineHeight: 1.55,
                  }}>
                    💡 This student scored {Number(activeAttempt.scorePercent).toFixed(0)}% ({activeAttempt.correct}/{activeAttempt.total} correct). Write feedback based on the score and the topic: <strong>{activeAttempt.topicName}</strong>.
                  </div>
                )}
                {!noData && wrongQ.length > 0 && !note && (
                  <div style={{
                    marginBottom: 12, padding: "10px 14px", borderRadius: 10,
                    background: "rgba(245,158,11,.07)", border: "1.5px solid rgba(245,158,11,.22)",
                    fontSize: 12.5, color: "#b45309", lineHeight: 1.55,
                  }}>
                    💡 Student got <strong>{wrongQ.length}</strong> question{wrongQ.length !== 1 ? "s" : ""} wrong. Expand the cards above to see exactly what they answered vs the correct answer.
                  </div>
                )}

                <textarea
                  rows={4}
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder={`Write ${tag} feedback for ${student?.name}...\n\nExample: "Focus on revising ${activeAttempt?.topicName}. Practice 10 similar problems daily."`}
                  className="ann-textarea"
                  style={{ marginBottom: 14 }}
                />

                <button
                  onClick={submitAnnotation}
                  disabled={saving || !note.trim()}
                  className="ann-save-btn"
                >
                  {saving ? "💾 Saving..." : "💾 Save & Notify Student by Email"}
                </button>
              </div>

              {/* Existing Annotations */}
              {annotations.length > 0 && (
                <div style={{ borderTop: "1px solid rgba(99,102,241,.1)", paddingTop: 14 }}>
                  <p style={{ fontSize: 10.5, fontWeight: 800, color: "rgba(99,102,241,.45)", textTransform: "uppercase", letterSpacing: ".12em", marginBottom: 12 }}>
                    Previous Annotations ({annotations.length})
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                    {annotations.map(a => {
                      const tagCfg = TAG_OPTIONS.find(t => t.value === a.tag);
                      return (
                        <div key={a.id} style={{
                          borderRadius: 12, padding: "12px 14px",
                          background: "rgba(255,255,255,.75)",
                          border: `1.5px solid ${tagCfg?.border || "rgba(99,102,241,.12)"}`,
                          animation: "itemIn .3s ease both",
                        }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                            <span style={{
                              fontSize: 11, fontWeight: 800, padding: "3px 9px", borderRadius: 20,
                              background: tagCfg?.bg || "rgba(99,102,241,.08)",
                              color: tagCfg?.color || "#4338ca",
                              border: `1px solid ${tagCfg?.border || "rgba(99,102,241,.15)"}`,
                            }}>
                              {a.tag || "note"}
                            </span>
                            <span style={{ fontSize: 11.5, color: "rgba(99,102,241,.45)" }}>{fmtDate(a.createdAt)}</span>
                          </div>
                          <p style={{ fontSize: 13.5, color: "#1e1b4b", lineHeight: 1.55, fontWeight: 500 }}>{a.note}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default TeacherAnnotationPanel;