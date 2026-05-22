package com.chat.controller;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Twilio Webhook Controller — Multi-Language IVR
 * 
 * Called by Twilio after user presses a key during a voice call:
 *   1 → English
 *   2 → Hindi
 *   3 → Marathi
 *
 * This endpoint MUST be public (no JWT). Ensure SecurityConfig permits /api/twilio/**
 */
@RestController
@RequestMapping("/api/twilio")
public class TwilioWebhookController {

    /**
     * Twilio calls this URL via HTTP POST after the user presses a digit.
     * URL example: POST /api/twilio/handle-language?studentName=Rahul
     * Twilio sends "Digits" as a form parameter.
     */
    @PostMapping(value = "/handle-language")
    public ResponseEntity<String> handleLanguageSelection(
            @RequestParam(value = "Digits", required = false) String digits,
            @RequestParam(value = "studentName", required = false, defaultValue = "Student") String studentName) {

        String twiml = buildTwiml(digits, studentName);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_XML)
                .body(twiml);
    }

    /**
     * GET version — for easy browser testing of the webhook response.
     */
    @GetMapping(value = "/handle-language")
    public ResponseEntity<String> handleLanguageSelectionGet(
            @RequestParam(value = "Digits", required = false) String digits,
            @RequestParam(value = "studentName", required = false, defaultValue = "Student") String studentName) {

        String twiml = buildTwiml(digits, studentName);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_XML)
                .body(twiml);
    }

    private String buildTwiml(String digits, String studentName) {
        // Escape student name to prevent XML injection
        String safeName = escapeXml(studentName);

        String language;
        String message;

        if ("1".equals(digits)) {
            // ✅ ENGLISH
            language = "en-IN";
            message = "You have selected English. Hi " + safeName
                    + ", this is a friendly reminder from Exam Prep. "
                    + "You have not taken a mock test in over 2 days. "
                    + "Consistent practice leads to better results. "
                    + "Please login and take a quick test today. Good luck!";

        } else if ("2".equals(digits)) {
            // ✅ HINDI
            language = "hi-IN";
            message = "Aapne Hindi chuna hai. Namaste " + safeName
                    + ", yeh Exam Prep ki taraf se ek yaad dilaane ki koshish hai. "
                    + "Aapne do din se koi mock test nahi diya hai. "
                    + "Rozana practice karne se hi safalta milti hai. "
                    + "Kripaya login karein aur aaj hi test dein. Shubhkamnayein!";

        } else if ("3".equals(digits)) {
            // ✅ KANNADA
            language = "kn-IN"; // Twilio supports kn-IN for Kannada TTS
            message = "Neevu Kannada aarisiddiri. Namaskara " + safeName
                    + ", idu Exam Prep ninda ondu sneha smaranege. "
                    + "Neevu eradu dinadininda yaavude mock test needilla. "
                    + "Niyamita abhyaasa safalatege mukhya. "
                    + "Dayavittu login maadi idu test neediri. Shubhashayagalu!";

        } else {
            // ❌ Invalid input — re-prompt
            language = "hi-IN";
            message = "Aapne galat option dabaya. Kripaya dobara try karein. Good bye.";
        }

        return "<?xml version=\"1.0\" encoding=\"UTF-8\"?>"
                + "<Response>"
                + "<Say language=\"" + language + "\">" + message + "</Say>"
                + "</Response>";
    }

    private String escapeXml(String input) {
        if (input == null) return "Student";
        return input
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&apos;");
    }
}
