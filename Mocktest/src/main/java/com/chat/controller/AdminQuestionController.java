package com.chat.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.chat.dto.QuestionRequest;
import com.chat.dto.QuestionResponse;
import com.chat.entity.DifficultyLevel;
import com.chat.entity.Question;
import com.chat.entity.QuestionType;
import com.chat.entity.Topic;
import com.chat.repo.QuestionRepository;
import com.chat.repo.TopicRepository;

@RestController
@RequestMapping("/api/admin/questions")
public class AdminQuestionController {

    private final QuestionRepository questionRepo;
    private final TopicRepository topicRepo;

    public AdminQuestionController(
            QuestionRepository questionRepo,
            TopicRepository topicRepo
    ) {
        this.questionRepo = questionRepo;
        this.topicRepo = topicRepo;
    }

    // ================= ADD =================
    @PostMapping
    public QuestionResponse addQuestion(@RequestBody QuestionRequest req) {

        Topic topic = topicRepo.findById(req.getTopicId())
                .orElseThrow(() -> new RuntimeException("Topic not found"));

        Question q = new Question();

        q.setQuestion(req.getQuestion());
        q.setTopic(topic);
        q.setOptions(req.getOptions());

        q.setType(QuestionType.valueOf(req.getType()));
        q.setDifficulty(DifficultyLevel.valueOf(req.getDifficulty()));

        if (q.getType() == QuestionType.MCQ)
            q.setCorrect(req.getCorrect());

        if (q.getType() == QuestionType.MULTI)
            q.setCorrectMultiple(req.getCorrectMultiple());

        if (q.getType() == QuestionType.NAQ) {
            q.setCorrectNumeric(req.getCorrectNumeric());
            q.setTolerance(req.getTolerance());
        }

        questionRepo.save(q);

        return mapToResponse(q);
    }

    // ================= GET BY TOPIC =================
    @GetMapping
    public List<QuestionResponse> getByTopic(@RequestParam Long topicId) {

        return questionRepo.findByTopicId(topicId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // ================= UPDATE =================
    @PutMapping("/{id}")
    public QuestionResponse update(
            @PathVariable Long id,
            @RequestBody QuestionRequest req
    ) {

        Question q = questionRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Question not found"));

        Topic topic = topicRepo.findById(req.getTopicId())
                .orElseThrow(() -> new RuntimeException("Topic not found"));

        q.setQuestion(req.getQuestion());
        q.setTopic(topic);
        q.setOptions(req.getOptions());

        q.setType(QuestionType.valueOf(req.getType()));
        q.setDifficulty(DifficultyLevel.valueOf(req.getDifficulty()));

        // reset old values
        q.setCorrect(null);
        q.setCorrectMultiple(null);
        q.setCorrectNumeric(null);
        q.setTolerance(null);

        if (q.getType() == QuestionType.MCQ)
            q.setCorrect(req.getCorrect());

        if (q.getType() == QuestionType.MULTI)
            q.setCorrectMultiple(req.getCorrectMultiple());

        if (q.getType() == QuestionType.NAQ) {
            q.setCorrectNumeric(req.getCorrectNumeric());
            q.setTolerance(req.getTolerance());
        }

        questionRepo.save(q);

        return mapToResponse(q);
    }

    // ================= DELETE =================
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        questionRepo.deleteById(id);
    }

    // ================= DTO MAPPER =================
    private QuestionResponse mapToResponse(Question q) {

        return new QuestionResponse(
                q.getId(),
                q.getQuestion(),
                q.getOptions(),
                q.getType().name(),
                q.getDifficulty().name(),
                q.getTopic().getId()
        );
    }
}