import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../Api/axios";
import UserLayout from "../User/UserLayout";

const DURATIONS = [
  { value: 1800, label: "30 minutes",  desc: "Quick session" },
  { value: 2700, label: "45 minutes",  desc: "Standard session" },
  { value: 3600, label: "60 minutes",  desc: "Full session" },
];

const RealExamPreviewPage = () => {
  const { examId } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [duration, setDuration] = useState(1800);

  useEffect(() => {
    api.get(`/real-exam/preview?examId=${examId}`).then(res => setData(res.data));
  }, [examId]);

  const progressPct = data
    ? Math.round(((data.totalQuestions - data.remainingQuestions) / data.totalQuestions) * 100)
    : 0;

  return (
    <UserLayout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@500;600&family=Lora:wght@500;600&display=swap');

        .prev-root {
          font-family: 'DM Sans', sans-serif;
          min-height: 100vh;
          background: #f5f3ee;
          padding: 36px 40px;
          max-width: 640px;
          margin: 0 auto;
        }

        .prev-back {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 500;
          color: #78716c;
          cursor: pointer;
          margin-bottom: 28px;
          transition: color 0.14s;
          background: none;
          border: none;
          padding: 0;
          font-family: 'DM Sans', sans-serif;
        }

        .prev-back:hover { color: #1c1917; }

        .prev-card {
          background: #fff;
          border: 1px solid #e7e5e4;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.04);
        }

        /* Top accent stripe */
        .prev-card-top {
          height: 4px;
          background: linear-gradient(90deg, #c2410c, #d97706, #15803d);
        }

        .prev-card-body {
          padding: 32px 36px;
        }

        .prev-eyebrow {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #c2410c;
          margin-bottom: 8px;
        }

        .prev-exam-title {
          font-family: 'Lora', serif;
          font-size: 26px;
          font-weight: 600;
          color: #1c1917;
          margin: 0 0 24px 0;
          line-height: 1.3;
        }

        /* Stats row */
        .prev-stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 28px;
        }

        .prev-stat {
          padding: 16px 18px;
          border-radius: 10px;
          border: 1px solid;
        }

        .prev-stat-val {
          font-family: 'DM Mono', monospace;
          font-size: 28px;
          font-weight: 600;
          display: block;
          line-height: 1;
          margin-bottom: 4px;
        }

        .prev-stat-label {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          color: #a8a29e;
        }

        /* Progress bar */
        .prev-progress-section {
          margin-bottom: 28px;
        }

        .prev-progress-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .prev-progress-label {
          font-size: 12px;
          font-weight: 600;
          color: #78716c;
          letter-spacing: 0.04em;
        }

        .prev-progress-pct {
          font-family: 'DM Mono', monospace;
          font-size: 12px;
          font-weight: 600;
          color: #1c1917;
        }

        .prev-progress-track {
          height: 6px;
          background: #f0ece8;
          border-radius: 99px;
          overflow: hidden;
        }

        .prev-progress-fill {
          height: 100%;
          border-radius: 99px;
          background: #c2410c;
          transition: width 0.6s ease;
        }

        .prev-divider {
          height: 1px;
          background: #f0ece8;
          margin: 24px 0;
        }

        /* Duration selector */
        .prev-duration-label {
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          color: #78716c;
          margin-bottom: 12px;
          display: block;
        }

        .prev-duration-options {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 28px;
        }

        .prev-dur-btn {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 13px 16px;
          border-radius: 10px;
          border: 1.5px solid;
          cursor: pointer;
          transition: all 0.14s;
          background: #fff;
          font-family: 'DM Sans', sans-serif;
          text-align: left;
          width: 100%;
        }

        .prev-dur-btn:hover {
          border-color: #c2410c;
          background: #fff8f5;
        }

        .prev-dur-btn-active {
          border-color: #c2410c !important;
          background: #fff4ed !important;
        }

        .prev-dur-name {
          font-size: 15px;
          font-weight: 600;
          color: #1c1917;
        }

        .prev-dur-desc {
          font-size: 12px;
          color: #a8a29e;
          margin-top: 1px;
        }

        .prev-dur-radio {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          border: 2px solid;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.14s;
        }

        .prev-dur-radio-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #c2410c;
        }

        /* Start button */
        .prev-start-btn {
          width: 100%;
          padding: 14px;
          background: #1c1917;
          color: #fafaf8;
          border: none;
          border-radius: 10px;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          letter-spacing: 0.01em;
        }

        .prev-start-btn:hover {
          background: #292524;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(0,0,0,0.14);
        }

        .prev-start-btn:active {
          transform: translateY(0);
        }

        /* Info note */
        .prev-note {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 14px 16px;
          background: #fffbeb;
          border: 1px solid #fde68a;
          border-radius: 10px;
          margin-top: 16px;
        }

        .prev-note-icon { font-size: 15px; flex-shrink: 0; margin-top: 1px; }

        .prev-note-text {
          font-size: 13px;
          color: #78716c;
          line-height: 1.5;
        }

        /* Loading skeleton */
        .prev-skeleton-line {
          height: 14px;
          border-radius: 6px;
          background: linear-gradient(90deg, #f5f3ee 25%, #ede9e4 50%, #f5f3ee 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite;
          margin-bottom: 12px;
        }

        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      <div className="prev-root">
        <button className="prev-back" onClick={() => navigate(-1)}>
          ← Back to Exams
        </button>

        <div className="prev-card">
          <div className="prev-card-top" />
          <div className="prev-card-body">

            {!data ? (
              <>
                <div className="prev-skeleton-line" style={{ width: "60%", height: 10 }} />
                <div className="prev-skeleton-line" style={{ width: "80%", height: 22, marginBottom: 24 }} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 28 }}>
                  <div className="prev-skeleton-line" style={{ height: 72, margin: 0 }} />
                  <div className="prev-skeleton-line" style={{ height: 72, margin: 0 }} />
                </div>
                <div className="prev-skeleton-line" style={{ width: "100%", height: 6, borderRadius: 99, marginBottom: 28 }} />
              </>
            ) : (
              <>
                <div className="prev-eyebrow">Real Exam</div>
                <h2 className="prev-exam-title">
                  {data.examName || data.title || "Exam Preview"}
                </h2>

                {/* Stats */}
                <div className="prev-stats">
                  <div
                    className="prev-stat"
                    style={{ background: "#f0fdf4", borderColor: "#bbf7d0" }}
                  >
                    <span className="prev-stat-val" style={{ color: "#15803d" }}>
                      {data.totalQuestions}
                    </span>
                    <span className="prev-stat-label">Total questions</span>
                  </div>
                  <div
                    className="prev-stat"
                    style={{ background: "#fff4ed", borderColor: "#fcd5b4" }}
                  >
                    <span className="prev-stat-val" style={{ color: "#c2410c" }}>
                      {data.remainingQuestions}
                    </span>
                    <span className="prev-stat-label">Remaining</span>
                  </div>
                </div>

                {/* Progress */}
                <div className="prev-progress-section">
                  <div className="prev-progress-header">
                    <span className="prev-progress-label">Questions attempted</span>
                    <span className="prev-progress-pct">{progressPct}%</span>
                  </div>
                  <div className="prev-progress-track">
                    <div className="prev-progress-fill" style={{ width: `${progressPct}%` }} />
                  </div>
                </div>

                <div className="prev-divider" />

                {/* Duration */}
                <span className="prev-duration-label">Choose duration</span>
                <div className="prev-duration-options">
                  {DURATIONS.map(d => {
                    const active = duration === d.value;
                    return (
                      <button
                        key={d.value}
                        className={`prev-dur-btn ${active ? "prev-dur-btn-active" : ""}`}
                        style={{ borderColor: active ? "#c2410c" : "#e7e5e4" }}
                        onClick={() => setDuration(d.value)}
                      >
                        <div>
                          <div className="prev-dur-name">{d.label}</div>
                          <div className="prev-dur-desc">{d.desc}</div>
                        </div>
                        <div
                          className="prev-dur-radio"
                          style={{ borderColor: active ? "#c2410c" : "#d6d3d1" }}
                        >
                          {active && <div className="prev-dur-radio-dot" />}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* CTA */}
                <button
                  className="prev-start-btn"
                  onClick={() =>
                    navigate(`/real-exam/start/${examId}`, { state: { duration } })
                  }
                >
                  Start Exam →
                </button>

                <div className="prev-note">
                  <span className="prev-note-icon">⚠</span>
                  <span className="prev-note-text">
                    Once started, the timer cannot be paused. Your webcam will be active
                    for proctoring. Make sure you're in a quiet environment.
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </UserLayout>
  );
};

export default RealExamPreviewPage;