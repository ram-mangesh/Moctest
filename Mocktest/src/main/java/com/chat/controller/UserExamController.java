package com.chat.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.chat.dto.ExamResponse;
import com.chat.entity.Exam;
import com.chat.repo.ExamRepository;

@RestController
@RequestMapping("/api/user/exams")
public class UserExamController {

    private final ExamRepository examRepo;

    public UserExamController(ExamRepository examRepo) {
        this.examRepo = examRepo;
    }

    @GetMapping
    public List<ExamResponse> getAllExams() {
        List<Exam> exams = examRepo.findAll();

        return exams.stream().map(exam -> {
            ExamResponse res = new ExamResponse();
            res.setId(exam.getId());
            res.setName(exam.getName());
            res.setSubjectCount(exam.getSubjects().size()); 
            return res;
        }).toList();
        
        
    }
    
    
    @GetMapping("/search")
    public List<ExamResponse> searchExams(
            @RequestParam String query) {

        return examRepo
                .findByNameContainingIgnoreCase(query)
                .stream()
                .map(this::mapToDto)
                .toList();
    }

    private ExamResponse mapToDto(Exam exam) {
        ExamResponse res = new ExamResponse();
        res.setId(exam.getId());
        res.setName(exam.getName());
        res.setSubjectCount(exam.getSubjects().size());
        return res;
    }

}

