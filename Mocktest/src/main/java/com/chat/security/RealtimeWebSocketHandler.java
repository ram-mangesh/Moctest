package com.chat.security;

import com.chat.dto.AnalyticsResult;
import com.chat.dto.NudgeMessage;
import com.chat.entity.QuestionAttempt;
import com.chat.repo.QuestionAttemptRepository;
import com.chat.service.AnalyticsEngine;
import com.chat.service.NudgeService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.*;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Task 1 — Real-Time Nudge Notification System
 *
 * Flow:
 *   1. Frontend sends any message (ping / question-answered event)
 *   2. Backend fetches QuestionAttempt history for this session
 *   3. AnalyticsEngine analyzes history → AnalyticsResult
 *   4. NudgeService evaluates result → list of NudgeMessages
 *   5. Backend sends ONE combined JSON with both analytics + nudges
 *
 * Response shape:
 * {
 *   "stress": 45, "risk": 25, "confidence": 38, "readiness": 52,
 *   "showCalmUI": true, "strategyWarning": false,
 *   "mistakeRisk": true, "warningTick": 1,
 *   "nudges": [
 *     { "type": "CALM_DOWN", "title": "Pause for a moment",
 *       "message": "...", "severity": 3 }
 *   ]
 * }
 */
@Component
public class RealtimeWebSocketHandler extends TextWebSocketHandler {

    private final AnalyticsEngine analyticsEngine;
    private final NudgeService nudgeService;
    private final QuestionAttemptRepository repo;
    private final ObjectMapper mapper = new ObjectMapper();

    // sessionId (from URL path) → open WebSocketSession
    private final ConcurrentHashMap<Long, WebSocketSession> activeSessions
            = new ConcurrentHashMap<>();

    public RealtimeWebSocketHandler(
            AnalyticsEngine analyticsEngine,
            NudgeService nudgeService,
            QuestionAttemptRepository repo
    ) {
        this.analyticsEngine = analyticsEngine;
        this.nudgeService    = nudgeService;
        this.repo            = repo;
    }

    /* ═══════════════════════════════════════════════════════════════════════
       LIFECYCLE
    ═══════════════════════════════════════════════════════════════════════ */

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        Long sessionId = extractSessionId(session);
        activeSessions.put(sessionId, session);
        System.out.println("✅ WS CONNECTED | sessionId=" + sessionId
                + " | wsId=" + session.getId());
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session,
                                      CloseStatus status) {
        Long sessionId = extractSessionId(session);
        activeSessions.remove(sessionId);
        System.out.println("🔒 WS CLOSED | sessionId=" + sessionId
                + " | status=" + status);
    }

    @Override
    public void handleTransportError(WebSocketSession session,
                                     Throwable ex) {
        System.err.println("❌ WS ERROR: " + ex.getMessage());
    }

    /* ═══════════════════════════════════════════════════════════════════════
       MESSAGE HANDLER  (pull trigger → push analytics + nudges)
    ═══════════════════════════════════════════════════════════════════════ */

    @Override
    protected void handleTextMessage(WebSocketSession session,
                                     TextMessage message) throws Exception {

        System.out.println("📡 WS MESSAGE: " + message.getPayload());

        Long sessionId = extractSessionId(session);
        List<QuestionAttempt> history = repo.findBySessionId(sessionId);

        System.out.println("📊 History size: " + history.size());

        // ── no data yet ───────────────────────────────────────────────────────
        if (history.isEmpty()) {
            session.sendMessage(new TextMessage(emptyResponse()));
            return;
        }

        // ── run analytics ─────────────────────────────────────────────────────
        AnalyticsResult result = analyticsEngine.analyze(history);

        // ── evaluate nudges ───────────────────────────────────────────────────
        List<NudgeMessage> nudges = nudgeService.evaluate(result);

        if (!nudges.isEmpty()) {
            System.out.println("🔔 Nudge fired: " + nudges.get(0).getType());
        }

        // ── build combined response ───────────────────────────────────────────
        String json = buildResponse(result, nudges);
        System.out.println("📤 Sending: " + json);
        session.sendMessage(new TextMessage(json));
    }

    /* ═══════════════════════════════════════════════════════════════════════
       PUBLIC API — push a nudge from outside (e.g. server-side event)
       Other services can call this to push a nudge without waiting for
       a frontend ping (true server-push for future use).
    ═══════════════════════════════════════════════════════════════════════ */

    public void pushNudge(Long sessionId, NudgeMessage nudge) {
        WebSocketSession ws = activeSessions.get(sessionId);
        if (ws == null || !ws.isOpen()) return;

        try {
            String json = String.format(
                "{\"nudgeOnly\":true,\"nudges\":[%s]}",
                mapper.writeValueAsString(nudge)
            );
            ws.sendMessage(new TextMessage(json));
            System.out.println("📣 Push nudge to sessionId=" + sessionId
                    + " type=" + nudge.getType());
        } catch (Exception e) {
            System.err.println("❌ pushNudge failed: " + e.getMessage());
        }
    }

    /* ═══════════════════════════════════════════════════════════════════════
       HELPERS
    ═══════════════════════════════════════════════════════════════════════ */

    private String buildResponse(AnalyticsResult r,
                                 List<NudgeMessage> nudges) {
        try {
            String nudgesJson = mapper.writeValueAsString(nudges);

            return String.format(
                "{\"stress\":%d,\"risk\":%d,\"confidence\":%d,"
                + "\"readiness\":%d,\"showCalmUI\":%b,"
                + "\"strategyWarning\":%b,\"mistakeRisk\":%b,"
                + "\"warningTick\":%d,\"nudges\":%s}",
                r.stress(), r.risk(), r.confidence(), r.readiness(),
                r.showCalmUI(), r.strategyWarning(), r.mistakeRisk(),
                r.warningTick(), nudgesJson
            );
        } catch (Exception e) {
            return emptyResponse();
        }
    }

    private String emptyResponse() {
        return "{\"error\":\"no attempts yet\",\"readiness\":50,"
             + "\"stress\":0,\"confidence\":50,\"risk\":0,"
             + "\"showCalmUI\":false,\"strategyWarning\":false,"
             + "\"mistakeRisk\":false,\"warningTick\":0,\"nudges\":[]}";
    }

    private Long extractSessionId(WebSocketSession session) {
        String path = session.getUri().getPath(); // /ws/test/42
        return Long.parseLong(
                path.substring(path.lastIndexOf("/") + 1)
        );
    }
}