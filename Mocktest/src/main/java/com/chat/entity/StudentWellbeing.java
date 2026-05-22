package com.chat.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Tracks student wellbeing metrics synced from a Smart Watch or wearable.
 * Helps in monitoring stress levels, focus, and physical health during study.
 */
@Entity
@Table(name = "student_wellbeing")
public class StudentWellbeing {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User student;

    private Integer heartRate;      // BPM (Stress Indicator)
    private Integer stressLevel;    // 1-100 (Calculated)
    private Integer oxygenLevels;   // SpO2 %
    private Double bodyTemp;        // °C
    private Integer steps;          // Activity tracker
    private Integer sleepMinutes;   // Rest indicator
    private Integer calories;       // Energy expenditure
    
    private String deviceId;        // Watch ID
    private String deviceModel;     // e.g. Apple Watch, Fitbit
    
    // AI Insights
    private Boolean isBurnoutRisk = false;
    private String aiRecommendation; // e.g. "Drink water, take a 5 min walk"
    
    private LocalDateTime recordedAt;

    @PrePersist
    public void prePersist() { this.recordedAt = LocalDateTime.now(); }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getStudent() { return student; }
    public void setStudent(User student) { this.student = student; }
    public Integer getHeartRate() { return heartRate; }
    public void setHeartRate(Integer heartRate) { this.heartRate = heartRate; }
    public Integer getStressLevel() { return stressLevel; }
    public void setStressLevel(Integer stressLevel) { this.stressLevel = stressLevel; }
    public Integer getOxygenLevels() { return oxygenLevels; }
    public void setOxygenLevels(Integer oxygenLevels) { this.oxygenLevels = oxygenLevels; }
    public Double getBodyTemp() { return bodyTemp; }
    public void setBodyTemp(Double bodyTemp) { this.bodyTemp = bodyTemp; }
    public Integer getSteps() { return steps; }
    public void setSteps(Integer steps) { this.steps = steps; }
    public Integer getSleepMinutes() { return sleepMinutes; }
    public void setSleepMinutes(Integer sleepMinutes) { this.sleepMinutes = sleepMinutes; }
    public Integer getCalories() { return calories; }
    public void setCalories(Integer calories) { this.calories = calories; }
    public String getDeviceId() { return deviceId; }
    public void setDeviceId(String deviceId) { this.deviceId = deviceId; }
    public String getDeviceModel() { return deviceModel; }
    public void setDeviceModel(String deviceModel) { this.deviceModel = deviceModel; }
    public Boolean getIsBurnoutRisk() { return isBurnoutRisk; }
    public void setIsBurnoutRisk(Boolean burnoutRisk) { isBurnoutRisk = burnoutRisk; }
    public String getAiRecommendation() { return aiRecommendation; }
    public void setAiRecommendation(String aiRecommendation) { this.aiRecommendation = aiRecommendation; }
    public LocalDateTime getRecordedAt() { return recordedAt; }
    public void setRecordedAt(LocalDateTime recordedAt) { this.recordedAt = recordedAt; }
}
