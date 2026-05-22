package com.chat.controller;

import com.chat.entity.ExamAttempt;
import com.chat.entity.User;
import com.chat.repo.ExamAttemptRepository;
import com.chat.repo.Userrepo;
import com.chat.security.JwtUtil;
import com.chat.service.RoadmapPdfService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Task 2 — Post-Session Roadmap PDF Exporter
 *
 * GET /api/user/roadmap/export/{attemptId}
 *   → Downloads a PDF containing the exam summary + AI roadmap
 *     for the given ExamAttempt.
 *
 * Security:
 *   - User must be authenticated (JWT)
 *   - User can only download their own attempt's PDF
 */
@RestController
@RequestMapping("/api/user/roadmap")
public class RoadmapExportController {

    private final ExamAttemptRepository attemptRepo;
    private final RoadmapPdfService pdfService;
    private final JwtUtil jwtUtil;
    private final Userrepo userRepo;

    public RoadmapExportController(
            ExamAttemptRepository attemptRepo,
            RoadmapPdfService pdfService,
            JwtUtil jwtUtil,
            Userrepo userRepo
    ) {
        this.attemptRepo = attemptRepo;
        this.pdfService  = pdfService;
        this.jwtUtil     = jwtUtil;
        this.userRepo    = userRepo;
    }

    /**
     * Download AI roadmap PDF for a specific attempt.
     *
     * Example:
     *   GET /api/user/roadmap/export/42
     *   Authorization: Bearer <token>
     *
     * Response:
     *   Content-Type: application/pdf
     *   Content-Disposition: attachment; filename="roadmap_42.pdf"
     */
    @GetMapping("/export/{attemptId}")
    public ResponseEntity<byte[]> exportRoadmap(
            @PathVariable Long attemptId,
            @RequestHeader("Authorization") String auth
    ) {
        // ── auth ──────────────────────────────────────────────────────────────
        String token = auth.replace("Bearer ", "");
        String email = jwtUtil.extractEmail(token);

        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // ── load attempt ──────────────────────────────────────────────────────
        ExamAttempt attempt = attemptRepo.findById(attemptId)
                .orElseThrow(() -> new RuntimeException("Attempt not found"));

        // ── ownership check ───────────────────────────────────────────────────
        if (!attempt.getUserId().equals(user.getId())) {
            return ResponseEntity.status(403).build();
        }

        // ── generate PDF ──────────────────────────────────────────────────────
        byte[] pdfBytes = pdfService.generate(attempt, user.getName());

        // ── stream response ───────────────────────────────────────────────────
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"roadmap_" + attemptId + ".pdf\"")
                .body(pdfBytes);
    }
}