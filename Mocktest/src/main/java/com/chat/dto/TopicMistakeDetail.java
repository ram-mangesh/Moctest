package com.chat.dto;

import java.util.ArrayList;
import java.util.List;

public class TopicMistakeDetail {

    private int count;
    private List<Integer> wrongQuestions = new ArrayList<>();

    public TopicMistakeDetail() {}

    public TopicMistakeDetail(int count, List<Integer> wrongQuestions) {
        this.count = count;
        this.wrongQuestions = wrongQuestions;
    }

    public int getCount() {
        return count;
    }

    public List<Integer> getWrongQuestions() {
        return wrongQuestions;
    }

    public void addWrongQuestion(int qNo) {
        this.wrongQuestions.add(qNo);
        this.count++;
    }
}
