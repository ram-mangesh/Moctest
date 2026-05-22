//package com.chat.config;
//
//import com.chat.security.RealtimeWebSocketHandler;
//import org.springframework.context.annotation.Configuration;
//import org.springframework.web.socket.config.annotation.*;
//
//@Configuration
//@EnableWebSocket
//public class WebSocketConfig implements WebSocketConfigurer {
//
//    private final RealtimeWebSocketHandler handler;
//
//    public WebSocketConfig(RealtimeWebSocketHandler handler) {
//        this.handler = handler;
//    }
//
//    @Override
//    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
//        registry
//            .addHandler(handler, "/ws/test/*")   // ✅ wildcard, NOT {sessionId}
//            .setAllowedOrigins("*");              // tighten after it works
//    }
//}