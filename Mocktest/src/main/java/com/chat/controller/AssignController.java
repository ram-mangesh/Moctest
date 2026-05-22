package com.chat.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.chat.draft.DraftStore;
import com.chat.entity.Question;
import com.chat.service.FileProcessingService;

@RestController
@RequestMapping("/api/assign")
public class AssignController {

    private final FileProcessingService service;

    public AssignController(FileProcessingService service) {
        this.service = service;
    }	

    @PostMapping("/generate")
    public String generate(
            @RequestParam MultipartFile file,
            @RequestParam Long topicId,
            @RequestParam String prompt,
            @RequestParam int questionCount,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String difficulty
    ) {

        System.out.println("📤 File received");
        System.out.println("Teacher Prompt: " + prompt);
        System.out.println("Type: " + type);
        System.out.println("Difficulty: " + difficulty);

        service.process(file, topicId, prompt, questionCount, type, difficulty);

        return "AI generation completed";
    }
    
    
        @GetMapping("/draft")
        public List<Question> getDraftQuestions() {
            System.out.println("👨‍🏫 Fetching draft questions");
            return DraftStore.get();
        }
    
}