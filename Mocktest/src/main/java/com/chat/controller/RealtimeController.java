//package com.chat.controller;
//
//import com.chat.config.SpringContextProvider;
//import com.chat.dto.AnalyticsResult;
//import com.chat.entity.QuestionAttempt;
//import com.chat.repo.QuestionAttemptRepository;
//import com.chat.service.AnalyticsEngine;
//
//import jakarta.websocket.*;
//import jakarta.websocket.server.PathParam;
//import jakarta.websocket.server.ServerEndpoint;
//
//import java.util.List;
//
//@ServerEndpoint("/ws/test/{sessionId}")
//public class RealtimeController {
//
//    private AnalyticsEngine analyticsEngine;
//    private QuestionAttemptRepository questionAttemptRepo;
//
//    @OnOpen
//    public void onOpen(Session session,
//                       @PathParam("sessionId") Long sessionId) {
//
//        // 🔥 Bridge Spring beans manually
//        this.analyticsEngine =
//                SpringContextProvider.getBean(AnalyticsEngine.class);
//
//        this.questionAttemptRepo =
//                SpringContextProvider.getBean(QuestionAttemptRepository.class);
//    }
//
//   @OnMessage
//public void onMessage(Session session,
//                      @PathParam("sessionId") Long sessionId) throws Exception {
//
//    System.out.println("📡 WS MESSAGE RECEIVED");
//
//    List<QuestionAttempt> history =
//            questionAttemptRepo.findBySessionId(sessionId);
//
//    System.out.println("📊 History size: " + history.size());
//
//    if (history.isEmpty()) return;
//
//    AnalyticsResult result = analyticsEngine.analyze(history);
//
//    session.getBasicRemote().sendText(toJson(result));
//}
//
//    private String toJson(AnalyticsResult r) {
//        return """
//        {
//          "stress": %d,
//          "risk": %d,
//          "confidence": %d,
//          "readiness": %d,
//          "showCalmUI": %b,
//          "strategyWarning": %b,
//          "mistakeRisk": %b
//        }
//        """.formatted(
//                r.stress(),
//                r.risk(),
//                r.confidence(),
//                r.readiness(),
//                r.showCalmUI(),
//                r.strategyWarning(),
//                r.mistakeRisk()
//        );
//    }
//}
