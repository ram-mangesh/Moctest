package com.chat.service;

import com.chat.dto.AnalyticsResult;
import com.chat.entity.QuestionAttempt;
import com.chat.entity.UserStressConfig;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Task 6 — Stress Inference Threshold Tuner
 *
 * Upgraded AnalyticsEngine that accepts a UserStressConfig.
 * If no config is provided (null), falls back to the original hardcoded defaults.
 *
 * REPLACE your existing AnalyticsEngine with this file.
 * The public analyze(List) signature is unchanged — existing callers still work.
 * New callers can pass a UserStressConfig for personalised thresholds.
 */
@Service
public class AnalyticsEngine {

    private static final int WINDOW = 10;

    // ── default thresholds (match original hardcoded values) ─────────────────
    private static final int DEFAULT_DRIFT_STRESS_DELTA            = 15;
    private static final int DEFAULT_OPTION_CHANGE_STRESS_CAP      = 20;
    private static final int DEFAULT_LONG_TIME_THRESHOLD_SECONDS   = 60;
    private static final int DEFAULT_CALM_UI_STRESS_THRESHOLD      = 40;
    private static final int DEFAULT_MISTAKE_RISK_STRESS_THRESHOLD = 35;
    private static final int DEFAULT_MISTAKE_RISK_CONF_THRESHOLD   = 35;

    /* ═══════════════════════════════════════════════════════════════════════
       PUBLIC API
    ═══════════════════════════════════════════════════════════════════════ */

    /**
     * Original signature — uses default thresholds.
     * All existing callers (RealtimeWebSocketHandler, AiAsyncService, etc.)
     * continue to work without any changes.
     */
    public AnalyticsResult analyze(List<QuestionAttempt> history) {
        return analyze(history, null);
    }

    /**
     * New signature — uses per-user configurable thresholds.
     * Called by the WebSocket handler when the user has saved custom settings.
     *
     * @param history  list of QuestionAttempt for this session
     * @param config   user's saved thresholds, or null for defaults
     */
    public AnalyticsResult analyze(List<QuestionAttempt> history,
                                   UserStressConfig config) {

        // resolve thresholds (config wins; null → defaults)
        int driftDelta       = cfg(config, config == null ? DEFAULT_DRIFT_STRESS_DELTA
                                           : config.getDriftStressDelta());
        int optionCap        = cfg(config, config == null ? DEFAULT_OPTION_CHANGE_STRESS_CAP
                                           : config.getOptionChangeStressCap());
        int longTimeSec      = cfg(config, config == null ? DEFAULT_LONG_TIME_THRESHOLD_SECONDS
                                           : config.getLongTimeThresholdSeconds());
        int calmUiThreshold  = cfg(config, config == null ? DEFAULT_CALM_UI_STRESS_THRESHOLD
                                           : config.getCalmUiStressThreshold());
        int mistakeStress    = cfg(config, config == null ? DEFAULT_MISTAKE_RISK_STRESS_THRESHOLD
                                           : config.getMistakeRiskStressThreshold());
        int mistakeConf      = cfg(config, config == null ? DEFAULT_MISTAKE_RISK_CONF_THRESHOLD
                                           : config.getMistakeRiskConfidenceThreshold());

        // ── run analysis (same logic as original) ─────────────────────────────
        int stress     = 0;
        int risk       = 0;
        int confidence = 70;
        int readiness;

        boolean showCalmUI       = false;
        boolean strategyWarning  = false;
        boolean mistakeRisk      = false;
        int     warningTick      = 0;

        System.out.println("\n================ ANALYTICS START ================");
        System.out.println("📥 Attempts received: " + history.size());

        List<QuestionAttempt> recent =
                history.size() > WINDOW
                        ? history.subList(history.size() - WINDOW, history.size())
                        : history;

        QuestionAttempt last = recent.get(recent.size() - 1);

        /* 1️⃣ Cognitive Drift */
        if (recent.size() >= 3) {
            int t1 = recent.get(recent.size() - 3).getTimeSpent();
            int t2 = recent.get(recent.size() - 2).getTimeSpent();
            int t3 = recent.get(recent.size() - 1).getTimeSpent();

            if (t3 > t2 && t2 > t1) {
                stress += driftDelta;
                confidence -= 5;
                System.out.println("🧠 Cognitive drift detected");
            }
        }

        /* 2️⃣ Option churn */
        stress += Math.min(optionCap, last.getOptionChanges() * 4);

        /* 3️⃣ Time pressure */
        if (last.getTimeSpent() > longTimeSec) {
            stress += 10;
            System.out.println("⌛ Long time spent");
        }

        /* 4️⃣ Confidence from recent accuracy */
        long correct = recent.stream()
                .filter(QuestionAttempt::isAnsweredCorrect)
                .count();
        double accuracy = (double) correct / recent.size();
        confidence = (int) (accuracy * 100);
        System.out.println("🎯 Recent accuracy: " + confidence + "%");

        /* 5️⃣ Strategy risk */
        long risky = recent.stream()
                .filter(a -> a.getTimeSpent() > 90 || a.getOptionChanges() >= 3)
                .count();
        if (risky >= 4) {
            risk = 25;
            strategyWarning = true;
            System.out.println("⚠️ Strategy risk");
        }

        /* 6️⃣ Careless mistake forecast */
        if (stress >= mistakeStress
                || confidence <= mistakeConf
                || last.getOptionChanges() >= 3) {
            mistakeRisk = true;
            warningTick++;
        }

        /* 7️⃣ Forgetting curve */
        if (confidence < 45 && recent.size() >= 5) {
            System.out.println("🧠 Forgetting curve risk");
        }

        /* 8️⃣ Calm UI */
        if (stress >= calmUiThreshold
                || (mistakeRisk && confidence < mistakeConf)) {
            showCalmUI = true;
            System.out.println("🌙 Calm UI activated");
        }

        /* 9️⃣ Readiness */
        readiness = (int) (
                (confidence * 0.6) +
                ((100 - stress) * 0.3) +
                ((100 - risk) * 0.1)
        );

        /* 🔟 Normalize */
        stress     = clamp(stress);
        confidence = clamp(confidence);
        risk       = clamp(risk);
        readiness  = clamp(readiness);

        System.out.println(
            "⚠️ mistakeRisk=" + mistakeRisk +
            " stress=" + stress +
            " confidence=" + confidence +
            " optionChanges=" + last.getOptionChanges()
        );
        System.out.println("================ ANALYTICS END =================\n");

        return new AnalyticsResult(
                stress, risk, confidence, readiness,
                showCalmUI, strategyWarning, mistakeRisk, warningTick
        );
    }

    /* ── helpers ─────────────────────────────────────────────────────────── */

    private int clamp(int v) {
        return Math.min(100, Math.max(0, v));
    }

    /** Null-safe config resolver — returns resolved value directly */
    private int cfg(UserStressConfig config, int resolved) {
        return resolved;
    }
}