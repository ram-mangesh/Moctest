package com.chat.controller;

import com.chat.entity.DifficultyLevel;
import com.chat.entity.DifficultyOverrideLog;
import com.chat.entity.Question;
import com.chat.entity.User;
import com.chat.repo.DifficultyOverrideLogRepository;
import com.chat.repo.QuestionRepository;
import com.chat.repo.Userrepo;
import com.chat.security.JwtUtil;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Task 4 — Adaptive Difficulty Slider Prototype
 *
 * POST /api/user/difficulty/override
 *   Body: { "topicId": 3, "difficulty": "EASY" }
 *   → Logs the override + returns questions filtered by that difficulty
 *
 * GET  /api/user/difficulty/logs
 *   → Returns the logged difficulty overrides for the authenticated user
 *     (for post-test review)
 *
 * GET  /api/admin/difficulty/logs/{topicId}
 *   → Admin sees all overrides per topic (edge case review)
 */
@RestController
public class AdaptiveDifficultyController {

    private final QuestionRepository questionRepo;
    private final DifficultyOverrideLogRepository logRepo;
    private final JwtUtil jwtUtil;
    private final Userrepo userRepo;

    public AdaptiveDifficultyController(
            QuestionRepository questionRepo,
            DifficultyOverrideLogRepository logRepo,
            JwtUtil jwtUtil,
            Userrepo userRepo
    ) {
        this.questionRepo = questionRepo;
        this.logRepo      = logRepo;
        this.jwtUtil      = jwtUtil;
        this.userRepo     = userRepo;
    }

    /* ── USER: override difficulty and get filtered questions ─────────────── */

    /**
     * POST /api/user/difficulty/override
     * Body: { "topicId": 3, "difficulty": "EASY" }
     *
     * Logs the user's slider selection and returns questions
     * for that topic filtered to the chosen difficulty level.
     * Frontend renders these questions in the exam view.
     */
    @PostMapping("/api/user/difficulty/override")
    public Map<String, Object> overrideDifficulty(
            @RequestBody Map<String, String> body,
            @RequestHeader("Authorization") String auth
    ) {
        String token = auth.replace("Bearer ", "");
        String email = jwtUtil.extractEmail(token);

        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // validate inputs
        Long topicId = Long.parseLong(body.get("topicId"));
        String diffStr = body.get("difficulty");

        DifficultyLevel level;
        try {
            level = DifficultyLevel.valueOf(diffStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException(
                "Invalid difficulty. Allowed: EASY, MEDIUM, DIFFICULT");
        }

        // log the override
        DifficultyOverrideLog log = new DifficultyOverrideLog();
        log.setUserId(user.getId());
        log.setTopicId(topicId);
        log.setSelectedDifficulty(level);
        logRepo.save(log);

        // fetch questions filtered by difficulty
        List<Question> questions =
                questionRepo.findByTopicIdAndDifficulty(topicId, level);

        return Map.of(
            "difficulty",      level.name(),
            "questionCount",   questions.size(),
            "topicId",         topicId,
            "logged",          true
        );
    }

    /* ── USER: view their own override history ───────────────────────────── */

    /**
     * GET /api/user/difficulty/logs
     */
    @GetMapping("/api/user/difficulty/logs")
    public List<DifficultyOverrideLog> myLogs(
            @RequestHeader("Authorization") String auth
    ) {
        String token = auth.replace("Bearer ", "");
        String email = jwtUtil.extractEmail(token);

        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return logRepo.findByUserId(user.getId());
    }

    /* ── ADMIN: view all overrides for a topic (edge case review) ─────────── */

    /**
     * GET /api/admin/difficulty/logs/{topicId}
     */
    @GetMapping("/api/admin/difficulty/logs/{topicId}")
    public List<DifficultyOverrideLog> logsByTopic(
            @PathVariable Long topicId
    ) {
        return logRepo.findByTopicId(topicId);
    }
}