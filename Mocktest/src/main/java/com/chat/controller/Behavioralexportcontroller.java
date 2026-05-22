package com.chat.controller;

import com.chat.entity.QuestionAttempt;
import com.chat.entity.User;
import com.chat.repo.QuestionAttemptRepository;
import com.chat.repo.Userrepo;
import com.chat.security.JwtUtil;
import org.springframework.web.bind.annotation.*;

import java.util.*;

/**
 * Task 5 — Behavioral Pattern Export Visualizer
 *
 * GET /api/user/behavior/chart/{sessionId}
 *   → Returns time-series JSON of cognitive drift metrics for a session.
 *     Frontend (React + Chart.js) renders the graph and can export as PNG.
 *
 * GET /api/user/behavior/summary/{sessionId}
 *   → Returns aggregated behavioral summary for a session.
 *
 * Response shape for /chart:
 * {
 *   "sessionId": 42,
 *   "labels": [1, 2, 3, ...],           // question index
 *   "timeSpent":     [30, 45, 62, ...],
 *   "optionChanges": [0, 1, 3, ...],
 *   "revisits":      [0, 0, 1, ...],
 *   "correctness":   [1, 0, 1, ...]     // 1 = correct, 0 = wrong
 * }
 */
@RestController
@RequestMapping("/api/user/behavior")
public class Behavioralexportcontroller {

    private final QuestionAttemptRepository attemptRepo;
    private final JwtUtil jwtUtil;
    private final Userrepo userRepo;

    public Behavioralexportcontroller(
            QuestionAttemptRepository attemptRepo,
            JwtUtil jwtUtil,
            Userrepo userRepo
    ) {
        this.attemptRepo = attemptRepo;
        this.jwtUtil     = jwtUtil;
        this.userRepo    = userRepo;
    }

    /* ── TIME-SERIES CHART DATA ──────────────────────────────────────────── */

    /**
     * GET /api/user/behavior/chart/{sessionId}
     *
     * Returns per-question behavioral data arrays suitable for
     * Chart.js line/bar charts. Frontend plots and can export as PNG
     * using chart.canvas.toDataURL().
     */
    @GetMapping("/chart/{sessionId}")
    public Map<String, Object> chartData(
            @PathVariable Long sessionId,
            @RequestHeader("Authorization") String auth
    ) {
        authenticateUser(auth);

        List<QuestionAttempt> history =
                attemptRepo.findBySessionId(sessionId);

        if (history.isEmpty()) {
            return Map.of("sessionId", sessionId,
                          "labels", List.of(),
                          "message", "No data for this session");
        }

        // sort by timestamp to ensure correct order
        history.sort(Comparator.comparingLong(QuestionAttempt::getTimestamp));

        List<Integer> labels        = new ArrayList<>();
        List<Integer> timeSpent     = new ArrayList<>();
        List<Integer> optionChanges = new ArrayList<>();
        List<Integer> revisits      = new ArrayList<>();
        List<Integer> correctness   = new ArrayList<>();

        for (int i = 0; i < history.size(); i++) {
            QuestionAttempt a = history.get(i);
            labels.add(i + 1);
            timeSpent.add(a.getTimeSpent());
            optionChanges.add(a.getOptionChanges());
            revisits.add(a.getRevisits());
            correctness.add(a.isAnsweredCorrect() ? 1 : 0);
        }

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("sessionId",    sessionId);
        response.put("totalQuestions", history.size());
        response.put("labels",        labels);
        response.put("timeSpent",     timeSpent);
        response.put("optionChanges", optionChanges);
        response.put("revisits",      revisits);
        response.put("correctness",   correctness);

        return response;
    }

    /* ── AGGREGATED SUMMARY ──────────────────────────────────────────────── */

    /**
     * GET /api/user/behavior/summary/{sessionId}
     *
     * Aggregated stats per session — used in the dashboard summary card.
     */
    @GetMapping("/summary/{sessionId}")
    public Map<String, Object> summary(
            @PathVariable Long sessionId,
            @RequestHeader("Authorization") String auth
    ) {
        authenticateUser(auth);

        List<QuestionAttempt> history =
                attemptRepo.findBySessionId(sessionId);

        if (history.isEmpty()) {
            return Map.of("sessionId", sessionId, "message", "No data");
        }

        int totalTime        = history.stream().mapToInt(QuestionAttempt::getTimeSpent).sum();
        int totalChanges     = history.stream().mapToInt(QuestionAttempt::getOptionChanges).sum();
        int totalRevisits    = history.stream().mapToInt(QuestionAttempt::getRevisits).sum();
        long totalCorrect    = history.stream().filter(QuestionAttempt::isAnsweredCorrect).count();

        int maxTimeQuestion  = history.stream()
                .max(Comparator.comparingInt(QuestionAttempt::getTimeSpent))
                .map(a -> history.indexOf(a) + 1)
                .orElse(0);

        double avgTime = history.isEmpty() ? 0
                : (double) totalTime / history.size();

        double accuracy = history.isEmpty() ? 0
                : (double) totalCorrect / history.size() * 100;

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("sessionId",           sessionId);
        response.put("totalQuestions",      history.size());
        response.put("totalTimeSeconds",    totalTime);
        response.put("avgTimePerQuestion",  Math.round(avgTime * 10.0) / 10.0);
        response.put("totalOptionChanges",  totalChanges);
        response.put("totalRevisits",       totalRevisits);
        response.put("accuracy",            Math.round(accuracy * 10.0) / 10.0);
        response.put("slowestQuestion",     maxTimeQuestion);

        return response;
    }

    /* ── helper ──────────────────────────────────────────────────────────── */

    private User authenticateUser(String auth) {
        String token = auth.replace("Bearer ", "");
        String email = jwtUtil.extractEmail(token);
        return userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}