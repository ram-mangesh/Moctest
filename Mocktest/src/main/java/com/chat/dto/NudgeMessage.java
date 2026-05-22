package com.chat.dto;

/**
 * Sent over WebSocket when the backend detects a stress/drift condition.
 * type values: "CALM_DOWN", "STRATEGY_WARNING", "MISTAKE_RISK", "FOCUS_RESET"
 */
public class NudgeMessage {

    private String type;
    private String title;
    private String message;
    private int severity; // 1=info, 2=warning, 3=alert

    public NudgeMessage() {}

    public NudgeMessage(String type, String title, String message, int severity) {
        this.type = type;
        this.title = title;
        this.message = message;
        this.severity = severity;
    }

    public String getType()    { return type; }
    public String getTitle()   { return title; }
    public String getMessage() { return message; }
    public int getSeverity()   { return severity; }

    public void setType(String type)       { this.type = type; }
    public void setTitle(String title)     { this.title = title; }
    public void setMessage(String message) { this.message = message; }
    public void setSeverity(int severity)  { this.severity = severity; }
}