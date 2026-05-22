package com.chat.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.chat.dto.SubjectResponse;
import com.chat.repo.SubjectRepository;

@RestController
@RequestMapping("/api/user/subjects")
public class UserSubjectController {

    private final SubjectRepository subjectRepo;

    public UserSubjectController(SubjectRepository subjectRepo) {
        this.subjectRepo = subjectRepo;
    }

    @GetMapping
    public List<SubjectResponse> getByExam(@RequestParam Long examId) {
        return subjectRepo.findByExamId(examId)
                .stream()
                .map(s -> new SubjectResponse(
                        s.getId(),
                        s.getName(),
                        s.getExam().getId(),
                        s.getTopics().size()   
                ))
                .toList();
    }
}
