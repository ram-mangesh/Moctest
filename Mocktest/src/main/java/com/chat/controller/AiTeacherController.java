package com.chat.controller;

import com.chat.entity.User;
import com.chat.repo.Userrepo;
import com.chat.security.JwtUtil;
import com.chat.service.AiTeacherService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * AiTeacherController
 *
 * POST /api/user/ai/teacher-call
 *   Body (text/plain): student's spoken question
 *   Returns: AI teacher response as plain text
 *
 * The AI teacher reads the student's full exam history and responds
 * with personalized guidance based on their weak/strong topics.
 *
 * Also:
 * GET /api/user/ai/teacher-context
 *   Returns student name + quick performance summary for the frontend
 *   to display before the call starts.
 */
@RestController
@RequestMapping("/api/user/ai")
public class AiTeacherController {

    private final AiTeacherService aiTeacherService;
    private final JwtUtil           jwtUtil;
    private final Userrepo          userRepo;

    public AiTeacherController(
            AiTeacherService aiTeacherService,
            JwtUtil jwtUtil,
            Userrepo userRepo) {
        this.aiTeacherService = aiTeacherService;
        this.jwtUtil           = jwtUtil;
        this.userRepo          = userRepo;
    }

    /* ── Main voice call endpoint ── */

    /**
     * POST /api/user/ai/teacher-call
     * Content-Type: text/plain
     * Body: "What is Newton's second law?"
     *
     * AI reads the student's history and responds with personalized guidance.
     */
    @PostMapping("/teacher-call")
    public String teacherCall(
            @RequestBody String question,
            @RequestHeader("Authorization") String auth) {

        User user = resolveUser(auth);
        System.out.println("📞 AI Teacher call from: " + user.getName()
                + " | Question: " + question);

        return aiTeacherService.ask(user, question.trim());
    }

    /* ── Context endpoint — called when panel opens ── */

    /**
     * GET /api/user/ai/teacher-context
     * Returns student name so the frontend can personalise the welcome message.
     */
    @GetMapping("/teacher-context")
    public Map<String, Object> teacherContext(
            @RequestHeader("Authorization") String auth) {

        User user = resolveUser(auth);
        return Map.of(
            "name",   user.getName(),
            "userId", user.getId()
        );
    }

    /* ── helper ── */
    private User resolveUser(String auth) {
        String token = auth.replace("Bearer ", "");
        String email = jwtUtil.extractEmail(token);
        return userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}