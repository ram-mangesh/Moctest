package com.chat.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.chat.entity.Exam;
import com.chat.repo.ExamRepository;

@RestController
@RequestMapping("/api/admin/exams")
public class AdminExamController {

    private final ExamRepository repo;

    public AdminExamController(ExamRepository repo) {
        this.repo = repo;
    }

    // ADD EXAM
    @PostMapping
    public Exam add(@RequestBody Exam exam) {
        return repo.save(exam);
    }

    // GET ALL EXAMS
    @GetMapping
    public List<Exam> getAll() {
        return repo.findAll();
    }

    // GET EXAM BY ID (for edit)
    @GetMapping("/{id}")
    public Exam getById(@PathVariable Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Exam not found"));
    }

    // UPDATE EXAM
    @PutMapping("/{id}")
    public Exam update(
            @PathVariable Long id,
            @RequestBody Exam updated
    ) {
        Exam existing = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Exam not found"));

        existing.setName(updated.getName());
        return repo.save(existing);
    }

    // DELETE EXAM
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        repo.deleteById(id);
    }
}
