package com.chat.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.chat.ai.AiParser;
import com.chat.ai.OpenRouterClient;
import com.chat.ai.OllamaFallbackClient;
import com.chat.entity.QuestionDraft;
import com.chat.repo.QuestionDraftRepository;

@Service
public class AiServiceforAssign {

    private final OpenRouterClient openRouter;
    private final OllamaFallbackClient ollama;
    private final AiParser parser;
    private final QuestionDraftRepository draftRepo;

    public AiServiceforAssign(
            OpenRouterClient openRouter,
            OllamaFallbackClient ollama,
            AiParser parser,
            QuestionDraftRepository draftRepo
    ) {
        this.openRouter = openRouter;
        this.ollama = ollama;
        this.parser = parser;
        this.draftRepo = draftRepo;
    }

    @Transactional
    public void generate(
            List<String> chunks,
            Long topicId,
            String teacherPrompt,
            int requiredCount,
            String type,
            String difficulty
    ){

        System.out.println("🤖 AI generation started");

        draftRepo.deleteByTopicId(topicId);

        int generated = 0;

        for (String chunk : chunks) {

            if (generated >= requiredCount) break;

            if (chunk == null || chunk.trim().length() < 50) {
                System.out.println("⚠️ Weak content, using fallback knowledge");
                chunk = "Generate questions from general subject knowledge.";
            }

            int remaining = requiredCount - generated;

            String strictPrompt = """
RETURN ONLY JSON ARRAY.
NO TEXT.

You MUST generate ONLY questions of type: %s
Difficulty level MUST be: %s

FORMAT:
[
 {
  "question": "string",
  "type": "%s",
  "difficulty": "%s",
  "options": ["string","string","string","string"],
  "correct": 0,
  "correctMultiple": [0,2],
  "correctNumeric": 12.5,
  "tolerance": 0.5
 }
]

RULES:

If type = MCQ
- 4 options
- only one correct answer
- use "correct"

If type = MULTI
- 4 options
- multiple correct answers
- use "correctMultiple"

If type = NAQ
- numeric answer
- use "correctNumeric"
- use "tolerance"

Teacher instruction:
%s

Generate EXACTLY %d questions.

CONTENT:
%s
""".formatted(type, difficulty, type, difficulty, teacherPrompt, remaining, chunk);

            String response = "";

            try {
                System.out.println("🌐 Trying OpenRouter...");
                response = openRouter.call(strictPrompt);
            } catch (Exception e) {
                System.out.println("❌ OpenRouter failed");
            }

            if (response == null || response.isEmpty()) {
                System.out.println("🤖 Switching to Ollama fallback...");
                response = ollama.call(strictPrompt);
            }

            if (response == null || response.isEmpty()) continue;

            List<QuestionDraft> parsed = parser.parseToDraft(response, topicId);

            for (QuestionDraft d : parsed) {

                if (generated >= requiredCount) break;

                draftRepo.save(d);
                generated++;
            }
        }

        System.out.println("📝 Draft questions saved: " + generated);
    }
}