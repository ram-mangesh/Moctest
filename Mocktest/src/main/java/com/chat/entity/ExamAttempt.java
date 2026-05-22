package com.chat.entity;

import java.time.LocalDateTime;
import jakarta.persistence.*;

/**
 * UPDATED: Added answersJson column to persist student's answers
 * so the teacher can review them in the Annotation Panel.
 *
 * answersJson stores the Map<Long, AnswerDTO> serialized as JSON string.
 * Example: {"1":{"selected":"Paris"},"2":{"selectedNumeric":42.0}}
 *
 * REPLACE your existing ExamAttempt.java with this file.
 */
@Entity
public class ExamAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;
    private Long topicId;

    private int total;
    private int correct;
    private int wrong;
    private double scorePercent;

    private LocalDateTime attemptedAt;

    @Column(columnDefinition = "TEXT")
    private String aiRecommendation;

    // NEW: stores student's answers as JSON for teacher review
    @Column(columnDefinition = "TEXT")
    private String answersJson;

    public Long getId()                         { return id; }
    public void setId(Long id)                  { this.id = id; }

    public Long getUserId()                     { return userId; }
    public void setUserId(Long v)               { this.userId = v; }

    public Long getTopicId()                    { return topicId; }
    public void setTopicId(Long v)              { this.topicId = v; }

    public int getTotal()                       { return total; }
    public void setTotal(int v)                 { this.total = v; }

    public int getCorrect()                     { return correct; }
    public void setCorrect(int v)               { this.correct = v; }

    public int getWrong()                       { return wrong; }
    public void setWrong(int v)                 { this.wrong = v; }

    public double getScorePercent()             { return scorePercent; }
    public void setScorePercent(double v)       { this.scorePercent = v; }

    public LocalDateTime getAttemptedAt()       { return attemptedAt; }
    public void setAttemptedAt(LocalDateTime v) { this.attemptedAt = v; }

    public String getAiRecommendation()         { return aiRecommendation; }
    public void setAiRecommendation(String v)   { this.aiRecommendation = v; }

    public String getAnswersJson()              { return answersJson; }
    public void setAnswersJson(String v)        { this.answersJson = v; }
}