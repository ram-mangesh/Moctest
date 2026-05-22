import { useTranslation } from "react-i18next";

const FooterControls = ({
  currentQ,
  total,
  setCurrentQ,
  review,
  setReview,
  onSubmit,
}) => {
  const { t } = useTranslation();

  const markForReview = () => {
    setReview(prev => new Set([...prev, currentQ]));
    if (currentQ < total - 1) setCurrentQ(currentQ + 1);
  };

  const pct = total > 0 ? ((currentQ + 1) / total) * 100 : 0;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@600;700;800;900&display=swap');

        .fc-root {
          font-family: 'Nunito', sans-serif;
          background: var(--footer-bg);
          border-top: 1.5px solid var(--footer-border);
          height: 72px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
          position: relative;
          box-shadow: 0 -4px 24px rgba(0,0,0,0.12);
          gap: 12px;
          flex-shrink: 0;
          z-index: 50;
        }

        /* Rainbow progress line at top */
        .fc-progress {
          position: absolute; top: 0; left: 0; height: 4px;
          background: linear-gradient(90deg,#6366f1,#ec4899,#f59e0b,#10b981,#38bdf8);
          background-size: 200%;
          border-radius: 0 3px 3px 0;
          transition: width 0.5s ease;
          animation: rainbowShift 3s linear infinite;
        }
        @keyframes rainbowShift { 0%{background-position:0%} 100%{background-position:200%} }

        /* Base button */
        .fc-btn {
          display: flex; align-items: center; gap: 7px;
          padding: 0 20px; height: 42px; border-radius: 50px;
          font-size: 13.5px; font-weight: 800; cursor: pointer;
          transition: all 0.2s ease; border: 2px solid;
          white-space: nowrap; font-family: 'Nunito', sans-serif;
          letter-spacing: 0.01em;
        }

        .fc-btn:disabled {
          opacity: 0.3; cursor: not-allowed; transform: none !important;
          box-shadow: none !important;
        }

        .fc-btn:not(:disabled):hover { transform: translateY(-2px) scale(1.03); }
        .fc-btn:not(:disabled):active { transform: translateY(1px) scale(0.98); }

        /* Previous */
        .btn-prev {
          background: var(--btn-ghost-bg);
          border-color: var(--btn-ghost-border);
          color: var(--btn-ghost-text);
        }
        .btn-prev:not(:disabled):hover {
          background: var(--option-hover-bg);
          border-color: var(--option-hover-border);
          color: var(--text-1);
          box-shadow: 0 4px 16px rgba(99,102,241,0.15);
        }

        /* Next — indigo gradient */
        .btn-next {
          background: linear-gradient(135deg,#6366f1,#8b5cf6);
          border-color: transparent;
          color: #fff;
          box-shadow: 0 4px 16px rgba(99,102,241,0.35);
        }
        .btn-next:not(:disabled):hover {
          box-shadow: 0 8px 24px rgba(99,102,241,0.5);
        }

        /* Review — amber gradient */
        .btn-review {
          background: linear-gradient(135deg,#f59e0b,#fbbf24);
          border-color: transparent;
          color: #fff;
          box-shadow: 0 4px 16px rgba(245,158,11,0.35);
        }
        .btn-review:hover {
          box-shadow: 0 8px 24px rgba(245,158,11,0.5);
        }

        /* Submit — hot coral gradient */
        .btn-submit {
          background: linear-gradient(135deg,#ef4444,#f43f5e,#ec4899);
          border-color: transparent;
          color: #fff;
          padding: 0 26px;
          box-shadow: 0 4px 20px rgba(239,68,68,0.4);
          font-size: 14px;
        }
        .btn-submit:hover {
          box-shadow: 0 8px 32px rgba(239,68,68,0.55);
        }

        /* Center area */
        .fc-center {
          display: flex; align-items: center; gap: 12px;
        }

        .fc-counter {
          display: flex; align-items: center; gap: 6px;
          background: var(--option-bg);
          border: 1.5px solid var(--option-border);
          border-radius: 50px;
          padding: 6px 16px;
          font-size: 13px; font-weight: 700; color: var(--text-3);
        }

        .fc-counter-cur {
          font-size: 16px; font-weight: 900;
          background: linear-gradient(135deg,#6366f1,#ec4899);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }

        .fc-counter-sep { color: var(--option-border); font-weight: 400; }

        .fc-divider {
          width: 1.5px; height: 28px;
          background: var(--option-border);
          border-radius: 99px;
        }

        .fc-right {
          display: flex; align-items: center; gap: 10px;
        }

        .fc-btn-icon { font-size: 15px; line-height: 1; }
      `}</style>

      <div className="fc-root">
        <div className="fc-progress" style={{ width: `${pct}%` }} />

        {/* Previous */}
        <button
          disabled={currentQ === 0}
          onClick={() => setCurrentQ(currentQ - 1)}
          className="fc-btn btn-prev"
        >
          <span className="fc-btn-icon">←</span>
          {t("mock.previous", { defaultValue: "Prev" })}
        </button>

        {/* Center */}
        <div className="fc-center">
          <div className="fc-counter">
            <span className="fc-counter-cur">{currentQ + 1}</span>
            <span className="fc-counter-sep">/</span>
            <span>{total}</span>
          </div>
          <div className="fc-divider" />
          <button onClick={markForReview} className="fc-btn btn-review">
            <span className="fc-btn-icon">🏷</span>
            {t("mock.markForReview", { defaultValue: "Review" })}
          </button>
        </div>

        {/* Right */}
        <div className="fc-right">
          <button
            disabled={currentQ === total - 1}
            onClick={() => setCurrentQ(currentQ + 1)}
            className="fc-btn btn-next"
          >
            {t("mock.next", { defaultValue: "Next" })}
            <span className="fc-btn-icon">→</span>
          </button>
          <div className="fc-divider" />
          <button onClick={onSubmit} className="fc-btn btn-submit">
            <span className="fc-btn-icon">🚀</span>
            {t("mock.submit", { defaultValue: "Submit" })}
          </button>
        </div>
      </div>
    </>
  );
};

export default FooterControls;