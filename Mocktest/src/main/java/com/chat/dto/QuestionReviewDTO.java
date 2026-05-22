package com.chat.dto;

import java.util.List;

/**
 * FIXED: Added hasAnswerData flag.
 * When false → student's answer is unknown (attempt predates answer tracking).
 * Frontend shows correct answer only, does NOT mark as wrong.
 */
public class QuestionReviewDTO {

    private Long   questionId;
    private int    questionNumber;
    private String questionText;
    private String type;
    private String difficulty;

    private List<String> options;

    // Student's answer (null if no data)
    private String       studentSelected;
    private List<String> studentSelectedMultiple;
    private Double       studentNumeric;

    // Correct answer
    private String       correctAnswer;
    private List<String> correctAnswerMultiple;
    private Double       correctNumeric;
    private Double       tolerance;

    private boolean correct;

    /**
     * NEW: true = student's answer is available and comparison is valid.
     * false = answersJson was null (old attempt) — don't show wrong/right.
     */
    private boolean hasAnswerData;

    /* ── getters & setters ── */
    public Long   getQuestionId()                    { return questionId; }
    public void   setQuestionId(Long v)              { this.questionId = v; }

    public int    getQuestionNumber()                { return questionNumber; }
    public void   setQuestionNumber(int v)           { this.questionNumber = v; }

    public String getQuestionText()                  { return questionText; }
    public void   setQuestionText(String v)          { this.questionText = v; }

    public String getType()                          { return type; }
    public void   setType(String v)                  { this.type = v; }

    public String getDifficulty()                    { return difficulty; }
    public void   setDifficulty(String v)            { this.difficulty = v; }

    public List<String> getOptions()                 { return options; }
    public void         setOptions(List<String> v)   { this.options = v; }

    public String       getStudentSelected()         { return studentSelected; }
    public void         setStudentSelected(String v) { this.studentSelected = v; }

    public List<String> getStudentSelectedMultiple()              { return studentSelectedMultiple; }
    public void         setStudentSelectedMultiple(List<String> v){ this.studentSelectedMultiple = v; }

    public Double       getStudentNumeric()          { return studentNumeric; }
    public void         setStudentNumeric(Double v)  { this.studentNumeric = v; }

    public String       getCorrectAnswer()           { return correctAnswer; }
    public void         setCorrectAnswer(String v)   { this.correctAnswer = v; }

    public List<String> getCorrectAnswerMultiple()              { return correctAnswerMultiple; }
    public void         setCorrectAnswerMultiple(List<String> v){ this.correctAnswerMultiple = v; }

    public Double       getCorrectNumeric()          { return correctNumeric; }
    public void         setCorrectNumeric(Double v)  { this.correctNumeric = v; }

    public Double       getTolerance()               { return tolerance; }
    public void         setTolerance(Double v)       { this.tolerance = v; }

    public boolean      isCorrect()                  { return correct; }
    public void         setCorrect(boolean v)        { this.correct = v; }

    public boolean      isHasAnswerData()            { return hasAnswerData; }
    public void         setHasAnswerData(boolean v)  { this.hasAnswerData = v; }
}