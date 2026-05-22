import { useEffect, useState } from "react";
import api from "../Api/axios";

const StudentAnnotations = () => {
  const [annotations, setAnnotations] = useState([]);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    api.get("/user/annotations/my")
      .then((res) => setAnnotations(res.data))
      .catch((err) => console.error("Failed to load annotations", err))
      .finally(() => setLoading(false));
  }, []);

  const tagStyle = (tag) => {
    const map = {
      strength: { bg:"rgba(5,150,105,.09)",  border:"rgba(5,150,105,.22)",  color:"#059669" },
      weakness: { bg:"rgba(220,38,38,.08)",   border:"rgba(220,38,38,.2)",   color:"#dc2626" },
      tip:      { bg:"rgba(99,102,241,.09)",  border:"rgba(99,102,241,.22)", color:"#4f46e5" },
    };
    return map[tag?.toLowerCase()] || { bg:"rgba(99,102,241,.06)", border:"rgba(99,102,241,.14)", color:"rgba(67,56,202,.65)" };
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        @keyframes saFadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes saSpin    { to{ transform:rotate(360deg); } }

        .sa2-title {
          font-family:'Plus Jakarta Sans',sans-serif;
          font-size:17px;font-weight:800;color:#1e1b4b;
          display:flex;align-items:center;gap:9px;margin-bottom:18px;
        }
        .sa2-count {
          font-size:12.5px;font-weight:500;
          color:rgba(99,102,241,.45);
        }
        .sa2-spinner-wrap { display:flex;align-items:center;justify-content:center;padding:48px; }
        .sa2-spinner { width:28px;height:28px;border-radius:50%;border:3px solid rgba(99,102,241,.15);border-top-color:#6366f1;animation:saSpin .7s linear infinite; }

        .sa2-empty {
          text-align:center;padding:48px 28px;
          background:rgba(255,255,255,.7);backdrop-filter:blur(16px);
          border:1.5px dashed rgba(99,102,241,.18);border-radius:18px;
          color:rgba(99,102,241,.45);
        }
        .sa2-empty-icon { font-size:36px;margin-bottom:10px; }
        .sa2-empty h3 { font-size:15px;font-weight:700;color:#1e1b4b;margin-bottom:5px; }
        .sa2-empty p  { font-size:13px; }

        .sa2-card {
          background:rgba(255,255,255,.82);
          backdrop-filter:blur(20px) saturate(180%);
          -webkit-backdrop-filter:blur(20px) saturate(180%);
          border:1.5px solid rgba(99,102,241,.12);
          border-radius:18px;padding:16px 18px;
          box-shadow:0 2px 16px rgba(99,102,241,.07),inset 0 1px 0 rgba(255,255,255,.9);
          animation:saFadeUp .4s ease both;
        }
        .sa2-card-hdr { display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:10px; }
        .sa2-card-left { display:flex;align-items:center;gap:9px; }
        .sa2-avatar { font-size:18px;width:32px;height:32px;border-radius:9px;background:rgba(99,102,241,.1);display:flex;align-items:center;justify-content:center; }
        .sa2-attempt { font-size:13px;font-weight:700;color:#1e1b4b; }
        .sa2-card-right { display:flex;align-items:center;gap:8px; }
        .sa2-tag {
          font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px;
          border:1.5px solid;text-transform:capitalize;
        }
        .sa2-date { font-size:11px;color:rgba(99,102,241,.4); }
        .sa2-note { font-size:13.5px;color:rgba(67,56,202,.7);line-height:1.72;padding-left:41px; }
      `}</style>

      {loading ? (
        <div className="sa2-spinner-wrap"><div className="sa2-spinner" /></div>
      ) : annotations.length === 0 ? (
        <div className="sa2-empty">
          <div className="sa2-empty-icon">📝</div>
          <h3>No teacher feedback yet</h3>
          <p>Your teacher's annotations will appear here</p>
        </div>
      ) : (
        <>
          <div className="sa2-title">
            📋 Teacher Feedback
            <span className="sa2-count">
              ({annotations.length} note{annotations.length !== 1 ? "s" : ""})
            </span>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {annotations.map((a, i) => {
              const ts = tagStyle(a.tag);
              return (
                <div key={a.id} className="sa2-card" style={{ animationDelay:`${i * .06}s` }}>
                  <div className="sa2-card-hdr">
                    <div className="sa2-card-left">
                      <div className="sa2-avatar">👨‍🏫</div>
                      <span className="sa2-attempt">Attempt #{a.attemptId}</span>
                    </div>
                    <div className="sa2-card-right">
                      {a.tag && (
                        <span
                          className="sa2-tag"
                          style={{ background:ts.bg, borderColor:ts.border, color:ts.color }}
                        >
                          {a.tag}
                        </span>
                      )}
                      <span className="sa2-date">
                        {a.createdAt
                          ? new Date(a.createdAt).toLocaleDateString("en-IN", {
                              day:"numeric", month:"short", year:"numeric",
                            })
                          : ""}
                      </span>
                    </div>
                  </div>
                  <p className="sa2-note">{a.note}</p>
                </div>
              );
            })}
          </div>
        </>
      )}
    </>
  );
};

export default StudentAnnotations;
