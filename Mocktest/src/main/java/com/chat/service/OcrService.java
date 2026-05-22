package com.chat.service;

import java.io.File;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import net.sourceforge.tess4j.Tesseract;

@Service
public class OcrService {

    private final Tesseract tesseract;

    public OcrService() {
        tesseract = new Tesseract();
        tesseract.setDatapath("C:/tesseract/tessdata"); // 🔴 REQUIRED
        tesseract.setLanguage("eng");
    }

    public String extract(MultipartFile file) {
        System.out.println("🖼 Tesseract OCR: extracting text");

        try {
            File temp = File.createTempFile("ocr", ".png");
            file.transferTo(temp);
            return tesseract.doOCR(temp);
        } catch (Exception e) {
            throw new RuntimeException("OCR failed", e);
        }
    }
}