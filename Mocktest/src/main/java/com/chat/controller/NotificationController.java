package com.chat.controller;

import com.chat.entity.NotificationLog;
import com.chat.repo.NotificationLogRepository;
import com.chat.service.InactiveStudentScheduler;
import org.springframework.web.bind.annotation.*;

import java.util.*;

/**
 * Admin API for inactive student notifications
 *
 * GET  /api/admin/notifications/inactive-students  → list inactive students
 * POST /api/admin/notifications/send-all            → notify all inactive students
 * POST /api/admin/notifications/send/{studentId}    → notify single student
 * GET  /api/admin/notifications/logs                → recent notification logs
 */
@RestController
@RequestMapping("/api/admin/notifications")
public class NotificationController {

    private final InactiveStudentScheduler scheduler;
    private final NotificationLogRepository logRepo;

    public NotificationController(
            InactiveStudentScheduler scheduler,
            NotificationLogRepository logRepo
    ) {
        this.scheduler = scheduler;
        this.logRepo = logRepo;
    }

    /**
     * GET inactive students list
     */
    @GetMapping("/inactive-students")
    public List<Map<String, Object>> getInactiveStudents() {
        return scheduler.findInactiveStudents();
    }

    /**
     * POST — notify ALL inactive students (SMS + Call + Email)
     */
    @PostMapping("/send-all")
    public Map<String, Object> notifyAll() {
        List<Map<String, Object>> inactive = scheduler.findInactiveStudents();
        List<Map<String, Object>> results = new ArrayList<>();

        for (Map<String, Object> stu : inactive) {
            results.add(scheduler.notifyStudent(stu));
        }

        return Map.of(
            "totalNotified", results.size(),
            "results", results
        );
    }

    /**
     * POST — notify a single student by ID
     */
    @PostMapping("/send/{studentId}")
    public Map<String, Object> notifySingle(@PathVariable Long studentId) {
        List<Map<String, Object>> inactive = scheduler.findInactiveStudents();

        Map<String, Object> target = inactive.stream()
                .filter(s -> ((Number) s.get("id")).longValue() == studentId)
                .findFirst()
                .orElseThrow(() -> new RuntimeException(
                    "Student not found or not inactive"));

        return scheduler.notifyStudent(target);
    }

    /**
     * GET — recent notification logs
     */
    @GetMapping("/logs")
    public List<NotificationLog> getLogs() {
        return logRepo.findTop50ByOrderBySentAtDesc();
    }
}
