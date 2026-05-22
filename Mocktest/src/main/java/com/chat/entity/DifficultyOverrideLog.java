package com.chat.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Task 4 — Adaptive Difficulty Slider Prototype
 *
 * Logs every time a student manually overrides the difficulty
 * via the frontend slider during an exam session.
 * Used for post-test review of edge cases.
 */
@Entity
@Table(name = "difficulty_override_log")
public class DifficultyOverrideLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;
    private Long topicId;

    @Enumerated(EnumType.STRING)
    private DifficultyLevel selectedDifficulty;

    private LocalDateTime loggedAt;

    @PrePersist
    public void prePersist() {
        this.loggedAt = LocalDateTime.now();
    }

    public Long getId()                         { return id; }

    public Long getUserId()                     { return userId; }
    public void setUserId(Long v)               { this.userId = v; }

    public Long getTopicId()                    { return topicId; }
    public void setTopicId(Long v)              { this.topicId = v; }

    public DifficultyLevel getSelectedDifficulty()          { return selectedDifficulty; }
    public void setSelectedDifficulty(DifficultyLevel v)    { this.selectedDifficulty = v; }

    public LocalDateTime getLoggedAt()          { return loggedAt; }
    public void setLoggedAt(LocalDateTime v)    { this.loggedAt = v; }
}