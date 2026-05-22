import { useState, useEffect, useRef } from "react";
import api from "../Api/axios";

/**
 * AiHintWhisperer
 *
 * Watches the student's behavior on a question.
 * When they're stuck (time > 45s OR option changes >= 3),
 * a subtle "💡 Need a hint?" button appears.
 * Tapping it calls AI and shows a Socratic hint — no answer revealed.
 *
 * Props:
 *   questionId    — current question ID
 *   timeSpent     — seconds on this question (from MockTest timer)
 *   optionChanges — how many times answer changed
 *   onHintShown   — callback (for analytics tracking)
 *
 * Add inside QuestionPanel, below the options:
 *   <AiHintWhisperer
 *     questionId={question.id}
 *     timeSpent={timeOnCurrentQ}
 *     optionChanges={optionChangeCount}
 *   />
 */

const AiHintWhisperer = ({ questionId, timeSpent = 0, optionChanges = 0, onHintShown }) => {
  const [visible,  setVisible]  = useState(false);
  const [hint,     setHint]     = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [open,     setOpen]     = useState(false);
  const [hintUsed, setHintUsed] = useState(false);
  const prevQId = useRef(null);

  // Reset when question changes
  useEffect(() => {
    if (questionId !== prevQId.current) {
      prevQId.current = questionId;
      setVisible(false);
      setHint(null);
      setOpen(false);
      setHintUsed(false);
    }
  }, [questionId]);

  // Appear when student is stuck
  useEffect(() => {
    const stuck = timeSpent >= 45 || optionChanges >= 3;
    if (stuck && !hintUsed) setVisible(true);
  }, [timeSpent, optionChanges, hintUsed]);

  const fetchHint = async () => {
    if (hint) { setOpen(true); return; }
    setLoading(true);
    setOpen(true);
    try {
      const res = await api.post("/user/ai/hint", {
        questionId,
        timeSpent,
        optionChanges,
      });
      setHint(typeof res.data === "string" ? res.data : "Think about what core concept this question tests.");
      setHintUsed(true);
      onHintShown?.();
    } catch {
      setHint("Think about the core concept or formula that applies to this type of question.");
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <div className="mt-4">
      {/* Trigger button — subtle, doesn't distract */}
      {!open && (
        <button
          onClick={fetchHint}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
                     border border-amber-200 dark:border-amber-700
                     bg-amber-50 dark:bg-amber-900/20
                     text-amber-700 dark:text-amber-400
                     hover:bg-amber-100 dark:hover:bg-amber-900/40 transition
                     animate-pulse"
          style={{ animationDuration: "2s" }}
        >
          <span style={{ fontSize: 16 }}>💡</span>
          Need a hint?
          <span className="text-xs font-normal opacity-60">
            {timeSpent >= 45 ? `${timeSpent}s on this question` : `Changed answer ${optionChanges}×`}
          </span>
        </button>
      )}

      {/* Hint card */}
      {open && (
        <div className="rounded-xl border border-amber-200 dark:border-amber-700
                        bg-amber-50 dark:bg-amber-900/20 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5
                          border-b border-amber-200 dark:border-amber-700">
            <p className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wide">
              💡 AI Hint — no answer revealed
            </p>
            <button onClick={() => setOpen(false)}
              className="text-amber-400 hover:text-amber-600 text-lg leading-none">×</button>
          </div>
          <div className="px-4 py-3">
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-amber-600 dark:text-amber-400">AI is thinking of a hint...</span>
              </div>
            ) : (
              <p className="text-sm text-amber-800 dark:text-amber-300 leading-relaxed">{hint}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AiHintWhisperer;