package com.chat.entity;

import java.util.List;

public class ResultResponse {

    private int total;
    private int correct;
    private int wrong;

    private List<String> weakTopics;
    private String aiRecommendation;
    private Long attemptId;

    public ResultResponse() {
    }

    public ResultResponse(
            int total,
            int correct,
            int wrong,
            List<String> weakTopics,
            String aiRecommendation,
            Long attemptId
    ) {
        this.total = total;
        this.correct = correct;
        this.wrong = wrong;
        this.weakTopics = weakTopics;
        this.aiRecommendation = aiRecommendation;
        this.attemptId = attemptId;
    }

    public int getTotal() {
        return total;
    }

    public void setTotal(int total) {
        this.total = total;
    }

    public int getCorrect() {
        return correct;
    }

    public void setCorrect(int correct) {
        this.correct = correct;
    }

    public int getWrong() {
        return wrong;
    }

    public void setWrong(int wrong) {
        this.wrong = wrong;
    }

    public List<String> getWeakTopics() {
        return weakTopics;
    }

    public void setWeakTopics(List<String> weakTopics) {
        this.weakTopics = weakTopics;
    }

    public String getAiRecommendation() {
        return aiRecommendation;
    }

    public void setAiRecommendation(String aiRecommendation) {
        this.aiRecommendation = aiRecommendation;
    }

    public Long getAttemptId() {
        return attemptId;
    }

    public void setAttemptId(Long attemptId) {
        this.attemptId = attemptId;
    }
}