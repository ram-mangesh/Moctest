import { useEffect, useState } from "react";
import api from "../Component/Api/axios";

const StudentAnnotations = () => {
  const [annotations, setAnnotations] = useState([]);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    api.get("/user/annotations/my")
      .then(res  => setAnnotations(res.data))
      .catch(err => console.error("Failed to load annotations", err))
      .finally(()  => setLoading(false));
  }, []);

  const tagStyle = (tag) => {
    const map = {
      strength: { bg:"rgba(5,150,105,.09)",  border:"rgba(5,150,105,.22)",  color:"#059669", icon:"💪" },
      weakness: { bg:"rgba(220,38,38,.08)",   border:"rgba(220,38,38,.2)",   color:"#dc2626", icon:"⚠️" },
      tip:      { bg:"rgba(99,102,241,.09)",  border:"rgba(99,102,241,.22)", color:"#4f46e5", icon:"💡" },
    };
    return map[tag?.toLowerCase()] || {
      bg:"rgba(99,102,241,.06)", border:"rgba(99,102,241,.14)",
      color:"rgba(67,56,202,.65)", icon:"📌",
    };
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        @keyframes sa2FadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes sa2Spin   { to { transform:rotate(360deg); } }

        .sa2-root { font-family:'Plus Jakarta Sans',sans-serif; max-width:680px; margin:0 auto; }

        .sa2-spinner-wrap { display:flex;align-items:center;justify-content:center;padding:48px; }
        .sa2-spinner { width:28px;height:28px;border-radius:50%;border:3px solid rgba(99,102,241,.15);border-top-color:#6366f1;animation:sa2Spin .7s linear infinite; }

        .sa2-empty {
          text-align:center;padding:52px 28px;
          background:rgba(255,255,255,.75);backdrop-filter:blur(16px);
          border:1.5px dashed rgba(99,102,241,.18);border-radius:18px;
        }
        .sa2-empty-icon { font-size:38px;margin-bottom:12px; }
        .sa2-empty-title { font-size:15px;font-weight:700;color:#1e1b4b;margin-bottom:5px; }
        .sa2-empty-sub   { font-size:13px;color:rgba(99,102,241,.45); }

        .sa2-title {
          font-size:16px;font-weight:800;color:#1e1b4b;
          display:flex;align-items:center;gap:9px;margin-bottom:18px;
          letter-spacing:-.01em;
        }
        .sa2-count-chip {
          font-size:11.5px;font-weight:600;
          background:rgba(99,102,241,.09);border:1px solid rgba(99,102,241,.18);
          color:rgba(67,56,202,.65);padding:3px 10px;border-radius:20px;
        }

        .sa2-list { display:flex;flex-direction:column;gap:12px; }

        .sa2-card {
          background:rgba(255,255,255,.82);
          backdrop-filter:blur(20px) saturate(180%);
          -webkit-backdrop-filter:blur(20px) saturate(180%);
          border:1.5px solid rgba(99,102,241,.12);
          border-radius:18px;padding:16px 18px;
          box-shadow:0 2px 16px rgba(99,102,241,.07),inset 0 1px 0 rgba(255,255,255,.9);
          transition:border-color .2s,box-shadow .2s;
          animation:sa2FadeUp .4s ease both;
          position:relative;overflow:hidden;
        }
        .sa2-card::before {
          content:'';position:absolute;top:0;left:0;right:0;height:3px;
          transform:scaleX(0);transform-origin:left;transition:transform .3s;
        }
        .sa2-card:hover { border-color:rgba(99,102,241,.28);box-shadow:0 6px 26px rgba(99,102,241,.13); }
        .sa2-card:hover::before { transform:scaleX(1); }

        .sa2-card-hdr {
          display:flex;align-items:flex-start;justify-content:space-between;
          margin-bottom:10px;gap:12px;
        }
        .sa2-card-left { display:flex;align-items:center;gap:9px; }
        .sa2-teacher-icon {
          width:32px;height:32px;border-radius:10px;
          background:rgba(99,102,241,.1);border:1px solid rgba(99,102,241,.18);
          display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;
        }
        .sa2-attempt-lbl { font-size:13px;font-weight:700;color:#1e1b4b; }
        .sa2-attempt-sub { font-size:11px;color:rgba(99,102,241,.45);margin-top:1px; }

        .sa2-card-right { display:flex;align-items:center;gap:7px;flex-shrink:0; }
        .sa2-tag {
          display:inline-flex;align-items:center;gap:4px;
          font-size:11px;font-weight:700;
          padding:3px 10px;border-radius:20px;border:1.5px solid;
          text-transform:capitalize;
        }
        .sa2-date { font-size:11px;color:rgba(99,102,241,.38);font-weight:500; }

        .sa2-note {
          font-size:13.5px;color:rgba(67,56,202,.72);
          line-height:1.72;padding-left:41px;
          border-top:1px solid rgba(99,102,241,.07);
          padding-top:10px;margin-top:0;
        }
      `}</style>

      <div className="sa2-root">
        {loading ? (
          <div className="sa2-spinner-wrap"><div className="sa2-spinner" /></div>
        ) : annotations.length === 0 ? (
          <div className="sa2-empty">
            <div className="sa2-empty-icon">📝</div>
            <div className="sa2-empty-title">No teacher feedback yet</div>
            <div className="sa2-empty-sub">Your teacher's annotations will appear here</div>
          </div>
        ) : (
          <>
            <div className="sa2-title">
              📋 Teacher Feedback
              <span className="sa2-count-chip">
                {annotations.length} note{annotations.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="sa2-list">
              {annotations.map((a, i) => {
                const ts = tagStyle(a.tag);
                return (
                  <div
                    key={a.id}
                    className="sa2-card"
                    style={{ animationDelay:`${i * .06}s` }}
                  >
                    {/* gradient top bar matching tag colour */}
                    <div style={{
                      position:"absolute", top:0, left:0, right:0, height:3,
                      background:`linear-gradient(90deg,${ts.color},${ts.color}88)`,
                      transform:"scaleX(1)", borderRadius:"18px 18px 0 0",
                      opacity:.7,
                    }} />

                    <div className="sa2-card-hdr">
                      <div className="sa2-card-left">
                        <div className="sa2-teacher-icon">👨‍🏫</div>
                        <div>
                          <div className="sa2-attempt-lbl">Attempt #{a.attemptId}</div>
                          {a.createdAt && (
                            <div className="sa2-attempt-sub">
                              {new Date(a.createdAt).toLocaleDateString("en-IN", {
                                day:"numeric", month:"short", year:"numeric",
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="sa2-card-right">
                        {a.tag && (
                          <span
                            className="sa2-tag"
                            style={{ background:ts.bg, borderColor:ts.border, color:ts.color }}
                          >
                            {ts.icon} {a.tag}
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="sa2-note">{a.note}</p>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default StudentAnnotations;