import { useEffect, useRef, useState, useCallback } from "react";

/**
 * Task 1 — Real-Time Analytics + Nudge Notification System
 *
 * Connects to ws://localhost:8089/ws/test/{sessionId}?userId={userId}
 * The userId param enables Task 6 (per-user stress config) on the backend.
 *
 * Returns:
 *   analytics  — { stress, risk, confidence, readiness, showCalmUI,
 *                  strategyWarning, mistakeRisk, warningTick, nudges[] }
 *   triggerAnalysis() — send "analyze" ping to backend
 */
const useRealtimeAnalytics = (sessionId) => {
  const socketRef = useRef(null);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    if (!sessionId) return;

    // Task 6: pass userId so backend loads user's stress config
    const userId = localStorage.getItem("userId") || "";
    const url = `ws://localhost:8089/ws/test/${sessionId}?userId=${userId}`;

    const ws = new WebSocket(url);

    ws.onopen = () => {
      console.log("✅ WS CONNECTED:", ws.url);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setAnalytics({
          ...data,
          nudges: data.nudges || [],
          _tick: Date.now()
        });
      } catch (e) {
        console.error("WS parse error", e);
      }
    };

    ws.onerror = (e) => {
      console.error("❌ WebSocket error", e);
    };

    ws.onclose = () => {
      console.log("🔒 WS closed");
    };

    socketRef.current = ws;

    return () => {
      ws.close();
    };
  }, [sessionId]);

  const triggerAnalysis = useCallback(() => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send("analyze");
    }
  }, []);

  return { analytics, triggerAnalysis };
};

export default useRealtimeAnalytics;