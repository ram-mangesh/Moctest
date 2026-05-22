package com.chat.entity;

import jakarta.persistence.*;

@Entity
@Table(
    name = "real_exam_attempt",
    uniqueConstraints = @UniqueConstraint(
        columnNames = {"user_id", "exam_id", "question_id"}
    )
)
public class RealExamAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "exam_id", nullable = false)
    private Long examId;

    @Column(name = "question_id", nullable = false)
    private Long questionId;

    public RealExamAttempt() {}

    public RealExamAttempt(Long userId, Long examId, Long questionId) {
        this.userId = userId;
        this.examId = examId;
        this.questionId = questionId;
    }

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public Long getUserId() {
		return userId;
	}

	public void setUserId(Long userId) {
		this.userId = userId;
	}

	public Long getExamId() {
		return examId;
	}

	public void setExamId(Long examId) {
		this.examId = examId;
	}

	public Long getQuestionId() {
		return questionId;
	}

	public void setQuestionId(Long questionId) {
		this.questionId = questionId;
	}

    // getters & setters
    
    
}