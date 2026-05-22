import { useState, useEffect, useRef } from "react";

/**
 * SplitScreenDetector
 *
 * A standalone component that:
 *  1. Monitors window width continuously
 *  2. When width drops > 30% (Edge Copilot / Windows Snap):
 *     → Shows a full-screen blocking overlay
 *     → Pauses the exam (parent callback)
 *     → Logs the violation
 *     → Counts down — if not resolved in 10s, registers as violation
 *
 * Usage in MockTest:
 *   <SplitScreenDetector
 *     onViolation={registerViolation}
 *     onSplitActive={(active) => setSplitActive(active)}
 *   />
 *
 * Also exports useSplitScreenDetector hook for programmatic use.
 */

const SPLIT_THRESHOLD = 0.28; // 28% width drop triggers alert
const COUNTDOWN_SECS  = 10;   // seconds before it counts as a violation

export const useSplitScreenDetector = ({ onDetected, onResolved } = {}) => {
  const baseWidth  = useRef(window.innerWidth);
  const splitRef   = useRef(false);

  useEffect(() => {
    baseWidth.current = window.innerWidth;

    const handler = () => {
      const current = window.innerWidth;
      const drop    = (baseWidth.current - current) / baseWidth.current;
      const isSplit = drop > SPLIT_THRESHOLD;

      if (isSplit && !splitRef.current) {
        splitRef.current = true;
        onDetected?.({
          originalWidth: baseWidth.current,
          currentWidth:  current,
          dropPercent:   Math.round(drop * 100),
        });
      }

      if (!isSplit && splitRef.current) {
        splitRef.current = false;
        // Update baseline so we catch future splits correctly
        baseWidth.current = current;
        onResolved?.();
      }
    };

    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, [onDetected, onResolved]);

  return { currentWidth: window.innerWidth, baseWidth: baseWidth.current };
};

/* ── Visual blocking overlay ── */
const SplitScreenDetector = ({ onViolation, onSplitActive }) => {
  const [splitInfo,  setSplitInfo]  = useState(null); // { originalWidth, currentWidth, dropPercent }
  const [countdown,  setCountdown]  = useState(COUNTDOWN_SECS);
  const [violated,   setViolated]   = useState(false);
  const timerRef = useRef(null);

  const handleDetected = (info) => {
    setSplitInfo(info);
    setCountdown(COUNTDOWN_SECS);
    setViolated(false);
    onSplitActive?.(true);

    // Start countdown
    timerRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timerRef.current);
          setViolated(true);
          onViolation?.(
            `Split screen active for ${COUNTDOWN_SECS}s — Edge Copilot or screen partition detected. ` +
            `Original width: ${info.originalWidth}px → Current: ${info.currentWidth}px (${info.dropPercent}% reduction).`
          );
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  };

  const handleResolved = () => {
    clearInterval(timerRef.current);
    setSplitInfo(null);
    onSplitActive?.(false);
  };

  useSplitScreenDetector({ onDetected: handleDetected, onResolved: handleResolved });

  useEffect(() => () => clearInterval(timerRef.current), []);

  if (!splitInfo) return null;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 99999,
      background: "rgba(0,0,0,0.92)",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: 24,
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
    }}>
      {/* Warning icon */}
      <div style={{
        width: 80, height: 80, borderRadius: "50%",
        background: violated ? "#ef4444" : "#f59e0b",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 36, marginBottom: 24,
        animation: "pulse 1s ease-in-out infinite",
      }}>
        {violated ? "🚫" : "⚠️"}
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.08)} }
        @keyframes countdown-ring {
          from { stroke-dashoffset: 0; }
          to   { stroke-dashoffset: 126; }
        }
      `}</style>

      <h1 style={{
        color: violated ? "#ef4444" : "#f59e0b",
        fontSize: 22, fontWeight: 700, textAlign: "center", marginBottom: 10,
      }}>
        {violated ? "Violation Recorded" : "Split Screen Detected"}
      </h1>

      <p style={{
        color: "rgba(255,255,255,0.75)", fontSize: 15,
        textAlign: "center", maxWidth: 440, lineHeight: 1.6, marginBottom: 24,
      }}>
        {violated
          ? "A split screen was active for too long. This has been recorded as a violation."
          : "Your screen appears to be split. Edge Copilot, Windows Snap, or another tool has divided your screen."
        }
      </p>

      {/* Width info */}
      <div style={{
        background: "rgba(255,255,255,0.08)", borderRadius: 12, padding: "12px 24px",
        marginBottom: 24, display: "flex", gap: 24, textAlign: "center",
      }}>
        <div>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, textTransform: "uppercase", letterSpacing: 1 }}>Original</p>
          <p style={{ color: "white", fontSize: 18, fontWeight: 700 }}>{splitInfo.originalWidth}px</p>
        </div>
        <div style={{ color: "rgba(255,255,255,0.3)", display: "flex", alignItems: "center", fontSize: 20 }}>→</div>
        <div>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, textTransform: "uppercase", letterSpacing: 1 }}>Current</p>
          <p style={{ color: "#ef4444", fontSize: 18, fontWeight: 700 }}>{splitInfo.currentWidth}px</p>
        </div>
        <div>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, textTransform: "uppercase", letterSpacing: 1 }}>Reduction</p>
          <p style={{ color: "#f59e0b", fontSize: 18, fontWeight: 700 }}>{splitInfo.dropPercent}%</p>
        </div>
      </div>

      {/* Countdown */}
      {!violated && (
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ position: "relative", width: 72, height: 72, margin: "0 auto 12px" }}>
            <svg width="72" height="72" viewBox="0 0 48 48">
              <circle cx="24" cy="24" r="20" fill="none"
                stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
              <circle cx="24" cy="24" r="20" fill="none"
                stroke="#f59e0b" strokeWidth="3"
                strokeDasharray="126"
                strokeDashoffset={126 - (countdown / COUNTDOWN_SECS) * 126}
                strokeLinecap="round"
                transform="rotate(-90 24 24)"
                style={{ transition: "stroke-dashoffset 1s linear" }}
              />
            </svg>
            <div style={{
              position: "absolute", inset: 0, display: "flex",
              alignItems: "center", justifyContent: "center",
              color: "#f59e0b", fontSize: 20, fontWeight: 700,
            }}>
              {countdown}
            </div>
          </div>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 13 }}>
            Close the split screen within {countdown} second{countdown !== 1 ? "s" : ""} to avoid a violation
          </p>
        </div>
      )}

      {/* Instructions */}
      <div style={{
        background: "rgba(255,255,255,0.06)", borderRadius: 14, padding: "16px 20px",
        maxWidth: 420, textAlign: "left",
      }}>
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
          How to fix
        </p>
        {[
          "Close Edge Copilot panel (click the × on the Copilot sidebar)",
          "If using Windows Snap, drag the browser to full screen",
          "Press Windows + ↑ to maximize the browser window",
          "Press F11 to re-enter fullscreen mode",
        ].map((step, i) => (
          <p key={i} style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, marginBottom: 6, paddingLeft: 16, position: "relative" }}>
            <span style={{ position: "absolute", left: 0, color: "#6366f1" }}>{i + 1}.</span>
            {step}
          </p>
        ))}
      </div>

      {violated && (
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, marginTop: 20, textAlign: "center" }}>
          Exam will resume automatically when you restore full screen.
          This incident has been recorded.
        </p>
      )}
    </div>
  );
};

export default SplitScreenDetector;