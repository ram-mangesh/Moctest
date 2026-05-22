package com.chat.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class OllamaFallbackClient {

    private final HttpClient httpClient;
    private final ObjectMapper mapper = new ObjectMapper();

    public OllamaFallbackClient() {
        // Using Java 11 NIO HttpClient to allow interrupting and killing network sockets efficiently
        this.httpClient = HttpClient.newBuilder()
            .version(HttpClient.Version.HTTP_1_1)
            .connectTimeout(Duration.ofSeconds(4))
            .build();
    }

    @Value("${ollama.nodes}")
    private String nodes;

    @Value("${ollama.models}")
    private String models;

    public String call(String prompt) {

        String[] nodeListRaw = nodes.split(",");
        String[] modelListRaw = models.split(",");

        Set<String> uniqueNodes = new HashSet<>();
        for (String n : nodeListRaw) uniqueNodes.add(n.trim());

        // Use List to PRESERVE ORDER. We want to test high-quality Llama first, before falling back to small agents.
        List<String> orderedModels = new ArrayList<>();
        for (String m : modelListRaw) {
            String trimmed = m.trim();
            if (!trimmed.isEmpty() && !orderedModels.contains(trimmed)) {
                orderedModels.add(trimmed);
            }
        }

        if (uniqueNodes.isEmpty() || orderedModels.isEmpty()) return "";

        // STRATEGY: Try Models Sequentially (Quality first), but test Nodes in Parallel (Fastest Server wins)!
        for (String model : orderedModels) {
            System.out.println("🤖 Racing all servers for model: " + model);

            CountDownLatch latch = new CountDownLatch(1);
            AtomicReference<String> firstResult = new AtomicReference<>(null);
            AtomicInteger remainingTasks = new AtomicInteger(uniqueNodes.size());
            List<CompletableFuture<HttpResponse<String>>> futures = new ArrayList<>();

            for (String node : uniqueNodes) {
                if (node.isEmpty()) {
                    if (remainingTasks.decrementAndGet() == 0) latch.countDown();
                    continue;
                }

                Map<String, Object> userMessage = new HashMap<>();
                userMessage.put("role", "user");
                userMessage.put("content", prompt);

                Map<String, Object> body = new HashMap<>();
                body.put("model", model);
                body.put("messages", Collections.singletonList(userMessage));
                body.put("stream", false);

                try {
                    String jsonBody = mapper.writeValueAsString(body);

                    HttpRequest request = HttpRequest.newBuilder()
                        .uri(URI.create(node + "/api/chat"))
                        .header("Content-Type", "application/json")
                        .timeout(Duration.ofSeconds(120)) // 120 seconds generation timeout
                        .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                        .build();

                    CompletableFuture<HttpResponse<String>> future = httpClient.sendAsync(request, HttpResponse.BodyHandlers.ofString());
                    futures.add(future);

                    future.thenAccept(response -> {
                        if (response.statusCode() == 200) {
                            try {
                                Map<?, ?> responseBody = mapper.readValue(response.body(), Map.class);
                                if (responseBody != null && responseBody.containsKey("message")) {
                                    Map<?, ?> messageObj = (Map<?, ?>) responseBody.get("message");
                                    if (messageObj != null && messageObj.containsKey("content")) {
                                        String output = messageObj.get("content").toString().trim();
                                    
                                        // FIRST SERVER TO FINISH WINS
                                        if (!output.isEmpty() && firstResult.compareAndSet(null, output)) {
                                            System.out.println("✅ 🏆 RACE WON BY NODE: " + node + " (Model: " + model + ")");
                                            latch.countDown();
                                        }
                                    }
                                }
                            } catch (Exception e) {}
                        } else {
                            System.out.println("❌ Model failed " + node + " | " + model + " (HTTP " + response.statusCode() + ")");
                        }
                    }).exceptionally(ex -> {
                        return null; // Ignore connection timeouts in the console so it stays clean
                    }).whenComplete((res, ex) -> {
                        if (remainingTasks.decrementAndGet() == 0) latch.countDown();
                    });

                } catch (Exception e) {
                    if (remainingTasks.decrementAndGet() == 0) latch.countDown();
                }
            }

            try {
                // Wait for the fastest server to return a response for THIS MODEL
                latch.await(120, TimeUnit.SECONDS);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }

            // Kill all slower servers to free up their GPUs
            for (CompletableFuture<?> f : futures) {
                if (!f.isDone()) f.cancel(true);
            }

            // If a server successfully replied with this model, RETURN it! 
            // We won't test lower quality models.
            String finalResult = firstResult.get();
            if (finalResult != null) return finalResult;

            System.out.println("🚨 Model *" + model + "* completely failed on ALL servers. Moving to next fallback model...");
        }

        System.out.println("🚨 All fallback models completely failed.");
        return "";
    }
}