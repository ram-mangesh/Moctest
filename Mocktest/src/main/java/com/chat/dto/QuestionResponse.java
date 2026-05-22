package com.chat.dto;

import java.util.List;

public class QuestionResponse {

    private Long id;
    private String question;
    private List<String> options;
    private String type;
    private String difficulty;
    private Long topicId;

    public QuestionResponse(
            Long id,
            String question,
            List<String> options,
            String type,
            String difficulty,
            Long topicId
    ) {
        this.id = id;
        this.question = question;
        this.options = options;
        this.type = type;
        this.difficulty = difficulty;
        this.topicId = topicId;
    }

    public Long getId() { return id; }
    public String getQuestion() { return question; }
    public List<String> getOptions() { return options; }
    public String getType() { return type; }
    public String getDifficulty() { return difficulty; }
    public Long getTopicId() { return topicId; }
}