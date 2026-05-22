package com.chat.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class FileProcessingService {

    private final PdfService pdf;
    private final OcrService ocr;
    private final DocService doc;
    private final ChunkService chunkService;
    private final  AiServiceforAssign aiService;

    public FileProcessingService(
            PdfService pdf,
            OcrService ocr,
            DocService doc,
            ChunkService chunkService,
            AiServiceforAssign aiService
    ) {
        this.pdf = pdf;
        this.ocr = ocr;
        this.doc = doc;
        this.chunkService = chunkService;
        this.aiService = aiService;
    }

    public void process(
            MultipartFile file,
            Long topicId,
            String prompt,
            int questionCount,
            String type,
            String difficulty
    ) {
        System.out.println("🔍 Detecting file type...");

        String name = file.getOriginalFilename();
        String text;

        if (name.endsWith(".pdf")) {
            text = pdf.extract(file);
        } else if (name.endsWith(".png") || name.endsWith(".jpg")) {
            text = ocr.extract(file);
        } else if (name.endsWith(".docx")) {
            text = doc.extract(file);
        } else {
            throw new RuntimeException("Unsupported file type");
        }

        System.out.println("📄 Text extracted (length = " + text.length() + ")");

        List<String> chunks = chunkService.chunk(text);
        aiService.generate(chunks, topicId, prompt, questionCount, type, difficulty);    }
}