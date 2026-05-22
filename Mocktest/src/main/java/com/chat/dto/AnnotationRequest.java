package com.chat.dto;

public class AnnotationRequest {

    private Long attemptId;
    private String note;
    private String tag; // optional: "strength", "weakness", "tip"

    public Long getAttemptId()       { return attemptId; }
    public void setAttemptId(Long v) { this.attemptId = v; }

    public String getNote()          { return note; }
    public void setNote(String v)    { this.note = v; }

    public String getTag()           { return tag; }
    public void setTag(String v)     { this.tag = v; }
}