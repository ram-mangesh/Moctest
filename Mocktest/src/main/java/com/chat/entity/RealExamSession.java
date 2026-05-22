package com.chat.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(
    name = "real_exam_session",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "exam_id"})
    }
)
public class RealExamSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "exam_id", nullable = false)
    private Long examId;

    /* ================= USED QUESTIONS ================= */
    @ElementCollection
    @CollectionTable(
        name = "real_exam_used_questions",
        joinColumns = @JoinColumn(name = "session_id")
    )
    @Column(name = "question_id")
    private Set<Long> usedQuestionIds = new HashSet<>();

    /* ================= TIME ================= */
    private LocalDateTime startedAt;

    // ✅ ACTUAL submit time (REAL)
    private LocalDateTime endTime;

    // ✅ Allowed duration in seconds (e.g. 1800)
    private int duration;

    // ✅ HARD DEADLINE (start + duration)
    private LocalDateTime deadlineAt;

    private int attemptCount;

    /* ================= RESULT ================= */
    private int total;
    private int correct;
    private int wrong;
    private double scorePercent;

    /* ================= STATUS ================= */
    @Enumerated(EnumType.STRING)
    private Status status;

    public enum Status {
        ACTIVE,
        COMPLETED
    }

    /* ================= GETTERS / SETTERS ================= */

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public Long getExamId() { return examId; }
    public void setExamId(Long examId) { this.examId = examId; }

    public Set<Long> getUsedQuestionIds() { return usedQuestionIds; }
    public void setUsedQuestionIds(Set<Long> usedQuestionIds) {
        this.usedQuestionIds = usedQuestionIds;
    }

    public LocalDateTime getStartedAt() { return startedAt; }
    public void setStartedAt(LocalDateTime startedAt) {
        this.startedAt = startedAt;
    }

    public LocalDateTime getEndTime() { return endTime; }
    public void setEndTime(LocalDateTime endTime) {
        this.endTime = endTime;
    }

    public int getDuration() { return duration; }
    public void setDuration(int duration) { this.duration = duration; }

    public LocalDateTime getDeadlineAt() { return deadlineAt; }
    public void setDeadlineAt(LocalDateTime deadlineAt) {
        this.deadlineAt = deadlineAt;
    }

    public int getAttemptCount() { return attemptCount; }
    public void setAttemptCount(int attemptCount) {
        this.attemptCount = attemptCount;
    }

    public int getTotal() { return total; }
    public void setTotal(int total) { this.total = total; }

    public int getCorrect() { return correct; }
    public void setCorrect(int correct) { this.correct = correct; }

    public int getWrong() { return wrong; }
    public void setWrong(int wrong) { this.wrong = wrong; }

    public double getScorePercent() { return scorePercent; }
    public void setScorePercent(double scorePercent) {
        this.scorePercent = scorePercent;
    }

    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }
}