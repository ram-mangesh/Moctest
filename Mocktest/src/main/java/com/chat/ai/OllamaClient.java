package com.chat.ai;

import java.util.HashMap;
import java.util.Map;

import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
public class OllamaClient {

    private final RestTemplate restTemplate = new RestTemplate();

    public String call(String chunk, String prompt) {

        System.out.println("🤖 Ollama AI call");

        String url = "http://localhost:11434/api/generate";

        Map<String, Object> body = new HashMap<>();
        body.put("model", "tinyllama");
        body.put("prompt", prompt + "\n\nTEXT:\n" + chunk);
        body.put("stream", false);

        @SuppressWarnings("unchecked")
        Map<String, Object> response =
                restTemplate.postForObject(url, body, Map.class);

        return response.get("response").toString();
    }
}