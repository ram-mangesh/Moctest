package com.chat.entity;

import java.util.Map;
import com.chat.dto.AnswerDTO;

public class SubmitRequest {

    private Map<Long, AnswerDTO> answers;

    public Map<Long, AnswerDTO> getAnswers() {
        return answers;
    }

    public void setAnswers(Map<Long, AnswerDTO> answers) {
        this.answers = answers;
    }
}