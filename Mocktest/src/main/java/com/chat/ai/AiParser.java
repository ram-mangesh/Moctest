package com.chat.ai;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Component;

import com.chat.entity.DifficultyLevel;
import com.chat.entity.QuestionDraft;
import com.chat.entity.QuestionType;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

@Component
public class AiParser {

    private final ObjectMapper mapper = new ObjectMapper();

    public List<QuestionDraft> parseToDraft(String aiResponse, Long topicId) {

        List<QuestionDraft> result = new ArrayList<>();

        try {
            int start = aiResponse.indexOf('[');
            int end = aiResponse.lastIndexOf(']');

            if (start == -1 || end == -1) {
                System.out.println("⚠️ No valid JSON array found");
                return result;
            }

            String cleanJson = aiResponse.substring(start, end + 1);

            List<Map<String, Object>> rawList =
                mapper.readValue(
                    cleanJson,
                    new TypeReference<List<Map<String, Object>>>() {}
                );

            for (Map<String, Object> raw : rawList) {

                QuestionDraft d = new QuestionDraft();

                // Question
                String question = (String) raw.get("question");
                if (question == null) continue;
                d.setQuestion(question);

                // Options
                if (raw.get("options") instanceof List<?>) {
                    List<String> options = (List<String>) raw.get("options");
                    d.setOptions(options);
                }

                // MCQ correct index
             // MCQ correct index
                if (raw.get("correct") instanceof Number) {
                    d.setCorrect(((Number) raw.get("correct")).intValue());
                } else {
                    d.setCorrect(0); // prevent NULL DB error
                }

                // MULTI correct answers
                if (raw.get("correctMultiple") instanceof List<?>) {
                    List<Integer> multi =
                        mapper.convertValue(raw.get("correctMultiple"), List.class);
                    d.setCorrectMultiple(multi);
                }

                // NAQ numeric answer
                if (raw.get("correctNumeric") instanceof Number) {
                    d.setCorrectNumeric(
                        ((Number) raw.get("correctNumeric")).doubleValue()
                    );
                }

                // tolerance
                if (raw.get("tolerance") instanceof Number) {
                    d.setTolerance(
                        ((Number) raw.get("tolerance")).doubleValue()
                    );
                }

                // Question type
                if (raw.get("type") != null) {
                    try {
                        d.setType(
                            QuestionType.valueOf(
                                raw.get("type").toString().toUpperCase()
                            )
                        );
                    } catch (Exception ignored) {}
                }

                // Difficulty
                if (raw.get("difficulty") != null) {
                    try {
                        d.setDifficulty(
                            DifficultyLevel.valueOf(
                                raw.get("difficulty").toString().toUpperCase()
                            )
                        );
                    } catch (Exception ignored) {}
                }

                d.setTopicId(topicId);
                d.setStatus("DRAFT");

                result.add(d);
            }

        } catch (Exception e) {
            System.out.println("❌ AI JSON parse failed");
            e.printStackTrace();
        }

        return result;
    }
}