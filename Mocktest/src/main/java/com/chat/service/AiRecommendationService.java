package com.chat.service;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.chat.ai.OpenRouterClient;
import com.chat.ai.OllamaFallbackClient;
import com.chat.dto.AnswerDTO;
import com.chat.dto.TopicMistakeDetail;
import com.chat.entity.Question;

@Service
public class AiRecommendationService {

    private final OpenRouterClient openRouter;
    private final OllamaFallbackClient ollama;

    public AiRecommendationService(
            OpenRouterClient openRouter,
            OllamaFallbackClient ollama
    ) {
        this.openRouter = openRouter;
        this.ollama = ollama;
    }

    public String generateRecommendation(
            Map<String, Map<String, TopicMistakeDetail>> mistakes,
            List<Question> questions,
            Map<Long, AnswerDTO> answers
    ) {

        StringBuilder studentData = new StringBuilder();

        for (Question q : questions) {

            AnswerDTO ans = answers.get(q.getId());

            if (ans == null) continue;

            studentData.append("Question:\n")
                    .append(q.getQuestion())
                    .append("\n\n");

            if (q.getOptions() != null && !q.getOptions().isEmpty()) {

                studentData.append("Options:\n");

                char option = 'A';

                for (String op : q.getOptions()) {

                    studentData.append(option)
                            .append(") ")
                            .append(op)
                            .append("\n");

                    option++;
                }

                studentData.append("\n");
            }

            if (ans.getSelected() != null) {

                studentData.append("Student Selected: ")
                        .append(ans.getSelected())
                        .append("\n");
            }

            if (q.getCorrect() != null && q.getOptions() != null) {

                studentData.append("Correct Answer: ")
                        .append(q.getOptions().get(q.getCorrect()))
                        .append("\n");
            }

            studentData.append("\n--------------------------------\n\n");
        }

        String prompt = """
You are an exam mentor analyzing a student's wrong answers.

For each question:
1. Show the question
2. Show the options
3. Show the student's answer
4. Show the correct answer
5. Explain why the correct answer is correct.

Do not add introductions.
Do not summarize.
Only analyze the questions provided.

Student Wrong Questions:
""" + studentData.toString();

        String aiResponse = "";

        try {
            aiResponse = openRouter.call(prompt);
        } catch (Exception e) {
            System.out.println("OpenRouter failed");
        }

        if (aiResponse == null || aiResponse.isEmpty()) {

            try {
                aiResponse = ollama.call(prompt);
            } catch (Exception e) {
                return fallback();
            }
        }

        if (aiResponse == null || aiResponse.isEmpty()) {
            return fallback();
        }

        return aiResponse;
    }

    private String fallback() {

        return """
AI recommendation unavailable.

Practice 20 questions daily.
Take one mock test every 7 days.
""";
    }
}