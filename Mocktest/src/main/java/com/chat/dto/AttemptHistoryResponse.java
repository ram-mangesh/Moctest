package com.chat.dto;

import java.time.LocalDateTime;

public class AttemptHistoryResponse {

    private Long   attemptId;
    private Long   topicId;
    private String examName;
    private String subjectName;
    private String topicName;
    private int    total;
    private int    correct;
    private int    wrong;
    private double scorePercent;
    private LocalDateTime attemptedAt;

    public AttemptHistoryResponse(
            Long attemptId, Long topicId,
            String examName, String subjectName, String topicName,
            int total, int correct, int wrong,
            double scorePercent, LocalDateTime attemptedAt) {
        this.attemptId   = attemptId;  this.topicId     = topicId;
        this.examName    = examName;   this.subjectName = subjectName;
        this.topicName   = topicName;  this.total       = total;
        this.correct     = correct;    this.wrong       = wrong;
        this.scorePercent = scorePercent; this.attemptedAt = attemptedAt;
    }

    /* Real-exam constructor — no topicId */
    public AttemptHistoryResponse(
            Long attemptId,
            String examName, String subjectName, String topicName,
            int total, int correct, int wrong,
            double scorePercent, LocalDateTime attemptedAt) {
        this(attemptId, null, examName, subjectName, topicName,
             total, correct, wrong, scorePercent, attemptedAt);
    }

    public Long   getAttemptId()               { return attemptId; }
    public void   setAttemptId(Long v)         { this.attemptId = v; }
    public Long   getTopicId()                 { return topicId; }
    public void   setTopicId(Long v)           { this.topicId = v; }
    public String getExamName()                { return examName; }
    public void   setExamName(String v)        { this.examName = v; }
    public String getSubjectName()             { return subjectName; }
    public void   setSubjectName(String v)     { this.subjectName = v; }
    public String getTopicName()               { return topicName; }
    public void   setTopicName(String v)       { this.topicName = v; }
    public int    getTotal()                   { return total; }
    public void   setTotal(int v)              { this.total = v; }
    public int    getCorrect()                 { return correct; }
    public void   setCorrect(int v)            { this.correct = v; }
    public int    getWrong()                   { return wrong; }
    public void   setWrong(int v)              { this.wrong = v; }
    public double getScorePercent()            { return scorePercent; }
    public void   setScorePercent(double v)    { this.scorePercent = v; }
    public LocalDateTime getAttemptedAt()      { return attemptedAt; }
    public void setAttemptedAt(LocalDateTime v){ this.attemptedAt = v; }
}