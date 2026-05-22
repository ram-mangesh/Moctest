package com.chat.entity;

import jakarta.persistence.*;
import java.util.List;

@Entity
public class QuestionDraft {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String question;

    @ElementCollection
    private List<String> options;

    // MCQ
    private Integer correct;

    // MULTI
    @ElementCollection
    private List<Integer> correctMultiple;

    // NAQ
    private Double correctNumeric;
    private Double tolerance;

    @Enumerated(EnumType.STRING)
    private QuestionType type;

    @Enumerated(EnumType.STRING)
    private DifficultyLevel difficulty;

    private Long topicId;

    private String status; // DRAFT / APPROVED

    public QuestionDraft() {}

    public Long getId() { return id; }

    public String getQuestion() { return question; }
    public void setQuestion(String question) { this.question = question; }

    public List<String> getOptions() { return options; }
    public void setOptions(List<String> options) { this.options = options; }

    public Integer getCorrect() { return correct; }
    public void setCorrect(Integer correct) { this.correct = correct; }

    public List<Integer> getCorrectMultiple() { return correctMultiple; }
    public void setCorrectMultiple(List<Integer> correctMultiple) { this.correctMultiple = correctMultiple; }

    public Double getCorrectNumeric() { return correctNumeric; }
    public void setCorrectNumeric(Double correctNumeric) { this.correctNumeric = correctNumeric; }

    public Double getTolerance() { return tolerance; }
    public void setTolerance(Double tolerance) { this.tolerance = tolerance; }

    public QuestionType getType() { return type; }
    public void setType(QuestionType type) { this.type = type; }

    public DifficultyLevel getDifficulty() { return difficulty; }
    public void setDifficulty(DifficultyLevel difficulty) { this.difficulty = difficulty; }

    public Long getTopicId() { return topicId; }
    public void setTopicId(Long topicId) { this.topicId = topicId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}