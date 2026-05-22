package com.chat.service;

import com.chat.ai.OllamaFallbackClient;
import com.chat.ai.OpenRouterClient;
import com.chat.entity.ExamAttempt;
import com.chat.entity.User;
import com.chat.repo.ExamAttemptRepository;
import com.chat.repo.QuestionRepository;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * AiTeacherService — builds a full performance-aware AI Teacher prompt.
 *
 * Reads the student's complete attempt history and builds a structured
 * prompt that includes:
 *   - Student name
 *   - Total exams attempted
 *   - Per-exam breakdown (Exam → Subject → Topic → score)
 *   - Weak topics (score < 60%)
 *   - Strong topics (score >= 75%)
 *   - Overall accuracy
 *
 * Then appends the student's question and sends to OpenRouter / Ollama.
 */
@Service	
public class AiTeacherService {

    private final ExamAttemptRepository attemptRepo;
    private final QuestionRepository    questionRepo;
    private final OpenRouterClient      openRouter;
    private final OllamaFallbackClient  ollama;

    public AiTeacherService(
            ExamAttemptRepository attemptRepo,
            QuestionRepository questionRepo,
            OpenRouterClient openRouter,
            OllamaFallbackClient ollama) {
        this.attemptRepo  = attemptRepo;
        this.questionRepo = questionRepo;
        this.openRouter   = openRouter;
        this.ollama       = ollama;
    }

    /**
     * Main entry point — called by AiTeacherController.
     *
     * @param user           the authenticated student
     * @param studentQuestion what the student just asked
     * @return AI teacher's response text
     */
    public String ask(User user, String studentQuestion) {

        List<ExamAttempt> attempts =
                attemptRepo.findByUserIdOrderByAttemptedAtAsc(user.getId());

        String performanceData = buildPerformanceData(user, attempts);
        String fullPrompt      = buildTeacherPrompt(performanceData, studentQuestion);

        // Try OpenRouter first, fallback to Ollama
        String response = "";
        try {
            response = openRouter.call(fullPrompt);
        } catch (Exception e) {
            System.out.println("OpenRouter failed, trying Ollama...");
        }

        if (response == null || response.isBlank()) {
            try {
                response = ollama.call(fullPrompt);
            } catch (Exception e) {
                System.out.println("Ollama also failed: " + e.getMessage());
            }
        }

        if (response == null || response.isBlank()) {
            return "I'm having trouble connecting right now. Please try again in a moment.";
        }

        return response;
    }

    /* ── Build student performance summary ── */
    private String buildPerformanceData(User user, List<ExamAttempt> attempts) {

        if (attempts.isEmpty()) {
            return "Student Name: " + user.getName() + "\n"
                 + "Total Exams Attempted: 0\n"
                 + "No exam history available yet.\n";
        }

        StringBuilder sb = new StringBuilder();
        sb.append("Student Name: ").append(user.getName()).append("\n");
        sb.append("Total Attempts: ").append(attempts.size()).append("\n\n");

        // Group by exam name → subject name → topic name
        // Map: examName → subjectName → topicName → list of attempts
        Map<String, Map<String, Map<String, List<ExamAttempt>>>> hierarchy
                = new LinkedHashMap<>();

        for (ExamAttempt a : attempts) {
            // get topic/subject/exam names from question table
            questionRepo.findByTopicId(a.getTopicId())
                    .stream().findFirst().ifPresent(q -> {
                        String exam    = q.getTopic().getSubject().getExam().getName();
                        String subject = q.getTopic().getSubject().getName();
                        String topic   = q.getTopic().getName();

                        hierarchy
                            .computeIfAbsent(exam, e -> new LinkedHashMap<>())
                            .computeIfAbsent(subject, s -> new LinkedHashMap<>())
                            .computeIfAbsent(topic, t -> new ArrayList<>())
                            .add(a);
                    });
        }

        // Weak topics (avg score < 60%) and strong topics (avg >= 75%)
        List<String> weakTopics   = new ArrayList<>();
        List<String> strongTopics = new ArrayList<>();

        sb.append("=== PERFORMANCE HIERARCHY ===\n");

        for (Map.Entry<String, Map<String, Map<String, List<ExamAttempt>>>> examEntry
                : hierarchy.entrySet()) {

            String examName = examEntry.getKey();
            sb.append("\nEXAM: ").append(examName).append("\n");

            // subject-level accuracy
            for (Map.Entry<String, Map<String, List<ExamAttempt>>> subjectEntry
                    : examEntry.getValue().entrySet()) {

                String subjectName = subjectEntry.getKey();

                // calculate subject overall score
                double subjectAvg = subjectEntry.getValue().values().stream()
                        .flatMap(List::stream)
                        .mapToDouble(ExamAttempt::getScorePercent)
                        .average().orElse(0.0);

                sb.append("  Subject: ").append(subjectName)
                  .append(" (avg: ").append(String.format("%.0f", subjectAvg)).append("%)\n");

                // topic-level breakdown
                for (Map.Entry<String, List<ExamAttempt>> topicEntry
                        : subjectEntry.getValue().entrySet()) {

                    String topicName = topicEntry.getKey();
                    List<ExamAttempt> topicAttempts = topicEntry.getValue();

                    double topicAvg = topicAttempts.stream()
                            .mapToDouble(ExamAttempt::getScorePercent)
                            .average().orElse(0.0);

                    int totalCorrect = topicAttempts.stream()
                            .mapToInt(ExamAttempt::getCorrect).sum();
                    int totalQs = topicAttempts.stream()
                            .mapToInt(ExamAttempt::getTotal).sum();

                    String tag = topicAvg < 40  ? " ⚠️ VERY WEAK"
                               : topicAvg < 60  ? " ⚠️ WEAK"
                               : topicAvg < 75  ? " 📈 IMPROVING"
                               : " ✅ STRONG";

                    sb.append("    Topic: ").append(topicName)
                      .append(" | Score: ").append(String.format("%.0f", topicAvg))
                      .append("% | Correct: ").append(totalCorrect)
                      .append("/").append(totalQs)
                      .append(" | Attempts: ").append(topicAttempts.size())
                      .append(tag).append("\n");

                    // collect weak / strong
                    String topicRef = subjectName + " → " + topicName;
                    if (topicAvg < 60)  weakTopics.add(topicRef + " (" + String.format("%.0f", topicAvg) + "%)");
                    if (topicAvg >= 75) strongTopics.add(topicRef + " (" + String.format("%.0f", topicAvg) + "%)");
                }
            }
        }

        sb.append("\n=== SUMMARY ===\n");

        if (!weakTopics.isEmpty()) {
            sb.append("Weak Topics (need attention):\n");
            weakTopics.forEach(t -> sb.append("  - ").append(t).append("\n"));
        } else {
            sb.append("No weak topics identified yet.\n");
        }

        if (!strongTopics.isEmpty()) {
            sb.append("Strong Topics:\n");
            strongTopics.forEach(t -> sb.append("  - ").append(t).append("\n"));
        }

        double overallAvg = attempts.stream()
                .mapToDouble(ExamAttempt::getScorePercent)
                .average().orElse(0.0);
        sb.append("Overall Average Score: ")
          .append(String.format("%.1f", overallAvg)).append("%\n");

        return sb.toString();
    }

    /* ── Build the full AI teacher prompt ── */
    private String buildTeacherPrompt(String performanceData, String studentQuestion) {
        return """
CRITICAL INSTRUCTION: You are a VOICE AI Teacher. Your response will be read aloud by a text-to-speech engine to the student. You MUST respond naturally as a speaking teacher. NEVER say "I am a text-based AI" or "I cannot speak" or any similar disclaimer. Just answer directly as a teacher speaking to a student.

You are an intelligent AI Teacher inside a Mock Test learning platform.

The platform structure follows this hierarchy:
Exam → Subject → Topic → Question

STUDENT PERFORMANCE DATA:
""" + performanceData + """

YOUR ROLE as a VOICE TEACHER:
- Speak directly to the student by name.
- Analyze their performance and give personalized guidance.
- Identify weak topics from exam history and explain them.
- Suggest focused study plans based on actual performance data.
- Be warm, encouraging, and clear.

STRICT RESPONSE RULES (voice format):
- Start by addressing the student by name. Example: "Hey Abhishek, ..."
- Speak in natural conversational sentences — not bullet points or lists.
- NO markdown: no **, no ##, no dashes, no numbered lists.
- Keep response between 80 to 150 words — short enough to speak clearly.
- End with ONE specific actionable thing the student should do today.
- NEVER mention being text-based, an AI model, or unable to speak.

STUDENT'S QUESTION:
""" + studentQuestion;
    }
}