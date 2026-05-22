import { useEffect, useRef, useState } from "react";

/**
 * Task 1 — Real-Time Nudge Notification UI
 *
 * Receives nudges[] from the WebSocket analytics response
 * and shows a non-disruptive overlay card during the exam.
 *
 * Nudge types and their colors:
 *   CALM_DOWN         → slate  (severity 3 — highest)
 *   MISTAKE_RISK      → amber  (severity 2)
 *   STRATEGY_WARNING  → orange (severity 2)
 *   FOCUS_RESET       → blue   (severity 1)
 *
 * Auto-dismisses after 6 seconds. User can also dismiss manually.
 *
 * Usage:
 *   <NudgeToast nudges={analytics?.nudges} />
 */

const TYPE_STYLES = {
  CALM_DOWN: {
    bg: "bg-slate-800",
    border: "border-slate-500",
    icon: "🧘",
    textColor: "text-slate-100",
    subColor: "text-slate-300",
    bar: "bg-slate-400",
  },
  MISTAKE_RISK: {
    bg: "bg-amber-900",
    border: "border-amber-500",
    icon: "⚠️",
    textColor: "text-amber-100",
    subColor: "text-amber-300",
    bar: "bg-amber-400",
  },
  STRATEGY_WARNING: {
    bg: "bg-orange-900",
    border: "border-orange-500",
    icon: "🧭",
    textColor: "text-orange-100",
    subColor: "text-orange-300",
    bar: "bg-orange-400",
  },
  FOCUS_RESET: {
    bg: "bg-blue-900",
    border: "border-blue-500",
    icon: "🎯",
    textColor: "text-blue-100",
    subColor: "text-blue-300",
    bar: "bg-blue-400",
  },
};

const DEFAULT_STYLE = {
  bg: "bg-gray-800",
  border: "border-gray-500",
  icon: "ℹ️",
  textColor: "text-gray-100",
  subColor: "text-gray-300",
  bar: "bg-gray-400",
};

const AUTO_DISMISS_MS = 6000;

const NudgeToast = ({ nudges = [] }) => {
  const [visible, setVisible] = useState([]);
  const shownRef = useRef(new Set());
  const [progress, setProgress] = useState({});

  useEffect(() => {
    if (!nudges || nudges.length === 0) return;

    nudges.forEach((nudge) => {
      // Use type + title as dedup key so same nudge doesn't re-fire
      const key = `${nudge.type}-${nudge.title}`;
      if (shownRef.current.has(key)) return;
      shownRef.current.add(key);

      const id = Date.now() + Math.random();

      setVisible((prev) => [...prev, { ...nudge, id }]);
      setProgress((prev) => ({ ...prev, [id]: 100 }));

      // Progress bar animation
      const interval = setInterval(() => {
        setProgress((prev) => {
          const current = prev[id];
          if (current <= 0) {
            clearInterval(interval);
            return prev;
          }
          return { ...prev, [id]: current - 100 / (AUTO_DISMISS_MS / 100) };
        });
      }, 100);

      // Auto dismiss
      setTimeout(() => {
        dismiss(id);
        clearInterval(interval);
      }, AUTO_DISMISS_MS);
    });
  }, [nudges]);

  const dismiss = (id) => {
    setVisible((prev) => prev.filter((n) => n.id !== id));
    setProgress((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  if (visible.length === 0) return null;

  return (
    <div
      className="fixed top-20 left-1/2 z-50 flex flex-col gap-3"
      style={{ transform: "translateX(-50%)", minWidth: 340, maxWidth: 420 }}
    >
      {visible.map((nudge) => {
        const style = TYPE_STYLES[nudge.type] || DEFAULT_STYLE;
        return (
          <div
            key={nudge.id}
            className={`
              relative rounded-xl border shadow-2xl overflow-hidden
              ${style.bg} ${style.border}
              animate-[slideDown_0.4s_cubic-bezier(0.34,1.56,0.64,1)]
            `}
            style={{
              animation: "slideDown 0.4s cubic-bezier(0.34,1.56,0.64,1)",
            }}
          >
            {/* Content */}
            <div className="flex items-start gap-3 px-4 py-3">
              <span className="text-2xl mt-0.5">{style.icon}</span>
              <div className="flex-1 min-w-0">
                <p className={`font-bold text-sm ${style.textColor}`}>
                  {nudge.title}
                </p>
                <p className={`text-xs mt-0.5 leading-relaxed ${style.subColor}`}>
                  {nudge.message}
                </p>
              </div>
              <button
                onClick={() => dismiss(nudge.id)}
                className={`text-lg leading-none ml-1 opacity-60 hover:opacity-100 transition ${style.textColor}`}
              >
                ×
              </button>
            </div>

            {/* Progress bar */}
            <div className="h-0.5 w-full bg-black/20">
              <div
                className={`h-full transition-all duration-100 ${style.bar}`}
                style={{ width: `${progress[nudge.id] ?? 0}%` }}
              />
            </div>
          </div>
        );
      })}

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-16px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
};

export default NudgeToast;