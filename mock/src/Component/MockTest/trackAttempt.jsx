import api from "../Api/axios";

/**
 * Task 1 — Track question attempt for behavioral analytics.
 * Posts to /user/attempt, then notifies WebSocket to re-analyze.
 *
 * @param {object} payload - { sessionId, questionId, timeSpent,
 *                             optionChanges, revisits, answeredCorrect }
 * @param {function} triggerAnalysis - WebSocket send function from useRealtimeAnalytics
 */
export const trackAttempt = async (payload, triggerAnalysis) => {
  try {
    await api.post("/user/attempt", payload);
    // After saving, trigger WebSocket analysis
    triggerAnalysis?.();
  } catch (err) {
    // Non-critical — never break the exam flow
    console.warn("trackAttempt failed (non-critical):", err?.message);
  }
};