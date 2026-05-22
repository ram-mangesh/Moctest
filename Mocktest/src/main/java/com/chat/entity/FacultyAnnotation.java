package com.chat.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Task 3 — Faculty Annotation Collaboration Endpoint
 *
 * A teacher can annotate a student's ExamAttempt roadmap.
 * Annotations are stored here and an email hook is triggered on save.
 */
@Entity
@Table(name = "faculty_annotation")
public class FacultyAnnotation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // The attempt being annotated
    @Column(nullable = false)
    private Long attemptId;

    // Student who owns the attempt
    @Column(nullable = false)
    private Long studentId;

    // Teacher who wrote the annotation
    @Column(nullable = false)
    private Long teacherId;

    // The annotation text
    @Column(columnDefinition = "TEXT", nullable = false)
    private String note;

    // Optional: tag (e.g. "strength", "weakness", "tip")
    private String tag;

    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }

    /* ── getters & setters ── */

    public Long getId()                     { return id; }

    public Long getAttemptId()              { return attemptId; }
    public void setAttemptId(Long v)        { this.attemptId = v; }

    public Long getStudentId()              { return studentId; }
    public void setStudentId(Long v)        { this.studentId = v; }

    public Long getTeacherId()              { return teacherId; }
    public void setTeacherId(Long v)        { this.teacherId = v; }

    public String getNote()                 { return note; }
    public void setNote(String v)           { this.note = v; }

    public String getTag()                  { return tag; }
    public void setTag(String v)            { this.tag = v; }

    public LocalDateTime getCreatedAt()     { return createdAt; }
    public void setCreatedAt(LocalDateTime v) { this.createdAt = v; }
}