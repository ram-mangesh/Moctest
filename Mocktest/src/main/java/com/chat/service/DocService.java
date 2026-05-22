package com.chat.service;

import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class DocService {

    public String extract(MultipartFile file) {
        System.out.println("📝 Apache POI: extracting DOCX");

        try (XWPFDocument doc = new XWPFDocument(file.getInputStream())) {
            XWPFWordExtractor extractor = new XWPFWordExtractor(doc);
            return extractor.getText();
        } catch (Exception e) {
            throw new RuntimeException("DOCX extraction failed", e);
        }
    }
}