package com.chat.service;

import java.util.List;
import java.util.Map;

import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import com.chat.dto.AnswerDTO;
import com.chat.dto.TopicMistakeDetail;
import com.chat.entity.ExamAttempt;
import com.chat.entity.Question;
import com.chat.repo.ExamAttemptRepository;

@Service
public class AiAsyncService {

    private final AiRecommendationService aiService;
    private final ExamAttemptRepository attemptRepo;

    public AiAsyncService(
            AiRecommendationService aiService,
            ExamAttemptRepository attemptRepo
    ) {
        this.aiService = aiService;
        this.attemptRepo = attemptRepo;
    }

    @Async
    public void generateAiInBackground(
            Long attemptId,
            Map<String, Map<String, TopicMistakeDetail>> mistakes,
            List<Question> questions,
            Map<Long, AnswerDTO> answers
    ) {

        String aiText = aiService.generateRecommendation(
                mistakes,
                questions,
                answers
        );

        ExamAttempt attempt = attemptRepo.findById(attemptId).orElseThrow();

        attempt.setAiRecommendation(aiText);

        attemptRepo.save(attempt);
    }
}