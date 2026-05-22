import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const TestHeader = ({ examName, duration, onTimeUp, analytics }) => {
  const { t } = useTranslation();
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => { setTimeLeft(duration); }, [duration]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "light");
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) { onTimeUp?.(); return; }
    const timer = setInterval(() => {
      setTimeLeft(p => {
        if (p <= 1) { clearInterval(timer); onTimeUp?.(); return 0; }
        return p - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const fmt = s => {
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
    return h > 0
      ? `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`
      : `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const pct = duration > 0 ? (timeLeft / duration) * 100 : 0;
  const urgent = timeLeft <= 60;
  const warn = timeLeft <= 180;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@500;600&display=swap');

        :root {
          --bg-page: #f5f3ee;
          --bg-card: #ffffff;
          --bg-card2: #fafaf8;
          --border-card: #e8e4dc;
          --text-1: #1c1917;
          --text-2: #44403c;
          --text-3: #78716c;
          --accent: #c2410c;
          --accent-2: #0c4a6e;
          --option-bg: #fafaf8;
          --option-border: #e7e5e4;
          --option-hover-bg: #fff7ed;
          --option-hover-border: #fdba74;
          --input-bg: #fafaf8;
          --input-border: #e7e5e4;
          --footer-bg: #ffffff;
          --footer-border: #e8e4dc;
          --scratch-canvas: #fffbf7;
          --scratch-border: #e7e4de;
          --btn-ghost-bg: #f5f3ee;
          --btn-ghost-border: #e7e5e4;
          --btn-ghost-text: #78716c;
          --green: #15803d;
          --red: #b91c1c;
          --amber: #b45309;
        }

        .th-root {
          font-family: 'DM Sans', sans-serif;
          background: #1c1917;
          height: 62px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
          position: relative;
          z-index: 100;
          flex-shrink: 0;
        }

        .th-bar {
          position: absolute;
          bottom: 0; left: 0;
          height: 3px;
          transition: width 1s linear;
          background: ${urgent ? "#ef4444" : warn ? "#f59e0b" : "#22c55e"};
        }

        .th-left {
          display: flex; align-items: center; gap: 12px;
        }

        .th-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: #ef4444;
          animation: blink 1.4s ease-in-out infinite;
        }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.25} }

        .th-exam-name {
          font-size: 15px;
          font-weight: 600;
          color: #fafaf8;
          letter-spacing: -0.01em;
        }

        .th-divider {
          width: 1px; height: 18px;
          background: rgba(255,255,255,0.15);
        }

        .th-live {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #ef4444;
          padding: 3px 8px;
          border: 1px solid rgba(239,68,68,0.4);
          border-radius: 4px;
        }

        .th-center {
          position: absolute;
          left: 50%; transform: translateX(-50%);
        }

        .th-timer {
          display: flex; align-items: center; gap: 8px;
          padding: 7px 18px;
          border-radius: 8px;
          border: 1px solid ${urgent ? "rgba(239,68,68,0.4)" : warn ? "rgba(245,158,11,0.4)" : "rgba(255,255,255,0.12)"};
          background: ${urgent ? "rgba(239,68,68,0.12)" : warn ? "rgba(245,158,11,0.1)" : "rgba(255,255,255,0.06)"};
        }

        .th-timer-icon { font-size: 14px; }

        .th-timer-val {
          font-family: 'DM Mono', monospace;
          font-size: 20px;
          font-weight: 600;
          color: ${urgent ? "#fca5a5" : warn ? "#fde68a" : "#f5f3ee"};
          letter-spacing: 0.04em;
          animation: ${urgent ? "shake 0.5s ease infinite" : "none"};
        }

        @keyframes shake {
          0%,100%{transform:translateX(0)} 25%{transform:translateX(-2px)} 75%{transform:translateX(2px)}
        }

        .th-right {
          display: flex; align-items: center; gap: 10px;
        }

        .th-pct {
          font-size: 12px;
          font-weight: 500;
          color: rgba(255,255,255,0.5);
        }

        .th-pct strong {
          color: rgba(255,255,255,0.85);
          font-weight: 600;
        }
      `}</style>

      <div className="th-root">
        <div className="th-bar" style={{ width: `${pct}%` }} />

        <div className="th-left">
          <div className="th-dot" />
          <span className="th-live">Live</span>
          <div className="th-divider" />
          <span className="th-exam-name">{examName}</span>
        </div>

        <div className="th-center">
          <div className="th-timer">
            <span className="th-timer-icon">{urgent ? "🔥" : warn ? "⚡" : "⏱"}</span>
            <span className="th-timer-val">{fmt(timeLeft)}</span>
          </div>
        </div>

        <div className="th-right">
          <span className="th-pct">
            Time remaining: <strong>{Math.round(pct)}%</strong>
          </span>
        </div>
      </div>
    </>
  );
};

export default TestHeader;