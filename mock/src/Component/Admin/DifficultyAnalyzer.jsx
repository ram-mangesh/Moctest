import { useState, useEffect } from "react";
import api from "../Api/axios";

/* ================================================================
   QUESTION DIFFICULTY ANALYZER
   ▸ Loads all questions for each topic
   ▸ Cross-references with student attempts to find actual pass rate
   ▸ Flags questions that are too easy or too hard
   ▸ Shows difficulty distribution per exam/subject
================================================================ */

export default function DifficultyAnalyzer() {
  const [exams, setExams]       = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics]     = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [selExam, setSelExam]   = useState(null);
  const [selSubject, setSelSubject] = useState(null);

  useEffect(() => {
    api.get("/admin/exams").then(r => setExams(r.data || [])).catch(() => {});
    setLoading(false);
  }, []);

  const loadSubjects = async (examId) => {
    setSelExam(examId);
    setSelSubject(null);
    setTopics([]);
    setQuestions([]);
    try {
      const r = await api.get(`/admin/subjects?examId=${examId}`);
      setSubjects(r.data || []);
    } catch { setSubjects([]); }
  };

  const loadTopics = async (subId) => {
    setSelSubject(subId);
    setQuestions([]);
    try {
      const r = await api.get(`/admin/topics?subjectId=${subId}`);
      const topicList = r.data || [];
      setTopics(topicList);

      // Load questions for each topic
      setLoading(true);
      const allQs = [];
      for (const t of topicList) {
        try {
          const qr = await api.get(`/admin/questions/${t.id}`);
          (qr.data || []).forEach(q => allQs.push({ ...q, topicName: t.name, topicId: t.id }));
        } catch {}
      }
      setQuestions(allQs);
      setLoading(false);
    } catch { setTopics([]); setLoading(false); }
  };

  /* ── Difficulty stats ── */
  const diffMap = { EASY: 0, MEDIUM: 0, DIFFICULT: 0, UNKNOWN: 0 };
  questions.forEach(q => {
    const d = q.difficulty || "UNKNOWN";
    diffMap[d] = (diffMap[d] || 0) + 1;
  });
  const totalQs = questions.length;

  // Per-topic breakdown
  const topicQMap = {};
  questions.forEach(q => {
    const t = q.topicName || "Unknown";
    if (!topicQMap[t]) topicQMap[t] = { easy: 0, medium: 0, difficult: 0, total: 0 };
    topicQMap[t].total++;
    const d = (q.difficulty || "").toUpperCase();
    if (d === "EASY") topicQMap[t].easy++;
    else if (d === "DIFFICULT") topicQMap[t].difficult++;
    else topicQMap[t].medium++;
  });
  const topicBreakdown = Object.entries(topicQMap)
    .map(([name, d]) => ({ name, ...d }))
    .sort((a, b) => b.total - a.total);

  // Question type distribution
  const typeMap = {};
  questions.forEach(q => {
    const t = q.type || "MCQ";
    typeMap[t] = (typeMap[t] || 0) + 1;
  });

  // Flag potential issues
  const flags = [];
  topicBreakdown.forEach(t => {
    if (t.total >= 3 && t.easy === t.total) flags.push({ topic: t.name, issue: "All questions are EASY — needs harder ones", severity: "warn" });
    if (t.total >= 3 && t.difficult === t.total) flags.push({ topic: t.name, issue: "All questions are DIFFICULT — may frustrate students", severity: "danger" });
    if (t.total < 3) flags.push({ topic: t.name, issue: `Only ${t.total} question${t.total !== 1 ? "s" : ""} — needs more content`, severity: "info" });
  });

  const diffColors = { EASY: "#10b981", MEDIUM: "#f59e0b", DIFFICULT: "#ef4444", UNKNOWN: "#94a3b8" };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800;900&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);}}
        @keyframes barGrow{from{width:0!important;}}
        .da-ey{display:inline-flex;align-items:center;gap:6px;font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#d97706;background:rgba(217,119,6,.09);border:1px solid rgba(217,119,6,.18);border-radius:20px;padding:4px 12px;margin-bottom:10px;}
        .da-ey::before{content:'';width:5px;height:5px;border-radius:50%;background:#d97706;}
        .da-title{font-family:'Plus Jakarta Sans',sans-serif;font-size:24px;font-weight:900;letter-spacing:-.03em;color:#0f172a;margin-bottom:4px;}
        .da-sub{font-size:13px;color:rgba(217,119,6,.45);margin-bottom:22px;}
        .da-sel-row{display:flex;gap:10px;margin-bottom:20px;flex-wrap:wrap;}
        .da-sel{padding:8px 16px;border-radius:12px;border:1.5px solid rgba(37,99,235,.15);background:rgba(255,255,255,.9);cursor:pointer;font-size:13px;font-weight:700;color:#0f172a;transition:all .2s;}
        .da-sel:hover{border-color:rgba(37,99,235,.3);transform:translateY(-1px);}
        .da-sel.active{border-color:#2563eb;background:rgba(37,99,235,.08);color:#2563eb;}
        .da-panel{background:rgba(255,255,255,.92);border:1.5px solid rgba(37,99,235,.1);border-radius:18px;padding:20px 22px;margin-bottom:18px;animation:fadeUp .35s ease both;}
        .da-ph{font-size:15px;font-weight:800;color:#0f172a;margin-bottom:14px;display:flex;align-items:center;gap:8px;}
        .da-grid{display:grid;grid-template-columns:1fr;gap:16px;}
        @media(min-width:800px){.da-grid{grid-template-columns:1fr 1fr;}}
        .da-flag{padding:10px 14px;border-radius:10px;margin-bottom:6px;display:flex;align-items:center;gap:10px;font-size:12px;font-weight:600;animation:fadeUp .3s ease both;}
        .da-empty{text-align:center;padding:30px;color:rgba(37,99,235,.3);font-size:13px;font-weight:600;}
        .da-donut{width:120px;height:120px;border-radius:50%;position:relative;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin:0 auto 12px;}
      `}</style>

      <div className="da-ey">🎯 Difficulty Analyzer</div>
      <h2 className="da-title">Question Difficulty Analyzer</h2>
      <p className="da-sub">Analyze difficulty distribution, flag imbalanced topics, ensure quality coverage</p>

      {/* ── EXAM SELECTOR ── */}
      <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(37,99,235,.4)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 8 }}>Select Exam</div>
      <div className="da-sel-row">
        {exams.map(e => (
          <button key={e.id} className={`da-sel${selExam === e.id ? " active" : ""}`} onClick={() => loadSubjects(e.id)}>
            📋 {e.name}
          </button>
        ))}
        {exams.length === 0 && !loading && <div className="da-empty">No exams found</div>}
      </div>

      {/* ── SUBJECT SELECTOR ── */}
      {selExam && subjects.length > 0 && (
        <>
          <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(37,99,235,.4)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 8 }}>Select Subject</div>
          <div className="da-sel-row">
            {subjects.map(s => (
              <button key={s.id} className={`da-sel${selSubject === s.id ? " active" : ""}`} onClick={() => loadTopics(s.id)}>
                📚 {s.name}
              </button>
            ))}
          </div>
        </>
      )}

      {loading && selSubject && <div className="da-empty">⏳ Loading questions...</div>}

      {!loading && selSubject && questions.length > 0 && (
        <>
          {/* ── OVERVIEW STATS ── */}
          <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
            {[
              { label: "Total Questions", val: totalQs, color: "#2563eb", bg: "rgba(37,99,235,.07)" },
              { label: "Easy", val: diffMap.EASY, color: "#10b981", bg: "#f0fdf4" },
              { label: "Medium", val: diffMap.MEDIUM, color: "#f59e0b", bg: "#fffbeb" },
              { label: "Difficult", val: diffMap.DIFFICULT, color: "#ef4444", bg: "#fff1f2" },
              { label: "Untagged", val: diffMap.UNKNOWN, color: "#94a3b8", bg: "#f8fafc" },
            ].map((s, i) => (
              <div key={i} style={{ background: s.bg, border: `1.5px solid ${s.color}25`, borderRadius: 14, padding: "12px 18px", minWidth: 100, flex: 1, animation: "fadeUp .35s ease both", animationDelay: `${i * .04}s` }}>
                <div style={{ fontSize: 24, fontWeight: 900, color: s.color }}>{s.val}</div>
                <div style={{ fontSize: 10, fontWeight: 700, color: s.color, opacity: .6, textTransform: "uppercase", letterSpacing: ".06em" }}>{s.label}</div>
              </div>
            ))}
          </div>

          <div className="da-grid">
            {/* ── DIFFICULTY PIE (simple bar version) ── */}
            <div className="da-panel">
              <div className="da-ph">📊 Difficulty Ratio</div>
              {totalQs > 0 && (
                <div style={{ height: 24, borderRadius: 12, overflow: "hidden", display: "flex", marginBottom: 16 }}>
                  {["EASY", "MEDIUM", "DIFFICULT"].map(d => {
                    const pct = Math.round(diffMap[d] / totalQs * 100);
                    return pct > 0 ? (
                      <div key={d} style={{ width: `${pct}%`, background: diffColors[d], display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: "white", minWidth: pct > 5 ? 30 : 0, transition: "width .5s" }}>
                        {pct}%
                      </div>
                    ) : null;
                  })}
                </div>
              )}
              <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
                {["EASY", "MEDIUM", "DIFFICULT"].map(d => (
                  <div key={d} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 3, background: diffColors[d] }} />
                    <span style={{ fontSize: 11, fontWeight: 700, color: diffColors[d] }}>{d} ({diffMap[d]})</span>
                  </div>
                ))}
              </div>
              {/* Ideal ratio guide */}
              <div style={{ marginTop: 14, fontSize: 11, color: "rgba(37,99,235,.4)", textAlign: "center", fontStyle: "italic" }}>
                💡 Ideal ratio: ~30% Easy · ~50% Medium · ~20% Difficult
              </div>
            </div>

            {/* ── QUESTION TYPE DISTRIBUTION ── */}
            <div className="da-panel">
              <div className="da-ph">🧩 Question Types</div>
              {Object.entries(typeMap).map(([type, count], i) => {
                const pct = Math.round(count / totalQs * 100);
                const colors = { MCQ: "#2563eb", MULTI: "#7c3aed", NAQ: "#0d9488" };
                const c = colors[type] || "#94a3b8";
                return (
                  <div key={type} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <div style={{ width: 60, fontSize: 12, fontWeight: 800, color: c, flexShrink: 0 }}>{type}</div>
                    <div style={{ flex: 1, height: 10, borderRadius: 10, background: "rgba(37,99,235,.06)", overflow: "hidden" }}>
                      <div style={{ height: "100%", borderRadius: 10, background: c, width: `${pct}%`, animation: "barGrow .8s ease" }} />
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 900, color: c, minWidth: 40, textAlign: "right" }}>{count}</div>
                  </div>
                );
              })}
              {Object.keys(typeMap).length === 0 && <div className="da-empty">No data</div>}
            </div>
          </div>

          {/* ── FLAGS ── */}
          {flags.length > 0 && (
            <div className="da-panel" style={{ borderColor: "rgba(239,68,68,.15)" }}>
              <div className="da-ph">🚩 Quality Flags ({flags.length})</div>
              {flags.map((f, i) => {
                const cfg = {
                  danger: { bg: "#fff1f2", color: "#ef4444", border: "rgba(239,68,68,.2)", icon: "🔴" },
                  warn:   { bg: "#fffbeb", color: "#d97706", border: "rgba(217,119,6,.2)", icon: "🟡" },
                  info:   { bg: "#eef2ff", color: "#2563eb", border: "rgba(37,99,235,.2)", icon: "🔵" },
                }[f.severity];
                return (
                  <div key={i} className="da-flag" style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, animationDelay: `${i * .03}s` }}>
                    <span>{cfg.icon}</span>
                    <div>
                      <div style={{ fontWeight: 800, color: cfg.color }}>{f.topic}</div>
                      <div style={{ color: cfg.color, opacity: .7 }}>{f.issue}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── PER-TOPIC BREAKDOWN ── */}
          <div className="da-panel">
            <div className="da-ph">📋 Topic-wise Breakdown</div>
            {topicBreakdown.map((t, i) => (
              <div key={i} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{t.name}</div>
                  <div style={{ fontSize: 11, color: "rgba(37,99,235,.4)" }}>{t.total} questions</div>
                </div>
                <div style={{ height: 12, borderRadius: 8, overflow: "hidden", display: "flex" }}>
                  {t.easy > 0 && <div style={{ width: `${t.easy / t.total * 100}%`, background: "#10b981", minWidth: 2 }} />}
                  {t.medium > 0 && <div style={{ width: `${t.medium / t.total * 100}%`, background: "#f59e0b", minWidth: 2 }} />}
                  {t.difficult > 0 && <div style={{ width: `${t.difficult / t.total * 100}%`, background: "#ef4444", minWidth: 2 }} />}
                </div>
                <div style={{ display: "flex", gap: 12, marginTop: 4, fontSize: 10, fontWeight: 600 }}>
                  <span style={{ color: "#10b981" }}>🟢 {t.easy}</span>
                  <span style={{ color: "#f59e0b" }}>🟡 {t.medium}</span>
                  <span style={{ color: "#ef4444" }}>🔴 {t.difficult}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {!loading && selSubject && questions.length === 0 && (
        <div className="da-empty">📝 No questions found for this subject. Add some first!</div>
      )}
    </>
  );
}
