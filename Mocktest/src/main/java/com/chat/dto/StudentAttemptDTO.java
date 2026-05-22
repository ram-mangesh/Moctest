package com.chat.dto;

import java.time.LocalDateTime;

/**
 * Used by TeacherStudentController to show a student's attempts
 * to the teacher in the annotation panel.
 */
public class StudentAttemptDTO {

    private Long   attemptId;
    private String examName;
    private String subjectName;
    private String topicName;
    private int    total;
    private int    correct;
    private double scorePercent;
    private LocalDateTime attemptedAt;

    public StudentAttemptDTO(
            Long attemptId,
            String examName,
            String subjectName,
            String topicName,
            int total,
            int correct,
            double scorePercent,
            LocalDateTime attemptedAt) {
        this.attemptId    = attemptId;
        this.examName     = examName;
        this.subjectName  = subjectName;
        this.topicName    = topicName;
        this.total        = total;
        this.correct      = correct;
        this.scorePercent = scorePercent;
        this.attemptedAt  = attemptedAt;
    }

    public Long   getAttemptId()              { return attemptId; }
    public String getExamName()               { return examName; }
    public String getSubjectName()            { return subjectName; }
    public String getTopicName()              { return topicName; }
    public int    getTotal()                  { return total; }
    public int    getCorrect()                { return correct; }
    public double getScorePercent()           { return scorePercent; }
    public LocalDateTime getAttemptedAt()     { return attemptedAt; }
}