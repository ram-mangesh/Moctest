package com.chat.entity;

import jakarta.persistence.*;

/**
 * Task 6 — Stress Inference Threshold Tuner
 *
 * Stores per-user configurable thresholds for stress detection.
 * Defaults mirror the hardcoded values in AnalyticsEngine.
 */
@Entity
@Table(name = "user_stress_config")
public class UserStressConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private Long userId;

    // Stress added when cognitive drift (time increasing) is detected
    // Default: 15
    private int driftStressDelta = 15;

    // Max stress from option changes (per change × 4, capped here)
    // Default: 20
    private int optionChangeStressCap = 20;

    // Seconds threshold for "long time spent" penalty
    // Default: 60
    private int longTimeThresholdSeconds = 60;

    // Stress level at which calmUI activates
    // Default: 40
    private int calmUiStressThreshold = 40;

    // Stress level at which mistakeRisk flag activates
    // Default: 35
    private int mistakeRiskStressThreshold = 35;

    // Confidence level below which focus-reset nudge fires
    // Default: 35
    private int mistakeRiskConfidenceThreshold = 35;

    /* ── getters & setters ── */

    public Long getId()                              { return id; }

    public Long getUserId()                          { return userId; }
    public void setUserId(Long v)                    { this.userId = v; }

    public int getDriftStressDelta()                 { return driftStressDelta; }
    public void setDriftStressDelta(int v)           { this.driftStressDelta = v; }

    public int getOptionChangeStressCap()            { return optionChangeStressCap; }
    public void setOptionChangeStressCap(int v)      { this.optionChangeStressCap = v; }

    public int getLongTimeThresholdSeconds()         { return longTimeThresholdSeconds; }
    public void setLongTimeThresholdSeconds(int v)   { this.longTimeThresholdSeconds = v; }

    public int getCalmUiStressThreshold()            { return calmUiStressThreshold; }
    public void setCalmUiStressThreshold(int v)      { this.calmUiStressThreshold = v; }

    public int getMistakeRiskStressThreshold()       { return mistakeRiskStressThreshold; }
    public void setMistakeRiskStressThreshold(int v) { this.mistakeRiskStressThreshold = v; }

    public int getMistakeRiskConfidenceThreshold()       { return mistakeRiskConfidenceThreshold; }
    public void setMistakeRiskConfidenceThreshold(int v) { this.mistakeRiskConfidenceThreshold = v; }
}