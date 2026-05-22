package com.chat.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "question_attempt")
public class QuestionAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long sessionId;
    private Long questionId;

    private int timeSpent;        // seconds
    private int optionChanges;    // how many times option changed
    private int revisits;         // backtracking count

    private boolean answeredCorrect;
    private long timestamp = System.currentTimeMillis();

    // ---------- getters & setters ----------

    public Long getId() {
        return id;
    }

    public Long getSessionId() {
        return sessionId;
    }

    public void setSessionId(Long sessionId) {
        this.sessionId = sessionId;
    }

    public Long getQuestionId() {
        return questionId;
    }

    public void setQuestionId(Long questionId) {
        this.questionId = questionId;
    }

    public int getTimeSpent() {
        return timeSpent;
    }

    public void setTimeSpent(int timeSpent) {
        this.timeSpent = timeSpent;
    }

    public int getOptionChanges() {
        return optionChanges;
    }

    public void setOptionChanges(int optionChanges) {
        this.optionChanges = optionChanges;
    }

    public int getRevisits() {
        return revisits;
    }

    public void setRevisits(int revisits) {
        this.revisits = revisits;
    }

    public boolean isAnsweredCorrect() {
        return answeredCorrect;
    }

    public void setAnsweredCorrect(boolean answeredCorrect) {
        this.answeredCorrect = answeredCorrect;
    }

	public long getTimestamp() {
		return timestamp;
	}

	public void setTimestamp(long timestamp) {
		this.timestamp = timestamp;
	}
}
