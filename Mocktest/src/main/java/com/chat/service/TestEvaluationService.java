package com.chat.service;

import java.util.*;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.chat.dto.AnswerDTO;
import com.chat.dto.TopicMistakeDetail;
import com.chat.entity.Question;
import com.chat.entity.QuestionType;

@Service
public class TestEvaluationService {

    public Map<String, Map<String, TopicMistakeDetail>> analyzeMistakes(
            List<Question> questions,
            Map<Long, AnswerDTO> answers
    ) {

        Map<String, Map<String, TopicMistakeDetail>> result = new HashMap<>();

        int questionNumber = 1;

        for (Question q : questions) {

            AnswerDTO userAnswer = answers != null ? answers.get(q.getId()) : null;

            boolean isMistake = true;

            if (userAnswer != null) {

                switch (q.getType()) {

                    /* ================= MCQ ================= */

                    case MCQ:

                        if (userAnswer.getSelected() != null
                                && q.getCorrect() != null
                                && q.getOptions() != null) {

                            String correctOption = q.getOptions().get(q.getCorrect());

                            isMistake = !userAnswer.getSelected()
                                    .trim()
                                    .equalsIgnoreCase(correctOption.trim());
                        }

                        break;

                    /* ================= MULTI ================= */

                    case MULTI:

                        if (userAnswer.getSelectedMultiple() != null
                                && q.getCorrectMultiple() != null
                                && q.getOptions() != null) {

                            List<String> correctOptions =
                                    q.getCorrectMultiple()
                                            .stream()
                                            .map(i -> q.getOptions().get(i))
                                            .map(String::trim)
                                            .map(String::toLowerCase)
                                            .collect(Collectors.toList());

                            List<String> selected =
                                    userAnswer.getSelectedMultiple()
                                            .stream()
                                            .map(String::trim)
                                            .map(String::toLowerCase)
                                            .collect(Collectors.toList());

                            isMistake =
                                    correctOptions.size() != selected.size()
                                            || !correctOptions.containsAll(selected);
                        }

                        break;

                    /* ================= NUMERIC ================= */

                    case NAQ:

                        if (userAnswer.getSelectedNumeric() != null
                                && q.getCorrectNumeric() != null) {

                            double tolerance =
                                    q.getTolerance() == null
                                            ? 0.0
                                            : q.getTolerance();

                            isMistake =
                                    Math.abs(
                                            userAnswer.getSelectedNumeric()
                                                    - q.getCorrectNumeric()
                                    ) > tolerance;
                        }

                        break;

                    default:
                        break;
                }
            }

            if (isMistake) {

                String subject = q.getTopic().getSubject().getName();
                String topic = q.getTopic().getName();

                TopicMistakeDetail oldDetail = result
                        .computeIfAbsent(subject, s -> new HashMap<>())
                        .computeIfAbsent(
                                topic,
                                t -> new TopicMistakeDetail(0, new ArrayList<>())
                        );

                oldDetail.getWrongQuestions().add(questionNumber);

                TopicMistakeDetail updatedDetail =
                        new TopicMistakeDetail(
                                oldDetail.getCount() + 1,
                                oldDetail.getWrongQuestions()
                        );

                result.get(subject).put(topic, updatedDetail);
            }

            questionNumber++;
        }

        return result;
    }
}