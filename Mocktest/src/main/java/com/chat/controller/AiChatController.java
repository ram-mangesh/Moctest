package com.chat.controller;

import org.springframework.web.bind.annotation.*;

import com.chat.service.AiChatService;

@RestController
@RequestMapping("/api/user/ai")
public class AiChatController {

    private final AiChatService aiChatService;

    public AiChatController(AiChatService aiChatService) {
        this.aiChatService = aiChatService;
    }

    @PostMapping("/chat")
    public String chat(@RequestBody String prompt) {
        System.out.println("🔥 AI CHAT REQUEST: " + prompt);

        return aiChatService.chat(prompt);
    }
}
