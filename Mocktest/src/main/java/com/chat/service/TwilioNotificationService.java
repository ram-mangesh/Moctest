package com.chat.service;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Call;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import com.twilio.type.Twiml;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * Twilio Notification Service — SMS + Voice Call
 * Used to alert inactive students who haven't taken a test in 2+ days.
 */
@Service
public class TwilioNotificationService {

    @Value("${ai.twilio.account-sid}")
    private String accountSid;

    @Value("${ai.twilio.auth-token}")
    private String authToken;

    @Value("${ai.twilio.phone-number}")
    private String fromNumber;

    @Value("${app.public-url}")
    private String publicUrl;

    @PostConstruct
    public void init() {
        if (accountSid != null && !accountSid.trim().startsWith("YOUR_")) {
            Twilio.init(accountSid.trim(), authToken.trim());
            System.out.println("✅ Twilio initialized successfully");
        } else {
            System.out.println("⚠️ Twilio not configured — set twilio.account.sid in application.properties");
        }
    }

    /**
     * Send SMS to a student
     */
    public boolean sendSms(String toPhone, String studentName) {
        try {
            if (accountSid.startsWith("YOUR_")) {
                System.out.println("📱 [MOCK SMS] → " + toPhone + ": Hi " + studentName + ", you haven't taken a mock test in 2 days!");
                return true;
            }

            String body = "Hi " + studentName + "! 📚\n\n"
                    + "You haven't taken a mock test in over 2 days. "
                    + "Consistent practice is key to success!\n\n"
                    + "Login now and take a quick test to keep your streak going! 🔥\n"
                    + "— ExamPrep Team";

            Message message = Message.creator(
                    new PhoneNumber(toPhone),
                    new PhoneNumber(fromNumber),
                    body
            ).create();

            System.out.println("✅ SMS sent to " + toPhone + " | SID: " + message.getSid());
            return true;
        } catch (Exception e) {
            System.err.println("❌ SMS failed to " + toPhone + ": " + e.getMessage());
            throw new RuntimeException(e.getMessage());
        }
    }

    /**
     * Make a voice call to a student with TTS message
     */
    public boolean makeCall(String toPhone, String studentName) {
        try {
            if (accountSid.startsWith("YOUR_")) {
                System.out.println("📞 [MOCK CALL] → " + toPhone + ": Voice reminder for " + studentName);
                return true;
            }

            String safeName = java.net.URLEncoder.encode(studentName, java.nio.charset.StandardCharsets.UTF_8);
            String actionUrl = publicUrl + "/api/twilio/handle-language?studentName=" + safeName;

            String twiml = "<Response>"
                    + "<Gather numDigits='1' action='" + actionUrl + "' method='POST'>"
                    + "<Say language='en-IN'>Hi " + studentName + ". This is Exam Prep. For English, press 1.</Say>"
                    + "<Say language='hi-IN'>Hindi ke liye, 2 dabayein.</Say>"
                    + "<Say language='kn-IN'>Kannada ge, 3 odiri.</Say>"
                    + "</Gather>"
                    + "<Say language='hi-IN'>Galat input. Good bye.</Say>"
                    + "</Response>";

            Call call = Call.creator(
                    new PhoneNumber(toPhone),
                    new PhoneNumber(fromNumber),
                    new Twiml(twiml)
            ).create();

            System.out.println("✅ Call initiated to " + toPhone + " | SID: " + call.getSid());
            return true;
        } catch (Exception e) {
            System.err.println("❌ Call failed to " + toPhone + ": " + e.getMessage());
            throw new RuntimeException(e.getMessage());
        }
    }
}
