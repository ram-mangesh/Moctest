package com.chat.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.chat.entity.QuestionAttempt;
import com.chat.repo.QuestionAttemptRepository;

@RestController
@RequestMapping("/api/user")
public class AttemptController {

    private final QuestionAttemptRepository repo;

    public AttemptController(QuestionAttemptRepository repo) {
        this.repo = repo;
    }

    @PostMapping("/attempt")
    public void save(@RequestBody QuestionAttempt attempt) {
        repo.save(attempt);
    }
}
