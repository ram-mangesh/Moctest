package com.chat.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.chat.dto.TopicResponse;
import com.chat.entity.Topic;
import com.chat.repo.TopicRepository;

@RestController
@RequestMapping("/api/user/topics")
public class UserTopicController {

    private final TopicRepository topicRepo;

    public UserTopicController(TopicRepository topicRepo) {
        this.topicRepo = topicRepo;
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
}