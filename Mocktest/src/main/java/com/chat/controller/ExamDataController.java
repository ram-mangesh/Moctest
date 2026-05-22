package com.chat.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.chat.entity.Exam;
import com.chat.entity.Subject;
import com.chat.entity.Topic;
import com.chat.repo.ExamRepository;
import com.chat.repo.SubjectRepository;
import com.chat.repo.TopicRepository;

@RestController
@RequestMapping("/api/exam-data")
public class ExamDataController {

    private final ExamRepository examRepo;
    private final SubjectRepository subjectRepo;
    private final TopicRepository topicRepo;

    public ExamDataController(
            ExamRepository examRepo,
            SubjectRepository subjectRepo,
            TopicRepository topicRepo
    ) {
        this.examRepo = examRepo;
        this.subjectRepo = subjectRepo;
        this.topicRepo = topicRepo;
    }

    /* ================= GET EXAMS ================= */
    @GetMapping("/exams")
    public List<Exam> getExams() {
        return examRepo.findAll();
    }

    /* ================= GET SUBJECTS ================= */
    @GetMapping("/subjects/{examId}")
    public List<Subject> getSubjects(@PathVariable Long examId) {
        return subjectRepo.findByExamId(examId);
    }

    /* ================= GET TOPICS ================= */
    @GetMapping("/topics/{subjectId}")
    public List<Topic> getTopics(@PathVariable Long subjectId) {
        return topicRepo.findBySubjectId(subjectId);
    }

}