package com.chat.ai;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
public class OpenRouterClient {

    private final RestTemplate rest = new RestTemplate();

    @Value("${openrouter.api.key}")
    private String apiKey;

    @Value("${openrouter.url}")
    private String url;

    @Value("${openrouter.model}")
    private String model;

    @SuppressWarnings("unchecked")
    public String call(String prompt) {

        try {

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);

            Map<String,Object> body = Map.of(
                "model", model,
                "messages", List.of(
                        Map.of("role","user","content",prompt)
                )
            );

            HttpEntity<Map<String,Object>> entity =
                    new HttpEntity<>(body, headers);

            Map<?,?> response =
                    rest.postForObject(url, entity, Map.class);

            List<Map<String,Object>> choices =
                    (List<Map<String,Object>>) response.get("choices");

            Map<String,Object> message =
                    (Map<String,Object>) choices.get(0).get("message");

            return message.get("content").toString();

        } catch (Exception e) {

            System.out.println("❌ OpenRouter failed: " + e.getMessage());
            return "";
        }
    }
}