import { useTranslation } from "react-i18next";

const QuestionPalette = ({
  questions = [],
  currentQ = 0,
  setCurrentQ,
  answers = {},
  review = new Set(),
}) => {
  const { t } = useTranslation();

  const answered = questions.filter(q => answers[q.id] !== undefined).length;
  const unanswered = questions.length - answered;
  const reviewCount = [...review].length;

  const getStatus = (index) => {
    const q = questions[index];
    const isReview = review?.has?.(index);
    const isAnswered = q && answers[q.id] !== undefined;
    if (isReview && isAnswered) return "both";
    if (isReview) return "review";
    if (isAnswered) return "answered";
    return "none";
  };

  const STATUS_STYLES = {
    both:     { bg: "#7c3aed", border: "#7c3aed",  color: "#fff" },
    review:   { bg: "#d97706", border: "#d97706",  color: "#fff" },
    answered: { bg: "#15803d", border: "#15803d",  color: "#fff" },
    none:     { bg: "#fff",    border: "#e7e5e4",  color: "#78716c" },
  };

  const pct = questions.length > 0 ? Math.round((answered / questions.length) * 100) : 0;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@500;600&display=swap');

        .pal-root {
          font-family: 'DM Sans', sans-serif;
          width: 220px;
          flex-shrink: 0;
          background: var(--bg-card);
          border: 1px solid var(--border-card);
          border-radius: 16px;
          padding: 20px 16px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04);
          overflow-y: auto;
        }

        .pal-header {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--text-3);
          padding-bottom: 14px;
          border-bottom: 1px solid var(--option-border);
        }

        .pal-stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }

        .pal-stat {
          padding: 10px 12px;
          border-radius: 10px;
          border: 1px solid;
        }

        .pal-stat-num {
          font-family: 'DM Mono', monospace;
          font-size: 24px;
          font-weight: 600;
          line-height: 1;
          display: block;
          margin-bottom: 3px;
        }

        .pal-stat-label {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          color: var(--text-3);
        }

        .pal-progress-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .pal-track {
          flex: 1;
          height: 6px;
          background: var(--option-border);
          border-radius: 99px;
          overflow: hidden;
        }

        .pal-fill {
          height: 100%;
          border-radius: 99px;
          background: #15803d;
          transition: width 0.6s ease;
        }

        .pal-pct {
          font-family: 'DM Mono', monospace;
          font-size: 12px;
          font-weight: 600;
          color: var(--text-2);
          white-space: nowrap;
        }

        .pal-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 5px;
        }

        .pal-btn {
          aspect-ratio: 1;
          border-radius: 7px;
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.14s ease;
          border: 1.5px solid;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .pal-btn:hover {
          transform: scale(1.12);
          z-index: 2;
        }

        .pal-btn-cur {
          outline: 2.5px solid #c2410c;
          outline-offset: 2px;
          transform: scale(1.12);
          z-index: 3;
        }

        .pal-legend {
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding-top: 14px;
          border-top: 1px solid var(--option-border);
        }

        .pal-legend-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 11.5px;
          font-weight: 500;
          color: var(--text-2);
        }

        .pal-swatch {
          width: 10px;
          height: 10px;
          border-radius: 3px;
          flex-shrink: 0;
        }
      `}</style>

      <div className="pal-root">
        <div className="pal-header">Question Map</div>

        <div className="pal-stats">
          <div
            className="pal-stat"
            style={{ background: "#f0fdf4", borderColor: "#bbf7d0" }}
          >
            <span className="pal-stat-num" style={{ color: "#15803d" }}>{answered}</span>
            <span className="pal-stat-label">Done</span>
          </div>
          <div
            className="pal-stat"
            style={{ background: "#fef2f2", borderColor: "#fecaca" }}
          >
            <span className="pal-stat-num" style={{ color: "#b91c1c" }}>{unanswered}</span>
            <span className="pal-stat-label">Left</span>
          </div>
        </div>

        <div className="pal-progress-row">
          <div className="pal-track">
            <div className="pal-fill" style={{ width: `${pct}%` }} />
          </div>
          <span className="pal-pct">{pct}%</span>
        </div>

        <div className="pal-grid">
          {questions.map((_, index) => {
            const st = getStatus(index);
            const s = STATUS_STYLES[st];
            return (
              <button
                key={index}
                onClick={() => setCurrentQ(index)}
                className={`pal-btn ${currentQ === index ? "pal-btn-cur" : ""}`}
                style={{
                  background: s.bg,
                  borderColor: s.border,
                  color: s.color,
                }}
                title={`Q${index + 1} — ${st}`}
              >
                {index + 1}
              </button>
            );
          })}
        </div>

        <div className="pal-legend">
          {[
            { bg: "#15803d", label: "Answered" },
            { bg: "#d97706", label: "Review" },
            { bg: "#7c3aed", label: "Review + Answered" },
            { bg: "#e7e5e4", label: "Not attempted" },
          ].map(({ bg, label }) => (
            <div key={label} className="pal-legend-item">
              <span className="pal-swatch" style={{ background: bg }} />
              {label}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default QuestionPalette;