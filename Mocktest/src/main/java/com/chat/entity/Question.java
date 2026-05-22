package com.chat.entity;

import jakarta.persistence.*;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String question;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "topic_id", nullable = false)
    @JsonIgnore
    private Topic topic;

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

    // GETTERS & SETTERS
    public Long getId() { return id; }

    public String getQuestion() { return question; }
    public void setQuestion(String question) { this.question = question; }

    public Topic getTopic() { return topic; }
    public void setTopic(Topic topic) { this.topic = topic; }

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

	public Question(Long id, String question, Topic topic, List<String> options, Integer correct,
			List<Integer> correctMultiple, Double correctNumeric, Double tolerance, QuestionType type,
			DifficultyLevel difficulty) {
		super();
		this.id = id;
		this.question = question;
		this.topic = topic;
		this.options = options;
		this.correct = correct;
		this.correctMultiple = correctMultiple;
		this.correctNumeric = correctNumeric;
		this.tolerance = tolerance;
		this.type = type;
		this.difficulty = difficulty;
	}
    
     public Question() {
		// TODO Auto-generated constructor stub
	}
}