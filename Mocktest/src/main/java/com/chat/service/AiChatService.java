package com.chat.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.chat.ai.OpenRouterClient;
import com.chat.ai.OllamaFallbackClient;
import com.chat.entity.Subject;
import com.chat.repo.SubjectRepository;

@Service
public class AiChatService {

    private final OpenRouterClient openRouter;
    private final OllamaFallbackClient ollama;
    private final SubjectRepository subjectRepo;

    public AiChatService(OpenRouterClient openRouter,
                         OllamaFallbackClient ollama,
                         SubjectRepository subjectRepo) {

        this.openRouter = openRouter;
        this.ollama = ollama;
        this.subjectRepo = subjectRepo;
    }

    public String chat(String userPrompt) {

        String examName = detectExam(userPrompt);
        String subjects = "";
        Long examId = null;

        if (!examName.isEmpty()) {

            List<Subject> subjectList =
                    subjectRepo.findByExam_NameIgnoreCase(examName);

            if (!subjectList.isEmpty()) {

                examId = subjectList.get(0).getExam().getId();

                subjects = subjectList.stream()
                        .map(Subject::getName)
                        .collect(Collectors.joining(", "));
            }
        }

        String prompt = buildPrompt(userPrompt, subjects);

        String response = "";

        // 🔥 PRIMARY → OpenRouter
        try {
            System.out.println("🌐 Trying OpenRouter...");
            response = openRouter.call(prompt);
        } catch (Exception e) {
            System.out.println("❌ OpenRouter failed");
        }

        // 🔥 FALLBACK → Ollama
        if (response == null || response.isEmpty()) {

            System.out.println("🤖 Switching to Ollama fallback...");
            response = ollama.call(prompt);
        }

        if (response == null || response.isEmpty()) {
            return "AI servers are busy. Please try again later.";
        }

        if (examId != null) {
            return response + "\n\nEXAM_ID:" + examId;
        }

        return response;
    }

    private String buildPrompt(String question, String subjects) {

        String system = """
You are an AI mentor helping students prepare for competitive exams.

Rules:
1. Use simple structured answers
2. Use numbered points
3. Do not use markdown symbols or tables
4. Keep answers short and practical
5. Focus on exam preparation strategies
6. If a concept is asked explain it with an example
7. If a study plan is asked give daily or weekly steps
8. If practice is asked suggest MCQ practice

Response Format:

Direct Answer
Key Points
Study Strategy
Practice Recommendation
Exam Tip
""";

        if (!subjects.isEmpty()) {
            return system + "\nAllowed Subjects: " + subjects +
                    "\nStudent Question: " + question;
        }

        return system + "\nStudent Question: " + question;
    }

    private String detectExam(String text) {

        String p = text.toLowerCase();

        if (p.contains("ssc")) return "SSC CGL";
        if (p.contains("upsc")) return "UPSC";
        if (p.contains("neet")) return "NEET";
        if (p.contains("jee")) return "JEE";
        if (p.contains("gate")) return "GATE";

        return "";
    }
}