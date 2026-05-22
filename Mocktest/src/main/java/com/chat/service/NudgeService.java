package com.chat.service;

import com.chat.dto.AnalyticsResult;
import com.chat.dto.NudgeMessage;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * Task 1 — Real-Time Nudge Notification System
 *
 * Evaluates an AnalyticsResult and returns zero or more NudgeMessages
 * to be pushed to the student over WebSocket.
 *
 * Priority order (highest first):
 *   1. CALM_DOWN      — stress >= 40 or showCalmUI
 *   2. MISTAKE_RISK   — mistakeRisk flag set
 *   3. STRATEGY_WARNING — strategyWarning flag set
 *   4. FOCUS_RESET    — cognitive drift (confidence drop + rising stress)
 */
@Service
public class NudgeService {

    // Only send a nudge if stress crossed these thresholds
    private static final int STRESS_CALM_THRESHOLD    = 40;
    private static final int STRESS_FOCUS_THRESHOLD   = 25;
    private static final int CONFIDENCE_LOW_THRESHOLD = 40;

    /**
     * Returns a list of nudges to push. Usually 0–1 items,
     * but can return multiple if multiple flags fire together.
     */
    public List<NudgeMessage> evaluate(AnalyticsResult result) {

        List<NudgeMessage> nudges = new ArrayList<>();

        // ── 1. CALM DOWN (highest priority) ──────────────────────────────────
        if (result.showCalmUI() || result.stress() >= STRESS_CALM_THRESHOLD) {
            nudges.add(new NudgeMessage(
                "CALM_DOWN",
                "Pause for a moment",
                "Take a deep breath. You're showing signs of stress. "
                + "Slow down — accuracy matters more than speed.",
                3
            ));
            return nudges; // don't stack more nudges on top of calm-down
        }

        // ── 2. MISTAKE RISK ───────────────────────────────────────────────────
        if (result.mistakeRisk()) {
            nudges.add(new NudgeMessage(
                "MISTAKE_RISK",
                "Careless mistake alert",
                "You're changing answers frequently. "
                + "Re-read the question carefully before selecting.",
                2
            ));
        }

        // ── 3. STRATEGY WARNING ───────────────────────────────────────────────
        if (result.strategyWarning()) {
            nudges.add(new NudgeMessage(
                "STRATEGY_WARNING",
                "Review your approach",
                "You're spending too long on several questions. "
                + "Consider skipping and coming back later.",
                2
            ));
        }

        // ── 4. FOCUS RESET (mild drift) ───────────────────────────────────────
        if (nudges.isEmpty()
                && result.stress() >= STRESS_FOCUS_THRESHOLD
                && result.confidence() < CONFIDENCE_LOW_THRESHOLD) {
            nudges.add(new NudgeMessage(
                "FOCUS_RESET",
                "Focus reset",
                "Your confidence seems to be dipping. "
                + "Pause for 5 seconds and refocus before continuing.",
                1
            ));
        }

        return nudges;
    }
}