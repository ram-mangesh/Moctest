package com.chat.service;

import com.chat.entity.ExamAttempt;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

/**
 * Task 2 — Post-Session Roadmap PDF Exporter
 *
 * Generates a downloadable PDF containing:
 *  - Student exam attempt summary (score, correct, wrong)
 *  - AI-generated personalized roadmap / recommendation
 *
 * Uses PDFBox (already in pom.xml via PdfService).
 * Returns raw bytes so the controller can stream it as application/pdf.
 */
@Service
public class RoadmapPdfService {

    private static final float MARGIN        = 50f;
    private static final float PAGE_WIDTH    = PDRectangle.A4.getWidth();
    private static final float PAGE_HEIGHT   = PDRectangle.A4.getHeight();
    private static final float CONTENT_WIDTH = PAGE_WIDTH - 2 * MARGIN;

    private static final PDType1Font FONT_BOLD    = PDType1Font.HELVETICA_BOLD;
    private static final PDType1Font FONT_REGULAR = PDType1Font.HELVETICA;
    private static final PDType1Font FONT_OBLIQUE = PDType1Font.HELVETICA_OBLIQUE;

    public byte[] generate(ExamAttempt attempt, String studentName) {

        try (PDDocument doc = new PDDocument()) {

            // ── state ─────────────────────────────────────────────────────────
            List<PDPage> pages = new ArrayList<>();
            PDPage page = new PDPage(PDRectangle.A4);
            doc.addPage(page);
            pages.add(page);

            PDPageContentStream cs = new PDPageContentStream(doc, page);
            float y = PAGE_HEIGHT - MARGIN;

            // ── HEADER ────────────────────────────────────────────────────────
            y = drawText(cs, "Personalized Study Roadmap", FONT_BOLD, 20,
                         MARGIN, y, 0.1f, 0.3f, 0.7f);
            y -= 6;
            y = drawLine(cs, y);
            y -= 10;

            // ── student info ──────────────────────────────────────────────────
            y = drawText(cs, "Student: " + (studentName != null ? studentName : "—"),
                         FONT_BOLD, 12, MARGIN, y, 0f, 0f, 0f);
            y -= 4;

            if (attempt.getAttemptedAt() != null) {
                String dateStr = attempt.getAttemptedAt()
                        .format(DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a"));
                y = drawText(cs, "Date: " + dateStr,
                             FONT_REGULAR, 11, MARGIN, y, 0.3f, 0.3f, 0.3f);
                y -= 4;
            }

            y -= 10;

            // ── score summary box ─────────────────────────────────────────────
            y = drawSectionTitle(cs, "Exam Summary", y);
            y -= 8;
            y = drawKeyValue(cs, "Total Questions", String.valueOf(attempt.getTotal()), y);
            y = drawKeyValue(cs, "Correct",         String.valueOf(attempt.getCorrect()), y);
            y = drawKeyValue(cs, "Wrong",           String.valueOf(attempt.getWrong()), y);
            y = drawKeyValue(cs, "Score",
                    String.format("%.1f%%", attempt.getScorePercent()), y);
            y -= 14;

            // ── AI recommendation ─────────────────────────────────────────────
            y = drawSectionTitle(cs, "AI Personalized Roadmap", y);
            y -= 8;

            String recommendation = attempt.getAiRecommendation();
            if (recommendation == null || recommendation.isBlank()) {
                recommendation = "AI recommendation is being generated. "
                        + "Please check back in a few moments.";
            }

            // Word-wrap and paginate the recommendation text
            String[] lines = recommendation.split("\n");

            for (String rawLine : lines) {

                List<String> wrapped = wrapText(rawLine.trim(), FONT_REGULAR,
                                                11, CONTENT_WIDTH);
                for (String line : wrapped) {

                    // new page if needed
                    if (y < MARGIN + 40) {
                        cs.close();
                        PDPage newPage = new PDPage(PDRectangle.A4);
                        doc.addPage(newPage);
                        cs = new PDPageContentStream(doc, newPage);
                        y = PAGE_HEIGHT - MARGIN;
                    }

                    y = drawText(cs, line, FONT_REGULAR, 11,
                                 MARGIN, y, 0.15f, 0.15f, 0.15f);
                    y -= 2;
                }
                y -= 4; // extra gap between original lines
            }

            // ── footer ────────────────────────────────────────────────────────
            if (y > MARGIN + 30) {
                y -= 14;
                drawLine(cs, y);
                y -= 14;
                drawText(cs, "Generated by Rapid Rebels — AI Exam Prep Platform",
                         FONT_OBLIQUE, 9, MARGIN, y, 0.5f, 0.5f, 0.5f);
            }

            cs.close();

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            doc.save(out);
            return out.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("PDF generation failed: " + e.getMessage(), e);
        }
    }

    /* ── drawing helpers ──────────────────────────────────────────────────── */

    /** Draws a single line of text, returns new y (decremented by font size + 4) */
    private float drawText(PDPageContentStream cs, String text,
                           PDType1Font font, float size,
                           float x, float y,
                           float r, float g, float b) throws Exception {
        cs.beginText();
        cs.setFont(font, size);
        cs.setNonStrokingColor(r, g, b);
        cs.newLineAtOffset(x, y);
        cs.showText(sanitize(text));
        cs.endText();
        return y - size - 4;
    }

    private float drawSectionTitle(PDPageContentStream cs,
                                   String title, float y) throws Exception {
        return drawText(cs, title, FONT_BOLD, 13, MARGIN, y,
                        0.1f, 0.3f, 0.7f);
    }

    private float drawKeyValue(PDPageContentStream cs,
                               String key, String value, float y) throws Exception {
        // key in bold
        cs.beginText();
        cs.setFont(FONT_BOLD, 11);
        cs.setNonStrokingColor(0f, 0f, 0f);
        cs.newLineAtOffset(MARGIN, y);
        cs.showText(sanitize(key) + ": ");
        cs.endText();

        // measure key width to position value
        float keyWidth = FONT_BOLD.getStringWidth(key + ": ") / 1000 * 11;

        cs.beginText();
        cs.setFont(FONT_REGULAR, 11);
        cs.setNonStrokingColor(0.2f, 0.2f, 0.2f);
        cs.newLineAtOffset(MARGIN + keyWidth, y);
        cs.showText(sanitize(value));
        cs.endText();

        return y - 15;
    }

    private float drawLine(PDPageContentStream cs, float y) throws Exception {
        cs.setStrokingColor(0.8f, 0.8f, 0.8f);
        cs.setLineWidth(0.5f);
        cs.moveTo(MARGIN, y);
        cs.lineTo(PAGE_WIDTH - MARGIN, y);
        cs.stroke();
        return y - 6;
    }

    /**
     * Word-wraps a string to fit within maxWidth at the given font size.
     * Returns a list of lines.
     */
    private List<String> wrapText(String text, PDType1Font font,
                                   float fontSize, float maxWidth) throws Exception {
        List<String> lines = new ArrayList<>();
        if (text == null || text.isBlank()) {
            lines.add("");
            return lines;
        }

        String[] words = text.split(" ");
        StringBuilder current = new StringBuilder();

        for (String word : words) {
            String test = current.length() == 0
                    ? word
                    : current + " " + word;

            float width = font.getStringWidth(sanitize(test)) / 1000 * fontSize;

            if (width > maxWidth && current.length() > 0) {
                lines.add(current.toString());
                current = new StringBuilder(word);
            } else {
                current = new StringBuilder(test);
            }
        }

        if (current.length() > 0) {
            lines.add(current.toString());
        }

        return lines;
    }

    /**
     * PDFBox can only render WinAnsiEncoding characters.
     * Replace common Unicode chars that would cause exceptions.
     */
    private String sanitize(String input) {
        if (input == null) return "";
        return input
                .replace("\u2019", "'")   // right single quote
                .replace("\u2018", "'")   // left single quote
                .replace("\u201C", "\"")  // left double quote
                .replace("\u201D", "\"")  // right double quote
                .replace("\u2014", "--")  // em dash
                .replace("\u2013", "-")   // en dash
                .replace("\u2022", "*")   // bullet
                .replace("\u00A0", " ")   // non-breaking space
                .replaceAll("[^\\x00-\\xFF]", "?"); // any other non-latin
    }
}