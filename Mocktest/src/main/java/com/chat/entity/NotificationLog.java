package com.chat.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Logs every notification sent to inactive students.
 */
@Entity
@Table(name = "notification_log")
public class NotificationLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;
    private String studentName;
    private String channel;  // SMS, CALL, EMAIL
    private String destination; // phone or email
    private boolean success;
    private String errorMessage;
    private LocalDateTime sentAt;

    @PrePersist
    public void prePersist() { this.sentAt = LocalDateTime.now(); }

    // Getters & Setters
    public Long getId()                         { return id; }
    public Long getUserId()                     { return userId; }
    public void setUserId(Long v)               { this.userId = v; }
    public String getStudentName()              { return studentName; }
    public void setStudentName(String v)        { this.studentName = v; }
    public String getChannel()                  { return channel; }
    public void setChannel(String v)            { this.channel = v; }
    public String getDestination()              { return destination; }
    public void setDestination(String v)        { this.destination = v; }
    public boolean isSuccess()                  { return success; }
    public void setSuccess(boolean v)           { this.success = v; }
    public String getErrorMessage()             { return errorMessage; }
    public void setErrorMessage(String v)       { this.errorMessage = v; }
    public LocalDateTime getSentAt()            { return sentAt; }
    public void setSentAt(LocalDateTime v)      { this.sentAt = v; }
}
