package com.chat.controller;

import com.chat.dto.AnswerDTO;
import com.chat.dto.QuestionReviewDTO;
import com.chat.dto.StudentAttemptDTO;
import com.chat.entity.ExamAttempt;
import com.chat.entity.Question;
import com.chat.entity.QuestionType;
import com.chat.entity.User;
import com.chat.repo.ExamAttemptRepository;
import com.chat.repo.QuestionRepository;
import com.chat.repo.Userrepo;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/students")
public class TeacherStudentController {

    private final Userrepo              userRepo;
    private final ExamAttemptRepository attemptRepo;
    private final QuestionRepository    questionRepo;
    private final ObjectMapper          objectMapper;

    public TeacherStudentController(
            Userrepo userRepo,
            ExamAttemptRepository attemptRepo,
            QuestionRepository questionRepo,
            ObjectMapper objectMapper) {
        this.userRepo     = userRepo;
        this.attemptRepo  = attemptRepo;
        this.questionRepo = questionRepo;
        this.objectMapper = objectMapper;
    }

    /* ── SEARCH STUDENTS ── */
    @GetMapping("/search")
    public List<Map<String, Object>> searchStudents(
            @RequestParam(defaultValue = "") String name) {

        List<User> users = name.trim().isEmpty()
                ? userRepo.findByRole("USER")
                : userRepo.findByNameContainingIgnoreCaseAndRole(name.trim(), "USER");

        return users.stream().map(u -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id",    u.getId());
            m.put("name",  u.getName());
            m.put("email", u.getEmail());
            return m;
        }).collect(Collectors.toList());
    }

    /* ── GET STUDENT ATTEMPTS ── */
    @GetMapping("/{studentId}/attempts")
    public List<StudentAttemptDTO> getStudentAttempts(@PathVariable Long studentId) {

        List<ExamAttempt> attempts =
                attemptRepo.findByUserIdOrderByAttemptedAtAsc(studentId);

        List<StudentAttemptDTO> result = new ArrayList<>();

        for (ExamAttempt a : attempts) {
            questionRepo.findByTopicId(a.getTopicId())
                    .stream().findFirst().ifPresent(q ->
                        result.add(new StudentAttemptDTO(
                                a.getId(),
                                q.getTopic().getSubject().getExam().getName(),
                                q.getTopic().getSubject().getName(),
                                q.getTopic().getName(),
                                a.getTotal(),
                                a.getCorrect(),
                                a.getScorePercent(),
                                a.getAttemptedAt()
                        ))
                    );
        }

        result.sort(Comparator.comparing(
                StudentAttemptDTO::getAttemptedAt,
                Comparator.nullsLast(Comparator.reverseOrder())
        ));

        return result;
    }

    /* ── FULL REVIEW ── */
    @GetMapping("/attempts/{attemptId}/review")
    public List<QuestionReviewDTO> getAttemptReview(@PathVariable Long attemptId) {

        ExamAttempt attempt = attemptRepo.findById(attemptId)
                .orElseThrow(() -> new RuntimeException("Attempt not found"));

        // ── try to deserialize student's answers ──────────────────────────────
        Map<Long, AnswerDTO> answers = new HashMap<>();
        boolean hasAnswerData = false;

        String json = attempt.getAnswersJson();
        if (json != null && !json.isBlank()) {
            try {
                Map<String, AnswerDTO> raw = objectMapper.readValue(
                        json, new TypeReference<Map<String, AnswerDTO>>() {});
                raw.forEach((k, v) -> {
                    try { answers.put(Long.parseLong(k), v); }
                    catch (NumberFormatException ignored) {}
                });
                hasAnswerData = !answers.isEmpty();
            } catch (Exception e) {
                System.err.println("Failed to parse answersJson: " + e.getMessage());
            }
        }

        // ── build review DTOs ─────────────────────────────────────────────────
        List<Question> questions = questionRepo.findByTopicId(attempt.getTopicId());
        List<QuestionReviewDTO> review = new ArrayList<>();
        int qNum = 1;

        for (Question q : questions) {
            QuestionReviewDTO dto = new QuestionReviewDTO();
            dto.setQuestionId(q.getId());
            dto.setQuestionNumber(qNum++);
            dto.setQuestionText(q.getQuestion());
            dto.setType(q.getType() != null ? q.getType().name() : "MCQ");
            dto.setDifficulty(q.getDifficulty() != null ? q.getDifficulty().name() : "");
            dto.setOptions(q.getOptions());

            // KEY FIX: set hasAnswerData on every DTO
            dto.setHasAnswerData(hasAnswerData);

            AnswerDTO ans = hasAnswerData ? answers.get(q.getId()) : null;

            if (q.getType() == QuestionType.MCQ) {
                String correctText = (q.getCorrect() != null && q.getOptions() != null
                        && q.getCorrect() < q.getOptions().size())
                        ? q.getOptions().get(q.getCorrect()) : null;
                dto.setCorrectAnswer(correctText);

                if (hasAnswerData) {
                    String studentAns = (ans != null) ? ans.getSelected() : null;
                    dto.setStudentSelected(studentAns);
                    boolean isCorrect = studentAns != null && correctText != null
                            && studentAns.trim().equalsIgnoreCase(correctText.trim());
                    dto.setCorrect(isCorrect);
                } else {
                    // no data — leave studentSelected null, correct = false (unused)
                    dto.setStudentSelected(null);
                    dto.setCorrect(false);
                }

            } else if (q.getType() == QuestionType.MULTI) {
                List<String> correctTexts = new ArrayList<>();
                if (q.getCorrectMultiple() != null && q.getOptions() != null) {
                    for (Integer idx : q.getCorrectMultiple()) {
                        if (idx < q.getOptions().size())
                            correctTexts.add(q.getOptions().get(idx));
                    }
                }
                dto.setCorrectAnswerMultiple(correctTexts);

                if (hasAnswerData) {
                    List<String> studentSel = (ans != null && ans.getSelectedMultiple() != null)
                            ? ans.getSelectedMultiple() : new ArrayList<>();
                    dto.setStudentSelectedMultiple(studentSel);
                    boolean isCorrect = studentSel.size() == correctTexts.size()
                            && correctTexts.stream().map(String::toLowerCase).collect(Collectors.toSet())
                                  .equals(studentSel.stream().map(String::toLowerCase).collect(Collectors.toSet()));
                    dto.setCorrect(isCorrect);
                } else {
                    dto.setStudentSelectedMultiple(new ArrayList<>());
                    dto.setCorrect(false);
                }

            } else if (q.getType() == QuestionType.NAQ) {
                dto.setCorrectNumeric(q.getCorrectNumeric());
                dto.setTolerance(q.getTolerance());

                if (hasAnswerData) {
                    Double studentNum = (ans != null) ? ans.getSelectedNumeric() : null;
                    dto.setStudentNumeric(studentNum);
                    boolean isCorrect = studentNum != null && q.getCorrectNumeric() != null
                            && Math.abs(studentNum - q.getCorrectNumeric())
                                  <= (q.getTolerance() == null ? 0.0 : q.getTolerance());
                    dto.setCorrect(isCorrect);
                } else {
                    dto.setStudentNumeric(null);
                    dto.setCorrect(false);
                }
            }

            review.add(dto);
        }

        return review;
    }
}