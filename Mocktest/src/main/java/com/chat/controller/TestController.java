package com.chat.controller;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.*;

import com.chat.dto.AttemptHistoryResponse;
import com.chat.dto.TopicMistakeDetail;
import com.chat.entity.ExamAttempt;
import com.chat.entity.Question;
import com.chat.entity.RealExamSession;
import com.chat.entity.ResultResponse;
import com.chat.entity.SubmitRequest;
import com.chat.entity.User;
import com.chat.repo.ExamAttemptRepository;
import com.chat.repo.ExamRepository;
import com.chat.repo.QuestionRepository;
import com.chat.repo.RealExamSessionRepository;
import com.chat.repo.Userrepo;
import com.chat.security.JwtUtil;
import com.chat.service.AiAsyncService;
import com.chat.service.TestEvaluationService;
import com.fasterxml.jackson.databind.ObjectMapper;

@RestController
@RequestMapping("/api/user/test")
public class TestController {

    private final QuestionRepository          questionRepo;
    private final ExamAttemptRepository       attemptRepo;
    private final TestEvaluationService       evaluationService;
    private final AiAsyncService              aiAsyncService;
    private final JwtUtil                     jwtUtil;
    private final Userrepo                    userRepo;
    private final RealExamSessionRepository   realExamSessionRepo;
    private final ExamRepository              examRepo;
    private final ObjectMapper                objectMapper;

    public TestController(
            QuestionRepository questionRepo,
            ExamAttemptRepository attemptRepo,
            TestEvaluationService evaluationService,
            AiAsyncService aiAsyncService,
            JwtUtil jwtUtil,
            Userrepo userRepo,
            RealExamSessionRepository realExamSessionRepo,
            ExamRepository examRepo,
            ObjectMapper objectMapper) {
        this.questionRepo        = questionRepo;
        this.attemptRepo         = attemptRepo;
        this.evaluationService   = evaluationService;
        this.aiAsyncService      = aiAsyncService;
        this.jwtUtil             = jwtUtil;
        this.userRepo            = userRepo;
        this.realExamSessionRepo = realExamSessionRepo;
        this.examRepo            = examRepo;
        this.objectMapper        = objectMapper;
    }

    /* ── SUBMIT ── */
    @PostMapping("/submit")
    public ResultResponse submitTest(
            @RequestParam Long topicId,
            @RequestBody SubmitRequest request,
            @RequestHeader("Authorization") String authHeader) {

        String token = authHeader.replace("Bearer ", "");
        String email = jwtUtil.extractEmail(token);
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Question> questions = questionRepo.findByTopicId(topicId);
        if (questions.isEmpty())
            throw new RuntimeException("No questions found for topic");

        Map<String, Map<String, TopicMistakeDetail>> mistakes =
                evaluationService.analyzeMistakes(questions, request.getAnswers());

        int totalMistakes = mistakes.values().stream()
                .flatMap(m -> m.values().stream())
                .mapToInt(TopicMistakeDetail::getCount).sum();

        List<String> weakTopics = new ArrayList<>();
        mistakes.forEach((subject, topicMap) ->
                topicMap.forEach((topic, detail) -> {
                    if (detail.getWrongQuestions() != null
                            && !detail.getWrongQuestions().isEmpty()) {
                        weakTopics.add(subject + " - " + topic
                                + " (Wrong Qs: " + detail.getWrongQuestions() + ")");
                    }
                }));

        ExamAttempt attempt = new ExamAttempt();
        attempt.setUserId(user.getId());
        attempt.setTopicId(topicId);
        attempt.setTotal(questions.size());
        attempt.setCorrect(questions.size() - totalMistakes);
        attempt.setWrong(totalMistakes);
        attempt.setScorePercent((attempt.getCorrect() * 100.0) / questions.size());
        attempt.setAttemptedAt(LocalDateTime.now());

        // SAVE student's answers as JSON so teacher can review them
        try {
            if (request.getAnswers() != null) {
                attempt.setAnswersJson(
                    objectMapper.writeValueAsString(request.getAnswers())
                );
            }
        } catch (Exception e) {
            // non-critical — don't fail submission if JSON serialization fails
            System.err.println("Failed to serialize answers: " + e.getMessage());
        }

        attemptRepo.save(attempt);
        
        // Initialize lazy collections before going async
        questions.forEach(q -> {
            if (q.getOptions() != null) q.getOptions().size();
            if (q.getCorrectMultiple() != null) q.getCorrectMultiple().size();
        });

        aiAsyncService.generateAiInBackground(
                attempt.getId(), mistakes, questions, request.getAnswers());

        ResultResponse result = new ResultResponse();
        result.setTotal(questions.size());
        result.setCorrect(questions.size() - totalMistakes);
        result.setWrong(totalMistakes);
        result.setWeakTopics(weakTopics);
        result.setAttemptId(attempt.getId());
        result.setAiRecommendation("AI is generating recommendations...");
        return result;
    }

    /* ── AI RESULT POLLING ── */
    @GetMapping("/ai-result")
    public Map<String, String> getAiResult(@RequestParam Long attemptId) {
        ExamAttempt attempt = attemptRepo.findById(attemptId)
                .orElseThrow(() -> new RuntimeException("Attempt not found"));
        return Map.of("aiRecommendation",
                attempt.getAiRecommendation() == null ? "" : attempt.getAiRecommendation());
    }

    /* ── ATTEMPT HISTORY ── */
    @GetMapping("/attempts")
    public List<AttemptHistoryResponse> getAttempts(
            @RequestHeader("Authorization") String authHeader) {

        String token = authHeader.replace("Bearer ", "");
        String email = jwtUtil.extractEmail(token);
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<AttemptHistoryResponse> response = new ArrayList<>();

        attemptRepo.findByUserIdOrderByAttemptedAtAsc(user.getId())
                .forEach(a -> {
                    questionRepo.findByTopicId(a.getTopicId())
                            .stream().findFirst().ifPresent(q -> {
                                response.add(new AttemptHistoryResponse(
                                        a.getId(),
                                        a.getTopicId(),
                                        q.getTopic().getSubject().getExam().getName(),
                                        q.getTopic().getSubject().getName(),
                                        q.getTopic().getName(),
                                        a.getTotal(),
                                        a.getCorrect(),
                                        a.getWrong(),
                                        a.getScorePercent(),
                                        a.getAttemptedAt()
                                ));
                            });
                });

        realExamSessionRepo
                .findByUserIdAndStatus(user.getId(), RealExamSession.Status.COMPLETED)
                .forEach(s -> {
                    String examName = examRepo.findById(s.getExamId())
                            .map(e -> e.getName()).orElse("Exam");
                    response.add(new AttemptHistoryResponse(
                            s.getId(),
                            examName, "—", "Real Exam",
                            s.getTotal(), s.getCorrect(), s.getWrong(),
                            s.getScorePercent(), s.getStartedAt()
                    ));
                });

        return response;
    }
}