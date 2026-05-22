package com.chat.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.chat.dto.SubjectRequest;
import com.chat.entity.Exam;
import com.chat.entity.Subject;
import com.chat.repo.ExamRepository;
import com.chat.repo.SubjectRepository;
@RestController
@RequestMapping("/api/admin/subjects")
@CrossOrigin(origins = "http://localhost:3000")
public class AdminSubjectController {

    private final SubjectRepository repo;
    private final ExamRepository examRepo;

    public AdminSubjectController(
            SubjectRepository repo,
            ExamRepository examRepo
    ) {
        this.repo = repo;
        this.examRepo = examRepo;
    }

    // ADD SUBJECT
    @PostMapping
    public Subject add(@RequestBody SubjectRequest req) {

        Exam exam = examRepo.findById(req.getExamId())
                .orElseThrow(() -> new RuntimeException("Exam not found"));

        Subject subject = new Subject();
        subject.setName(req.getName());
        subject.setExam(exam);

        return repo.save(subject);
    }

    // GET SUBJECTS BY EXAM 
    @GetMapping
    public List<Subject> getByExam(@RequestParam Long examId) {
        return repo.findByExamId(examId);
    }
    

    // DELETE
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        repo.deleteById(id);
    }
    
    
    @PutMapping("/{id}")
    public Subject update(
            @PathVariable Long id,
            @RequestBody Exam updated
    ) {
        Subject existing = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Exam not found"));

        existing.setName(updated.getName());
        return repo.save(existing);
    }

}
