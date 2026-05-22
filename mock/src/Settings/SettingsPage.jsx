import { useEffect, useState } from "react";
import StressConfigPanel    from "./StressConfigPanel";
import StudentAnnotations   from "./StudentAnnotations";
import api                  from "../Component/Api/axios";
import UserLayout           from "../Component/User/UserLayout";
import BehavioralChart      from "./Behavioralchart";

const SESSION_MAP_KEY = "ep_session_map";

const getSessionIdForAttempt = (attemptId) => {
  try {
    const map = JSON.parse(localStorage.getItem(SESSION_MAP_KEY) || "{}");
    return map[String(attemptId)] ?? null;
  } catch { return null; }
};

const TABS = [
  { id: "stress",      label: "Stress Settings",    icon: "🧠" },
  { id: "behavior",    label: "Behavioral Analysis", icon: "📊" },
  { id: "annotations", label: "Teacher Feedback",    icon: "📋" },
];

const SettingsPage = () => {
  const [tab,             setTab]       = useState("stress");
  const [attempts,        setAttempts]  = useState([]);
  const [selectedAttempt, setSelected]  = useState(null);
  const [sessionId,       setSessionId] = useState(null);
  const [noMapping,       setNoMapping] = useState(false);

  useEffect(() => {
    api.get("/user/test/attempts")
      .then(res => setAttempts(res.data || []))
      .catch(() => {});
  }, []);

  const handleSelect = (e) => {
    const idx = e.target.value;
    if (!idx) { setSelected(null); setSessionId(null); setNoMapping(false); return; }
    const a = attempts[Number(idx)];
    setSelected(a); setNoMapping(false);
    const storedSid = getSessionIdForAttempt(a.attemptId);
    if (storedSid) { setSessionId(Number(storedSid)); }
    else { setSessionId(null); setNoMapping(true); }
  };

  const formatDate = (d) => {
    if (!d) return "";
    try {
      return new Date(d).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" });
    } catch { return ""; }
  };

  const attemptLabel = (a) => {
    const score  = Number(a.scorePercent);
    const sStr   = isNaN(score) ? "?" : score.toFixed(1);
    const date   = formatDate(a.attemptedAt);
    const exam   = a.examName  || "Exam";
    const topic  = a.topicName || "Topic";
    return `${exam} — ${topic} (${sStr}%)${date ? " · " + date : ""}`;
  };

  return (
    <UserLayout>
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');

          @keyframes sp2FadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }

          .sp2-root { font-family:'Plus Jakarta Sans',sans-serif; max-width:760px; margin:0 auto; }

          /* eyebrow + title */
          .sp2-eyebrow {
            display:inline-flex;align-items:center;gap:6px;
            font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;
            color:#6366f1;background:rgba(99,102,241,.09);
            border:1px solid rgba(99,102,241,.18);border-radius:20px;
            padding:4px 12px;margin-bottom:10px;
          }
          .sp2-eyebrow::before { content:'';width:5px;height:5px;border-radius:50%;background:#6366f1; }
          .sp2-title {
            font-size:26px;font-weight:900;letter-spacing:-.03em;color:#1e1b4b;
            margin-bottom:4px;animation:sp2FadeUp .4s ease both;
          }
          .sp2-sub {
            font-size:14px;color:rgba(99,102,241,.5);font-weight:400;
            margin-bottom:28px;animation:sp2FadeUp .4s ease .05s both;
          }

          /* Tabs */
          .sp2-tabs {
            display:flex;gap:6px;margin-bottom:24px;
            background:rgba(255,255,255,.7);backdrop-filter:blur(16px);
            border:1.5px solid rgba(99,102,241,.12);
            border-radius:16px;padding:5px;
            flex-wrap:wrap;
            box-shadow:0 2px 14px rgba(99,102,241,.07),inset 0 1px 0 rgba(255,255,255,.9);
          }
          .sp2-tab {
            display:flex;align-items:center;gap:7px;
            padding:9px 18px;border-radius:12px;
            font-size:13px;font-weight:600;cursor:pointer;
            background:none;border:none;color:rgba(67,56,202,.55);
            font-family:'Plus Jakarta Sans',sans-serif;
            transition:all .2s;flex:1;justify-content:center;white-space:nowrap;
          }
          .sp2-tab:hover { color:#4338ca;background:rgba(238,240,255,.7); }
          .sp2-tab.active {
            background:linear-gradient(135deg,#6366f1,#8b5cf6);
            color:#fff;font-weight:700;
            box-shadow:0 3px 14px rgba(99,102,241,.35);
          }
          .sp2-tab-icon { font-size:15px; }

          /* tab body */
          .sp2-body { animation:sp2FadeUp .35s ease both; }

          /* attempt selector */
          .sp2-select-label {
            font-size:12.5px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;
            color:rgba(99,102,241,.5);margin-bottom:8px;
          }
          .sp2-select {
            width:100%;padding:11px 14px;border-radius:13px;
            background:rgba(255,255,255,.82);backdrop-filter:blur(14px);
            border:1.5px solid rgba(99,102,241,.15);
            color:#1e1b4b;font-family:'Plus Jakarta Sans',sans-serif;
            font-size:13.5px;font-weight:500;outline:none;cursor:pointer;
            transition:all .2s;appearance:none;
            background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='7' viewBox='0 0 12 7'%3E%3Cpath d='M1 1l5 5 5-5' fill='none' stroke='%236366f1' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
            background-repeat:no-repeat;background-position:right 14px center;
            padding-right:38px;
          }
          .sp2-select:focus { border-color:#6366f1;box-shadow:0 0 0 3px rgba(99,102,241,.12); }

          /* attempt summary strip */
          .sp2-attempt-summary {
            margin-top:10px;padding:12px 16px;
            background:rgba(238,240,255,.6);backdrop-filter:blur(12px);
            border:1.5px solid rgba(99,102,241,.14);border-radius:13px;
            display:flex;gap:20px;flex-wrap:wrap;
          }
          .sp2-summary-item { font-size:12.5px;color:rgba(67,56,202,.6);font-weight:500; }
          .sp2-summary-item strong { font-weight:800; }

          /* no mapping warning */
          .sp2-warn {
            margin-top:10px;padding:12px 16px;
            background:rgba(251,191,36,.07);backdrop-filter:blur(8px);
            border:1.5px solid rgba(251,191,36,.3);border-radius:13px;
            font-size:13px;color:#92400e;font-weight:500;line-height:1.6;
          }

          /* no attempts */
          .sp2-no-attempts {
            padding:20px;text-align:center;
            background:rgba(255,255,255,.7);backdrop-filter:blur(12px);
            border:1.5px dashed rgba(99,102,241,.18);border-radius:14px;
            font-size:13px;color:rgba(99,102,241,.45);
          }

          .sp2-select-wrap { margin-bottom:22px; }
        `}</style>

        <div className="sp2-root">
          {/* Page header */}
          <div className="sp2-eyebrow">Settings</div>
          <h1 className="sp2-title">Settings & Analytics</h1>
          <p className="sp2-sub">Configure your exam experience and review your performance data</p>

          {/* Tabs */}
          <div className="sp2-tabs">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`sp2-tab${tab === t.id ? " active" : ""}`}
              >
                <span className="sp2-tab-icon">{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab bodies */}
          <div className="sp2-body" key={tab}>

            {/* ── Stress Settings ── */}
            {tab === "stress" && <StressConfigPanel />}

            {/* ── Behavioral Analysis ── */}
            {tab === "behavior" && (
              <div>
                <div className="sp2-select-wrap">
                  <div className="sp2-select-label">Select Attempt</div>

                  {attempts.length === 0 ? (
                    <div className="sp2-no-attempts">
                      No attempts found. Complete a test first to see behavioral analysis.
                    </div>
                  ) : (
                    <select
                      defaultValue=""
                      onChange={handleSelect}
                      className="sp2-select"
                    >
                      <option value="">— Select an attempt —</option>
                      {attempts.map((a, i) => (
                        <option key={i} value={i}>{attemptLabel(a)}</option>
                      ))}
                    </select>
                  )}

                  {/* Attempt summary */}
                  {selectedAttempt && (
                    <div className="sp2-attempt-summary">
                      <span className="sp2-summary-item">
                        Correct: <strong style={{ color:"#059669" }}>{selectedAttempt.correct}</strong>/{selectedAttempt.total}
                      </span>
                      <span className="sp2-summary-item">
                        Score: <strong style={{ color:"#4f46e5" }}>{Number(selectedAttempt.scorePercent).toFixed(1)}%</strong>
                      </span>
                      <span className="sp2-summary-item">
                        Wrong: <strong style={{ color:"#dc2626" }}>{selectedAttempt.wrong}</strong>
                      </span>
                    </div>
                  )}

                  {/* No mapping warning */}
                  {noMapping && (
                    <div className="sp2-warn">
                      ⚠️ No behavioral data for this attempt. Behavioral tracking only works for tests taken
                      <strong> after </strong> the latest update. Complete a new test to see analysis.
                    </div>
                  )}
                </div>

                {sessionId && <BehavioralChart sessionId={sessionId} />}
              </div>
            )}

            {/* ── Teacher Feedback ── */}
            {tab === "annotations" && <StudentAnnotations />}
          </div>
        </div>
      </>
    </UserLayout>
  );
};

export default SettingsPage;