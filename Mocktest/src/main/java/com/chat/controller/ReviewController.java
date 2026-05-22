package com.chat.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.chat.entity.QuestionDraft;
import com.chat.repo.QuestionDraftRepository;

import org.springframework.web.bind.annotation.RequestBody;
@RestController
@RequestMapping("/api/review")
public class ReviewController {

    private final QuestionDraftRepository draftRepo;

    public ReviewController(QuestionDraftRepository draftRepo) {
        this.draftRepo = draftRepo;
    }

    // 🔹 SHOW GENERATED QUESTIONS
    @GetMapping("/drafts/topic/{topicId}")
    public List<QuestionDraft> getDraftsByTopic(@PathVariable Long topicId) {
        return draftRepo.findByTopicId(topicId);
    }

    // 🔹 EDIT QUESTION
    @PutMapping("/drafts/{id}")
    public QuestionDraft updateDraft(
            @PathVariable Long id,
            @RequestBody QuestionDraft updated
    ) {
        QuestionDraft d = draftRepo.findById(id).orElseThrow();

        d.setQuestion(updated.getQuestion());
        d.setOptions(updated.getOptions());
        d.setCorrect(updated.getCorrect());

        return draftRepo.save(d);
    }
}