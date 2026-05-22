package com.chat.controller;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.chat.dto.AnswerDTO;
import com.chat.dto.QuestionResponse;
import com.chat.entity.*;
import com.chat.repo.*;
import com.chat.security.JwtUtil;

@RestController
@RequestMapping("/api/real-exam")
public class RealExamController {

    private final RealExamSessionRepository sessionRepo;
    private final QuestionRepository questionRepo;
    private final Userrepo userRepo;
    private final JwtUtil jwtUtil;

    public RealExamController(
            RealExamSessionRepository sessionRepo,
            QuestionRepository questionRepo,
            Userrepo userRepo,
            JwtUtil jwtUtil
    ) {
        this.sessionRepo = sessionRepo;
        this.questionRepo = questionRepo;
        this.userRepo = userRepo;
        this.jwtUtil = jwtUtil;
    }

    /* ================= AUTH ================= */

    private User authUser(String auth) {
        String token = auth.replace("Bearer ", "");
        String email = jwtUtil.extractEmail(token);
        return userRepo.findByEmail(email).orElseThrow();
    }

    /* ================= PREVIEW ================= */

    @GetMapping("/preview")
    public Map<String, Object> preview(
            @RequestParam Long examId,
            @RequestHeader("Authorization") String auth) {

        User user = authUser(auth);

        List<Question> all =
                questionRepo.findByTopic_Subject_Exam_Id(examId);

        RealExamSession session =
                sessionRepo.findByUserIdAndExamId(user.getId(), examId)
                        .orElse(null);

        int used = session == null ? 0 : session.getUsedQuestionIds().size();

        return Map.of(
                "totalQuestions", all.size(),
                "remainingQuestions", Math.max(all.size() - used, 0)
        );
    }

    /* ================= START ================= */

    @PostMapping("/start")
    public ResponseEntity<?> start(
            @RequestBody Map<String, Integer> body,
            @RequestHeader("Authorization") String auth) {

        User user = authUser(auth);

        Long examId = body.get("examId").longValue();
        int duration = body.get("duration");

        RealExamSession session =
                sessionRepo.findByUserIdAndExamId(user.getId(), examId)
                        .orElseGet(() -> {
                            RealExamSession s = new RealExamSession();
                            s.setUserId(user.getId());
                            s.setExamId(examId);
                            s.setStatus(RealExamSession.Status.ACTIVE);
                            s.setUsedQuestionIds(new HashSet<>());
                            return s;
                        });

        session.setAttemptCount(session.getAttemptCount() + 1);
        session.setStartedAt(LocalDateTime.now());
        session.setDuration(duration);
        session.setEndTime(LocalDateTime.now().plusSeconds(duration));

        List<Question> all =
                questionRepo.findByTopic_Subject_Exam_Id(examId);

        Set<Long> used = session.getUsedQuestionIds();

        List<Question> available = new ArrayList<>();
        for (Question q : all) {
            if (!used.contains(q.getId())) {
                available.add(q);
            }
        }

        Collections.shuffle(available);

        List<Question> selected =
                available.stream().limit(20).toList();

        if (selected.isEmpty()) {
            session.setStatus(RealExamSession.Status.COMPLETED);
            sessionRepo.save(session);

            return ResponseEntity.status(HttpStatus.GONE)
                    .body(Map.of(
                            "completed", true,
                            "message", "All questions exhausted"
                    ));
        }

        for (Question q : selected) {
            used.add(q.getId());
        }

        sessionRepo.save(session);

        List<QuestionResponse> safe =
                selected.stream().map(q -> {

                    List<String> options = null;

                    if (q.getType() != QuestionType.NAQ) {
                        options = new ArrayList<>(q.getOptions());
                        Collections.shuffle(options);
                    }

                    return new QuestionResponse(
                            q.getId(),
                            q.getQuestion(),
                            options,
                            q.getType().name(),
                            q.getDifficulty().name(),
                            q.getTopic().getId()
                    );
                }).toList();

        return ResponseEntity.ok(Map.of(
                "sessionId", session.getId(),
                "endTime", session.getEndTime(),
                "questions", safe
        ));
    }

    /* ================= SUBMIT ================= */

    @PostMapping("/submit/{sessionId}")
    public ResponseEntity<?> submit(
            @PathVariable Long sessionId,
            @RequestBody Map<Long, AnswerDTO> answers,
            @RequestHeader("Authorization") String auth) {

        User user = authUser(auth);

        RealExamSession session =
                sessionRepo.findById(sessionId).orElseThrow();

        if (!session.getUserId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        int total = answers.size();
        int correct = 0;
        List<String> weakTopics = new ArrayList<>();

        for (Map.Entry<Long, AnswerDTO> entry : answers.entrySet()) {

            Question q = questionRepo.findById(entry.getKey()).orElse(null);
            if (q == null) continue;

            boolean isCorrect = evaluate(q, entry.getValue());

            if (isCorrect) {
                correct++;
            } else {
                weakTopics.add(q.getTopic().getName());
            }
        }

        int wrong = total - correct;
        double scorePercent =
                total == 0 ? 0 : (correct * 100.0) / total;

        session.setTotal(total);
        session.setCorrect(correct);
        session.setWrong(wrong);
        session.setScorePercent(scorePercent);
        session.setEndTime(LocalDateTime.now());
        session.setStatus(RealExamSession.Status.COMPLETED);

        sessionRepo.save(session);

        return ResponseEntity.ok(Map.of(
                "total", total,
                "correct", correct,
                "wrong", wrong,
                "scorePercent", scorePercent,
                "weakTopics", weakTopics,
                "attemptId", sessionId,
                "aiRecommendation", ""
        ));
    }

    /* ================= EVALUATION ================= */

    private boolean evaluate(Question q, AnswerDTO a) {

        if (a == null) return false;

        switch (q.getType()) {

            case MCQ:
                return a.getSelected() != null &&
                        a.getSelected().equals(q.getCorrect());

            case MULTI:
                return a.getSelectedMultiple() != null &&
                        a.getSelectedMultiple()
                                .containsAll(q.getCorrectMultiple()) &&
                        a.getSelectedMultiple().size()
                                == q.getCorrectMultiple().size();

            case NAQ:
                if (a.getSelectedNumeric() == null
                        || q.getCorrectNumeric() == null)
                    return false;

                double tol =
                        q.getTolerance() == null ? 0.0 : q.getTolerance();

                return Math.abs(
                        a.getSelectedNumeric()
                                - q.getCorrectNumeric()
                ) <= tol;
        }

        return false;
    }
}