package com.chat.controller;

import com.chat.entity.StudentWellbeing;
import com.chat.service.StudentWellbeingService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

/**
 * Smart Watch Integration API
 * Handles vitals data from wearables and provides health insights to students and admins.
 */
@RestController
@RequestMapping("/api/wellbeing")
public class WellbeingController {

    private final StudentWellbeingService wellbeingService;

    public WellbeingController(StudentWellbeingService wellbeingService) {
        this.wellbeingService = wellbeingService;
    }

    /**
     * POST — Record data from Smart Watch / Simulation
     */
    @PostMapping("/sync/{studentId}")
    public StudentWellbeing syncWatchData(@PathVariable Long studentId, @RequestBody StudentWellbeing data) {
        return wellbeingService.recordMetrics(studentId, data);
    }

    /**
     * GET — Student's health history
     */
    @GetMapping("/history/{studentId}")
    public List<StudentWellbeing> getHistory(@PathVariable Long studentId) {
        return wellbeingService.getStudentHistory(studentId);
    }

    /**
     * GET — Latest 24h metrics for graph
     */
    @GetMapping("/recent/{studentId}")
    public List<StudentWellbeing> getRecent(@PathVariable Long studentId) {
        return wellbeingService.getRecentMetrics(studentId);
    }

    /**
     * GET — Admin endpoint to see students under high stress
     */
    @GetMapping("/admin/high-risk")
    public List<StudentWellbeing> getHighRisk() {
        return wellbeingService.getHighRiskSurveillance();
    }
}
