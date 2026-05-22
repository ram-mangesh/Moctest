import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../Api/axios";
import { useTranslation } from "react-i18next";
import RoadmapPdfButton from "../Component/RoadmapPdfButton";

const Result = () => {
  const { t }        = useTranslation();
  const location     = useLocation();
  const navigate     = useNavigate();

  const state = location.state || {};
  const {
    total = 0, correct = 0, wrong = 0,
    weakTopics = [], aiRecommendation = "", attemptId = null,
  } = state;

  const [aiText, setAiText] = useState(aiRecommendation);

  const percentage = total > 0 ? ((correct / total) * 100).toFixed(1) : 0;
  const pct        = Number(percentage);
  const isPass     = pct >= 40;

  const scoreColor = pct >= 80 ? "#059669" : pct >= 60 ? "#d97706" : pct >= 40 ? "#4f46e5" : "#dc2626";

  /* Poll AI result */
  useEffect(() => {
    if (!attemptId) return;
    let stopped = false;
    const interval = setInterval(async () => {
      try {
        const res = await api.get(`/user/test/ai-result?attemptId=${attemptId}`);
        if (!stopped && res.data?.aiRecommendation?.trim()) {
          setAiText(res.data.aiRecommendation);
          clearInterval(interval);
        }
      } catch {}
    }, 3000);
    return () => { stopped = true; clearInterval(interval); };
  }, [attemptId]);

  if (!location.state) {
    return (
      <div style={{
        height: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 15, color: "rgba(99,102,241,.5)",
        background: "linear-gradient(160deg,#eef0ff 0%,#e8ecff 35%,#f0eaff 70%,#fce8f3 100%)",
      }}>
        {t("result.noResult", "No result to display")}
      </div>
    );
  }

  const ringGrad = `conic-gradient(${scoreColor} ${pct * 3.6}deg, rgba(99,102,241,.1) 0deg)`;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes orbFloat1 { 0%{transform:translate(0,0)scale(1)} 100%{transform:translate(50px,70px)scale(1.1)} }
        @keyframes orbFloat2 { 0%{transform:translate(0,0)scale(1)} 100%{transform:translate(-45px,55px)scale(1.08)} }

        .rp2-root {
          font-family: 'Plus Jakarta Sans', sans-serif;
          min-height: 100vh; position: relative;
          background: linear-gradient(160deg, #eef0ff 0%, #e8ecff 35%, #f0eaff 70%, #fce8f3 100%);
          display: flex; align-items: flex-start; justify-content: center;
          padding: 48px 20px 64px;
        }

        /* background orbs */
        .rp2-bg { position: fixed; inset: 0; z-index: 0; pointer-events: none; overflow: hidden; }
        .rp2-orb { position: absolute; border-radius: 50%; filter: blur(80px); }
        .rp2-o1 { width:500px;height:500px;top:-160px;left:-100px; background:radial-gradient(circle,rgba(99,102,241,.15)0%,transparent 65%); animation:orbFloat1 22s ease-in-out infinite alternate; }
        .rp2-o2 { width:420px;height:420px;bottom:-80px;right:-60px; background:radial-gradient(circle,rgba(168,85,247,.12)0%,transparent 65%); animation:orbFloat2 26s ease-in-out infinite alternate 5s; }
        .rp2-grid { position:fixed;inset:0;z-index:0;pointer-events:none; background-image:radial-gradient(circle,rgba(99,102,241,.12)1px,transparent 1px); background-size:30px 30px; opacity:.2; }

        .rp2-wrap {
          position: relative; z-index: 1;
          width: 100%; max-width: 560px;
          display: flex; flex-direction: column; gap: 16px;
          animation: fadeUp .4s ease both;
        }

        .rp2-back-btn {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 13px; font-weight: 600;
          color: rgba(99,102,241,.55); background: none; border: none;
          cursor: pointer; padding: 0; font-family: 'Plus Jakarta Sans', sans-serif;
          transition: color .14s; margin-bottom: 4px;
        }
        .rp2-back-btn:hover { color: #6366f1; }

        /* main result card */
        .rp2-card {
          background: rgba(255,255,255,.85);
          backdrop-filter: blur(24px) saturate(180%);
          -webkit-backdrop-filter: blur(24px) saturate(180%);
          border: 1.5px solid rgba(99,102,241,.13);
          border-radius: 22px; overflow: hidden;
          box-shadow: 0 8px 40px rgba(99,102,241,.12), inset 0 1px 0 rgba(255,255,255,.95);
        }
        .rp2-card-stripe { height: 4px; }
        .rp2-card-body { padding: 28px 30px; }

        /* hero */
        .rp2-hero {
          display: flex; align-items: center; gap: 22px;
          padding-bottom: 22px; margin-bottom: 22px;
          border-bottom: 1px solid rgba(99,102,241,.09);
        }
        .rp2-ring-wrap { position: relative; width: 100px; height: 100px; flex-shrink: 0; }
        .rp2-ring-outer { width:100px;height:100px;border-radius:50%; display:flex;align-items:center;justify-content:center; }
        .rp2-ring-inner {
          position: absolute; inset: 10px; border-radius: 50%;
          background: rgba(255,255,255,.95);
          display: flex; flex-direction: column; align-items: center; justify-content: center;
        }
        .rp2-score-num { font-size: 20px; font-weight: 900; letter-spacing: -.04em; line-height: 1; }
        .rp2-score-sub { font-size: 9px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: rgba(99,102,241,.4); margin-top: 2px; }

        .rp2-result-lbl { font-size: 11px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: rgba(99,102,241,.4); margin-bottom: 6px; }
        .rp2-title { font-size: 22px; font-weight: 900; color: #1e1b4b; letter-spacing: -.03em; margin: 0 0 10px; }
        .rp2-pass-chip {
          display: inline-flex; align-items: center; gap: 5px;
          font-size: 12px; font-weight: 700;
          padding: 5px 13px; border-radius: 20px; border: 1.5px solid;
        }

        /* stats row */
        .rp2-stats {
          display: grid; grid-template-columns: repeat(3,1fr); gap: 10px; margin-bottom: 22px;
        }
        .rp2-stat {
          padding: 14px; border-radius: 13px; border: 1.5px solid;
          text-align: center;
          background: rgba(255,255,255,.7); backdrop-filter: blur(8px);
        }
        .rp2-stat-val { font-size: 26px; font-weight: 900; letter-spacing: -.04em; display: block; line-height: 1; margin-bottom: 5px; }
        .rp2-stat-lbl { font-size: 10px; font-weight: 700; letter-spacing: .09em; text-transform: uppercase; color: rgba(99,102,241,.4); }

        .rp2-divider { height: 1px; background: rgba(99,102,241,.09); margin: 0 0 18px; }
        .rp2-sec-lbl { font-size: 11px; font-weight: 700; letter-spacing: .09em; text-transform: uppercase; color: rgba(99,102,241,.4); margin-bottom: 10px; }

        /* weak topics */
        .rp2-no-weak {
          display: flex; align-items: center; gap: 9px;
          font-size: 13px; font-weight: 600; color: #059669;
          background: rgba(5,150,105,.07); border: 1.5px solid rgba(5,150,105,.2);
          border-radius: 11px; padding: 11px 14px;
        }
        .rp2-weak-list { display: flex; flex-direction: column; gap: 7px; list-style: none; }
        .rp2-weak-item {
          display: flex; align-items: center; gap: 9px;
          font-size: 13.5px; font-weight: 500; color: #1e1b4b;
          padding: 10px 14px;
          background: rgba(220,38,38,.05); border: 1.5px solid rgba(220,38,38,.15);
          border-radius: 11px;
        }
        .rp2-weak-dot { width: 6px; height: 6px; border-radius: 50%; background: #dc2626; flex-shrink: 0; }

        /* AI card */
        .rp2-ai-card {
          background: rgba(255,255,255,.85);
          backdrop-filter: blur(24px) saturate(180%);
          -webkit-backdrop-filter: blur(24px) saturate(180%);
          border: 1.5px solid rgba(99,102,241,.13);
          border-radius: 20px; overflow: hidden;
          box-shadow: 0 4px 24px rgba(99,102,241,.09), inset 0 1px 0 rgba(255,255,255,.9);
        }
        .rp2-ai-hdr {
          display: flex; align-items: center; gap: 10px;
          padding: 15px 20px; border-bottom: 1px solid rgba(99,102,241,.09);
          background: rgba(238,240,255,.5);
        }
        .rp2-ai-icon {
          width: 32px; height: 32px; border-radius: 9px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          display: flex; align-items: center; justify-content: center;
          font-size: 16px; flex-shrink: 0;
        }
        .rp2-ai-title { font-size: 13px; font-weight: 700; color: #1e1b4b; flex: 1; }
        .rp2-spinner {
          width: 14px; height: 14px; border-radius: 50%;
          border: 2px solid rgba(99,102,241,.2); border-top-color: #6366f1;
          animation: spin .7s linear infinite;
        }
        @keyframes spin { to{ transform: rotate(360deg); } }
        .rp2-ai-body { padding: 18px 20px; }
        .rp2-ai-text { font-size: 13.5px; line-height: 1.78; color: rgba(67,56,202,.75); white-space: pre-line; margin: 0; }
        .rp2-ai-gen  { font-size: 13px; color: rgba(99,102,241,.4); font-style: italic; }

        /* actions */
        .rp2-actions { display: flex; gap: 10px; }
        .rp2-btn-secondary {
          flex: 1; padding: 12px 20px; border-radius: 13px;
          font-size: 14px; font-weight: 600;
          background: rgba(255,255,255,.8); color: rgba(67,56,202,.7);
          border: 1.5px solid rgba(99,102,241,.18); cursor: pointer;
          backdrop-filter: blur(8px);
          transition: all .15s; font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .rp2-btn-secondary:hover {
          background: rgba(238,240,255,.9); border-color: rgba(99,102,241,.35);
          transform: translateY(-1px);
        }
        .rp2-btn-primary {
          flex: 1; padding: 12px 20px; border-radius: 13px;
          font-size: 14px; font-weight: 800;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: #fff; border: none; cursor: pointer;
          box-shadow: 0 4px 16px rgba(99,102,241,.35);
          transition: all .18s; font-family: 'Plus Jakarta Sans', sans-serif;
          position: relative; overflow: hidden;
        }
        .rp2-btn-primary::before {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(120deg, transparent, rgba(255,255,255,.2), transparent);
          transform: translateX(-100%); transition: transform .5s;
        }
        .rp2-btn-primary:hover::before { transform: translateX(100%); }
        .rp2-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(99,102,241,.45); }
      `}</style>

      <div className="rp2-root">
        <div className="rp2-bg">
          <div className="rp2-orb rp2-o1" />
          <div className="rp2-orb rp2-o2" />
        </div>
        <div className="rp2-grid" />

        <div className="rp2-wrap">
          <button className="rp2-back-btn" onClick={() => navigate(-1)}>
            ← {t("common.back", "Back")}
          </button>

          {/* Main card */}
          <div className="rp2-card">
            <div
              className="rp2-card-stripe"
              style={{
                background: isPass
                  ? "linear-gradient(90deg, #059669, #10b981, #34d399)"
                  : "linear-gradient(90deg, #dc2626, #ef4444, #fca5a5)",
              }}
            />
            <div className="rp2-card-body">
              {/* Hero */}
              <div className="rp2-hero">
                <div className="rp2-ring-wrap">
                  <div className="rp2-ring-outer" style={{ background: ringGrad }}>
                    <div className="rp2-ring-inner">
                      <span className="rp2-score-num" style={{ color: scoreColor }}>{percentage}%</span>
                      <span className="rp2-score-sub">Score</span>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="rp2-result-lbl">{t("result.title", "Your Result")}</div>
                  <h2 className="rp2-title">
                    {isPass ? t("result.pass", "Well done!") : t("result.needsImprovement", "Keep practising")}
                  </h2>
                  <span
                    className="rp2-pass-chip"
                    style={isPass
                      ? { color: "#059669", background: "rgba(5,150,105,.08)", borderColor: "rgba(5,150,105,.25)" }
                      : { color: "#dc2626", background: "rgba(220,38,38,.07)", borderColor: "rgba(220,38,38,.22)" }
                    }
                  >
                    {isPass ? "✓ Passed" : "✗ Failed"}
                    <span style={{ color: "rgba(99,102,241,.4)", fontWeight: 400 }}>· 40% pass mark</span>
                  </span>
                </div>
              </div>

              {/* Stats */}
              <div className="rp2-stats">
                <div className="rp2-stat" style={{ borderColor: "rgba(99,102,241,.14)" }}>
                  <span className="rp2-stat-val" style={{ color: "#1e1b4b" }}>{total}</span>
                  <span className="rp2-stat-lbl">{t("result.total", "Total")}</span>
                </div>
                <div className="rp2-stat" style={{ borderColor: "rgba(5,150,105,.2)" }}>
                  <span className="rp2-stat-val" style={{ color: "#059669" }}>{correct}</span>
                  <span className="rp2-stat-lbl">{t("result.correct", "Correct")}</span>
                </div>
                <div className="rp2-stat" style={{ borderColor: "rgba(220,38,38,.18)" }}>
                  <span className="rp2-stat-val" style={{ color: "#dc2626" }}>{wrong}</span>
                  <span className="rp2-stat-lbl">{t("result.wrong", "Wrong")}</span>
                </div>
              </div>

              <div className="rp2-divider" />

              {/* Weak topics */}
              <div className="rp2-sec-lbl">{t("result.weakTopics", "Weak Topics")}</div>
              {weakTopics.length === 0 ? (
                <div className="rp2-no-weak">
                  <span>✓</span>
                  {t("result.noWeakTopics", "No weak topics — great performance!")}
                </div>
              ) : (
                <ul className="rp2-weak-list">
                  {weakTopics.map((tp, i) => (
                    <li key={i} className="rp2-weak-item">
                      <span className="rp2-weak-dot" />
                      {tp}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* AI recommendation */}
          <div className="rp2-ai-card">
            <div className="rp2-ai-hdr">
              <div className="rp2-ai-icon">🤖</div>
              <span className="rp2-ai-title">{t("result.aiRecommendation", "AI Recommendation")}</span>
              {!aiText && <span className="rp2-spinner" />}
            </div>
            <div className="rp2-ai-body">
              {aiText ? (
                <p className="rp2-ai-text">{aiText}</p>
              ) : (
                <p className="rp2-ai-gen">
                  {t("result.aiGenerating", "Generating personalised recommendations…")}
                </p>
              )}
              <div style={{ marginTop: 16 }}>
                <RoadmapPdfButton attemptId={attemptId} />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="rp2-actions">
            <button className="rp2-btn-secondary" onClick={() => navigate(-1)}>
              ← {t("common.back", "Back")}
            </button>
            <button className="rp2-btn-primary" onClick={() => navigate("/")}>
              ↺ {t("result.retry", "Try Again")}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Result;
