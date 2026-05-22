package com.chat.controller;

import com.chat.dto.AnnotationRequest;
import com.chat.entity.ExamAttempt;
import com.chat.entity.FacultyAnnotation;
import com.chat.entity.User;
import com.chat.repo.ExamAttemptRepository;
import com.chat.repo.FacultyAnnotationRepository;
import com.chat.repo.Userrepo;
import com.chat.security.JwtUtil;
import com.chat.service.Annotationemailservice;

import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Task 3 — Faculty Annotation Collaboration Endpoint
 *
 * POST   /api/admin/annotations          — teacher adds annotation to a student attempt
 * GET    /api/admin/annotations/{attemptId} — get all annotations for an attempt
 * GET    /api/user/annotations/my        — student views their own annotations
 */
@RestController
public class FacultyAnnotationController {

    private final FacultyAnnotationRepository annotationRepo;
    private final ExamAttemptRepository attemptRepo;
    private final Userrepo userRepo;
    private final JwtUtil jwtUtil;
    private final Annotationemailservice emailService;

    public FacultyAnnotationController(
            FacultyAnnotationRepository annotationRepo,
            ExamAttemptRepository attemptRepo,
            Userrepo userRepo,
            JwtUtil jwtUtil,
            Annotationemailservice emailService
    ) {
        this.annotationRepo = annotationRepo;
        this.attemptRepo    = attemptRepo;
        this.userRepo       = userRepo;
        this.jwtUtil        = jwtUtil;
        this.emailService   = emailService;
    }

    /* ── TEACHER: add annotation ─────────────────────────────────────────── */

    /**
     * POST /api/admin/annotations
     * Body: { "attemptId": 5, "note": "Focus on Algebra", "tag": "weakness" }
     *
     * Saves annotation + sends email to student asynchronously.
     */
    @PostMapping("/api/admin/annotations")
    public FacultyAnnotation addAnnotation(
            @RequestBody AnnotationRequest req,
            @RequestHeader("Authorization") String auth
    ) {
        // auth — must be ADMIN/teacher
        String token = auth.replace("Bearer ", "");
        String email = jwtUtil.extractEmail(token);

        User teacher = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));

        // load the attempt to get the student id
        ExamAttempt attempt = attemptRepo.findById(req.getAttemptId())
                .orElseThrow(() -> new RuntimeException("Attempt not found"));

        User student = userRepo.findById(attempt.getUserId())
                .orElseThrow(() -> new RuntimeException("Student not found"));

        // build annotation
        FacultyAnnotation annotation = new FacultyAnnotation();
        annotation.setAttemptId(req.getAttemptId());
        annotation.setStudentId(student.getId());
        annotation.setTeacherId(teacher.getId());
        annotation.setNote(req.getNote());
        annotation.setTag(req.getTag());

        FacultyAnnotation saved = annotationRepo.save(annotation);

        // email hook — async, never blocks
        emailService.notifyStudent(student, teacher, saved);

        return saved;
    }

    /* ── TEACHER: view annotations for an attempt ────────────────────────── */

    /**
     * GET /api/admin/annotations/{attemptId}
     */
    @GetMapping("/api/admin/annotations/{attemptId}")
    public List<FacultyAnnotation> getByAttempt(
            @PathVariable Long attemptId,
            @RequestHeader("Authorization") String auth
    ) {
        return annotationRepo.findByAttemptId(attemptId);
    }

    /* ── STUDENT: view all annotations on their attempts ─────────────────── */

    /**
     * GET /api/user/annotations/my
     * Returns all annotations written for the authenticated student.
     */
    @GetMapping("/api/user/annotations/my")
    public List<FacultyAnnotation> myAnnotations(
            @RequestHeader("Authorization") String auth
    ) {
        String token = auth.replace("Bearer ", "");
        String email = jwtUtil.extractEmail(token);

        User student = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return annotationRepo.findByStudentId(student.getId());
    }
}