package com.chat.controller;

import java.util.ArrayList;
import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.chat.entity.Question;
import com.chat.entity.QuestionDraft;
import com.chat.entity.Topic;
import com.chat.repo.QuestionDraftRepository;
import com.chat.repo.QuestionRepository;
import com.chat.repo.TopicRepository;

import jakarta.transaction.Transactional;

@RestController
@RequestMapping("/api/approve")
public class TeacherQuestApproveController {

    private final QuestionDraftRepository draftRepo;
    private final QuestionRepository questionRepo;
    private final TopicRepository topicRepo;

    public TeacherQuestApproveController(
            QuestionDraftRepository draftRepo,
            QuestionRepository questionRepo,
            TopicRepository topicRepo
    ) {
        this.draftRepo = draftRepo;
        this.questionRepo = questionRepo;
        this.topicRepo = topicRepo;
    }

    @PostMapping
    @Transactional
    public String approveAll(@RequestParam Long topicId) {

        Topic topic = topicRepo.findById(topicId)
                .orElseThrow(() -> new RuntimeException("Topic not found"));

        List<QuestionDraft> drafts = draftRepo.findByTopicId(topicId);

        List<Question> finalQuestions = new ArrayList<>();

        for (QuestionDraft d : drafts) {

            Question q = new Question();

            q.setQuestion(d.getQuestion());

            // copy options safely
            if (d.getOptions() != null)
                q.setOptions(new ArrayList<>(d.getOptions()));

            // MCQ
            q.setCorrect(d.getCorrect());

            // MULTI (must copy list)
            if (d.getCorrectMultiple() != null)
                q.setCorrectMultiple(new ArrayList<>(d.getCorrectMultiple()));

            // NAQ
            q.setCorrectNumeric(d.getCorrectNumeric());
            q.setTolerance(d.getTolerance());

            // metadata
            q.setType(d.getType());
            q.setDifficulty(d.getDifficulty());

            q.setTopic(topic);

            finalQuestions.add(q);
        }

        questionRepo.saveAll(finalQuestions);

        // delete drafts after saving
        draftRepo.deleteByTopicId(topicId);

        return "✅ Questions approved and saved";
    }
}	