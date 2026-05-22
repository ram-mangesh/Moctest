package com.chat.dto;

import java.util.List;

public class QuestionRequest {

    private String question;
    private Long topicId;
    private List<String> options;

    private Integer correct;
    private List<Integer> correctMultiple;

    private Double correctNumeric;
    private Double tolerance;

    private String type;
    private String difficulty;
	public String getQuestion() {
		return question;
	}
	public void setQuestion(String question) {
		this.question = question;
	}
	public Long getTopicId() {
		return topicId;
	}
	public void setTopicId(Long topicId) {
		this.topicId = topicId;
	}
	public List<String> getOptions() {
		return options;
	}
	public void setOptions(List<String> options) {
		this.options = options;
	}
	public Integer getCorrect() {
		return correct;
	}
	public void setCorrect(Integer correct) {
		this.correct = correct;
	}
	public List<Integer> getCorrectMultiple() {
		return correctMultiple;
	}
	public void setCorrectMultiple(List<Integer> correctMultiple) {
		this.correctMultiple = correctMultiple;
	}
	public Double getCorrectNumeric() {
		return correctNumeric;
	}
	public void setCorrectNumeric(Double correctNumeric) {
		this.correctNumeric = correctNumeric;
	}
	public Double getTolerance() {
		return tolerance;
	}
	public void setTolerance(Double tolerance) {
		this.tolerance = tolerance;
	}
	public String getType() {
		return type;
	}
	public void setType(String type) {
		this.type = type;
	}
	public String getDifficulty() {
		return difficulty;
	}
	public void setDifficulty(String difficulty) {
		this.difficulty = difficulty;
	}

    // getters & setters
    
}