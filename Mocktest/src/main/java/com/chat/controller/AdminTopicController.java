package com.chat.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.chat.dto.TopicRequest;
import com.chat.dto.TopicResponse;
import com.chat.entity.Subject;
import com.chat.entity.Topic;
import com.chat.repo.SubjectRepository;
import com.chat.repo.TopicRepository;

@RestController
@RequestMapping("/api/admin/topics")
public class AdminTopicController {

    private final TopicRepository topicRepo;
    private final SubjectRepository subjectRepo;

    public AdminTopicController(
            TopicRepository topicRepo,
            SubjectRepository subjectRepo
    ) {
        this.topicRepo = topicRepo;
        this.subjectRepo = subjectRepo;
    }

    @PostMapping
    public Topic add(@RequestBody TopicRequest req) {

        Subject subject = subjectRepo.findById(req.getSubjectId())
                .orElseThrow(() -> new RuntimeException("Subject not found"));

        Topic topic = new Topic();
        topic.setName(req.getName());
        topic.setSubject(subject);

        return topicRepo.save(topic);
    }

    @GetMapping
    public List<TopicResponse> bySubject(@RequestParam Long subjectId) {
        return topicRepo.findBySubjectId(subjectId)
            .stream()
            .map(t -> new TopicResponse(
                t.getId(),
                t.getName(),
                t.getSubject().getId(),
                t.getQuestions().size()
            ))
            .toList();
    }


    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        topicRepo.deleteById(id);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<String> update(
            @PathVariable Long id,
            @RequestBody TopicRequest req
    ) {
        Topic topic = topicRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Topic not found"));

        Subject subject = subjectRepo.findById(req.getSubjectId())
                .orElseThrow(() -> new RuntimeException("Subject not found"));

        topic.setName(req.getName());
        topic.setSubject(subject);

        topicRepo.save(topic);
        
        return ResponseEntity.ok("Exam updated");

    }

}
