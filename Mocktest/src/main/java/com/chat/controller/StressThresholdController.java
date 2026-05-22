package com.chat.controller;

import com.chat.entity.User;
import com.chat.entity.UserStressConfig;
import com.chat.repo.UserStressConfigRepository;
import com.chat.repo.Userrepo;
import com.chat.security.JwtUtil;
import org.springframework.web.bind.annotation.*;

/**
 * Task 6 — Stress Inference Threshold Tuner
 *
 * GET  /api/user/stress-config        → get current thresholds (or defaults)
 * POST /api/user/stress-config        → save user's custom thresholds
 * DELETE /api/user/stress-config      → reset to defaults
 */
@RestController
@RequestMapping("/api/user/stress-config")
public class StressThresholdController {

    private final UserStressConfigRepository configRepo;
    private final JwtUtil jwtUtil;
    private final Userrepo userRepo;

    public StressThresholdController(
            UserStressConfigRepository configRepo,
            JwtUtil jwtUtil,
            Userrepo userRepo
    ) {
        this.configRepo = configRepo;
        this.jwtUtil    = jwtUtil;
        this.userRepo   = userRepo;
    }

    /* ── GET current config ──────────────────────────────────────────────── */

    /**
     * GET /api/user/stress-config
     * Returns the user's saved thresholds.
     * If none saved, returns a default config object (not persisted).
     */
    @GetMapping
    public UserStressConfig getConfig(
            @RequestHeader("Authorization") String auth
    ) {
        User user = resolveUser(auth);

        return configRepo.findByUserId(user.getId())
                .orElseGet(() -> {
                    // return default object without saving it
                    UserStressConfig defaults = new UserStressConfig();
                    defaults.setUserId(user.getId());
                    return defaults;
                });
    }

    /* ── SAVE / UPDATE config ────────────────────────────────────────────── */

    /**
     * POST /api/user/stress-config
     * Body: {
     *   "driftStressDelta": 10,
     *   "optionChangeStressCap": 16,
     *   "longTimeThresholdSeconds": 90,
     *   "calmUiStressThreshold": 50,
     *   "mistakeRiskStressThreshold": 30,
     *   "mistakeRiskConfidenceThreshold": 40
     * }
     *
     * All fields optional — only provided fields are updated.
     */
    @PostMapping
    public UserStressConfig saveConfig(
            @RequestBody UserStressConfig incoming,
            @RequestHeader("Authorization") String auth
    ) {
        User user = resolveUser(auth);

        // load existing or create new
        UserStressConfig config = configRepo.findByUserId(user.getId())
                .orElseGet(() -> {
                    UserStressConfig c = new UserStressConfig();
                    c.setUserId(user.getId());
                    return c;
                });

        // apply only fields that are within sane ranges to prevent abuse
        if (incoming.getDriftStressDelta() > 0) {
            config.setDriftStressDelta(
                clamp(incoming.getDriftStressDelta(), 1, 50));
        }
        if (incoming.getOptionChangeStressCap() > 0) {
            config.setOptionChangeStressCap(
                clamp(incoming.getOptionChangeStressCap(), 1, 50));
        }
        if (incoming.getLongTimeThresholdSeconds() > 0) {
            config.setLongTimeThresholdSeconds(
                clamp(incoming.getLongTimeThresholdSeconds(), 10, 300));
        }
        if (incoming.getCalmUiStressThreshold() > 0) {
            config.setCalmUiStressThreshold(
                clamp(incoming.getCalmUiStressThreshold(), 10, 100));
        }
        if (incoming.getMistakeRiskStressThreshold() > 0) {
            config.setMistakeRiskStressThreshold(
                clamp(incoming.getMistakeRiskStressThreshold(), 10, 100));
        }
        if (incoming.getMistakeRiskConfidenceThreshold() > 0) {
            config.setMistakeRiskConfidenceThreshold(
                clamp(incoming.getMistakeRiskConfidenceThreshold(), 5, 80));
        }

        return configRepo.save(config);
    }

    /* ── RESET to defaults ───────────────────────────────────────────────── */

    /**
     * DELETE /api/user/stress-config
     * Deletes the saved config so defaults kick in again.
     */
    @DeleteMapping
    public String resetConfig(
            @RequestHeader("Authorization") String auth
    ) {
        User user = resolveUser(auth);

        configRepo.findByUserId(user.getId())
                .ifPresent(configRepo::delete);

        return "Stress config reset to defaults";
    }

    /* ── helpers ─────────────────────────────────────────────────────────── */

    private User resolveUser(String auth) {
        String token = auth.replace("Bearer ", "");
        String email = jwtUtil.extractEmail(token);
        return userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private int clamp(int value, int min, int max) {
        return Math.min(max, Math.max(min, value));
    }
}