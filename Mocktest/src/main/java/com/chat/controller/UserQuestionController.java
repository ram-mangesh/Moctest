package com.chat.controller;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.chat.dto.QuestionResponse;
import com.chat.entity.DifficultyLevel;
import com.chat.entity.Question;
import com.chat.entity.QuestionType;
import com.chat.repo.QuestionRepository;

@RestController
@RequestMapping("/api/user/questions")
public class UserQuestionController {

    private final QuestionRepository questionRepo;

    public UserQuestionController(QuestionRepository questionRepo) {
        this.questionRepo = questionRepo;
    }

    /**
     * GET /api/user/questions?topicId=3
     * GET /api/user/questions?topicId=3&difficulty=EASY   ← filtered by level
     */
    @GetMapping
    public List<QuestionResponse> getByTopic(
            @RequestParam Long topicId,
            @RequestParam(required = false) String difficulty) {

        List<Question> questions;

        if (difficulty != null && !difficulty.isBlank()) {
            try {
                DifficultyLevel level = DifficultyLevel.valueOf(difficulty.toUpperCase());
                questions = questionRepo.findByTopicIdAndDifficulty(topicId, level);
            } catch (IllegalArgumentException e) {
                // Invalid difficulty string — fall back to all questions
                questions = questionRepo.findByTopicId(topicId);
            }
        } else {
            questions = questionRepo.findByTopicId(topicId);
        }

        // 🔥 shuffle question order
        Collections.shuffle(questions);

        List<QuestionResponse> response = new ArrayList<>();

        for (Question q : questions) {

            List<String> shuffledOptions = null;

            // Only shuffle options for MCQ / MULTI
            if (q.getType() != null &&
                q.getType() != QuestionType.NAQ &&
                q.getOptions() != null) {

                shuffledOptions = new ArrayList<>(q.getOptions());

                // 🔥 shuffle options
                Collections.shuffle(shuffledOptions);
            }

            response.add(
                new QuestionResponse(
                    q.getId(),
                    q.getQuestion(),
                    shuffledOptions,
                    q.getType() != null ? q.getType().name() : "MCQ",
                    q.getDifficulty() != null ? q.getDifficulty().name() : "EASY",
                    q.getTopic().getId()
                )
            );
        }

        return response;
    }
}