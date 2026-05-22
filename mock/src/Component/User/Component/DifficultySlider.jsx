import { useState } from "react";
import api from "../../Api/axios";

const LEVELS = [
  { value: "EASY",      label: "Easy",      emoji: "🟢", desc: "Foundational" },
  { value: "MEDIUM",    label: "Medium",    emoji: "🟡", desc: "Moderate"     },
  { value: "DIFFICULT", label: "Difficult", emoji: "🔴", desc: "Exam-level"   },
];

const DifficultySlider = ({ topicId, onConfirm }) => {
  const [selected, setSelected] = useState("MEDIUM");
  const [result, setResult]     = useState(null);
  const [loading, setLoading]   = useState(false);

  const handleSelect = async (level) => {
    setSelected(level);
    setLoading(true);
    setResult(null);
    try {
      const res = await api.post("/user/difficulty/override", {
        topicId: String(topicId),
        difficulty: level,
      });
      setResult(res.data);
    } catch (err) {
      console.error("Difficulty override failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');

        .ds2-wrap {
          font-family: 'Plus Jakarta Sans', sans-serif;
        }

        .ds2-btns { display: flex; gap: 10px; margin-bottom: 14px; }
        .ds2-btn {
          flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px;
          padding: 13px 8px; border-radius: 14px;
          border: 2px solid rgba(99,102,241,.15);
          background: rgba(238,240,255,.5);
          cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 12.5px; font-weight: 600; color: rgba(67,56,202,.6);
          transition: all .2s;
        }
        .ds2-btn:hover {
          border-color: rgba(99,102,241,.35);
          background: rgba(238,240,255,.9);
          color: #4338ca;
        }
        .ds2-btn.selected {
          border-color: #6366f1;
          background: rgba(99,102,241,.1);
          color: #4f46e5;
          transform: scale(1.03);
          box-shadow: 0 4px 16px rgba(99,102,241,.2);
        }
        .ds2-btn-emoji { font-size: 20px; }
        .ds2-btn-desc { font-size: 10.5px; opacity: .6; font-weight: 400; }

        .ds2-result {
          background: rgba(238,240,255,.7); border: 1.5px solid rgba(99,102,241,.15);
          backdrop-filter: blur(8px);
          border-radius: 12px; padding: 11px 14px; margin-bottom: 14px; text-align: center;
          font-size: 13px; color: #3730a3; font-weight: 500;
        }
        .ds2-result strong { color: #4f46e5; font-weight: 800; font-size: 17px; }

        .ds2-loading {
          text-align: center; font-size: 12px; color: rgba(99,102,241,.45);
          margin-bottom: 12px; font-style: italic;
        }

        .ds2-confirm {
          width: 100%; padding: 11px;
          border-radius: 13px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: #fff; font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 13.5px; font-weight: 800; border: none; cursor: pointer;
          box-shadow: 0 4px 16px rgba(99,102,241,.35);
          transition: all .22s; letter-spacing: .01em;
          position: relative; overflow: hidden;
        }
        .ds2-confirm::before {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(120deg, transparent, rgba(255,255,255,.2), transparent);
          transform: translateX(-100%); transition: transform .5s;
        }
        .ds2-confirm:hover::before { transform: translateX(100%); }
        .ds2-confirm:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(99,102,241,.45);
        }
        .ds2-confirm:disabled {
          opacity: .55; cursor: not-allowed; transform: none; box-shadow: none;
        }
      `}</style>

      <div className="ds2-wrap">
        <div className="ds2-btns">
          {LEVELS.map((l) => (
            <button
              key={l.value}
              onClick={() => handleSelect(l.value)}
              className={`ds2-btn${selected === l.value ? " selected" : ""}`}
            >
              <span className="ds2-btn-emoji">{l.emoji}</span>
              <span>{l.label}</span>
              <span className="ds2-btn-desc">{l.desc}</span>
            </button>
          ))}
        </div>

        {loading && <p className="ds2-loading">Checking availability…</p>}

        {result && !loading && (
          <div className="ds2-result">
            <strong>{result.questionCount}</strong> {result.difficulty} questions available
          </div>
        )}

        <button
          onClick={() => onConfirm?.(selected)}
          disabled={loading}
          className="ds2-confirm"
        >
          Start Test →
        </button>
      </div>
    </>
  );
};

export default DifficultySlider;
