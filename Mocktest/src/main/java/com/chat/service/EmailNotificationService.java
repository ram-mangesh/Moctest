package com.chat.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

/**
 * Email Notification Service — sends reminder emails to inactive students.
 */
@Service
public class EmailNotificationService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from}")
    private String fromEmail;

    public EmailNotificationService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    /**
     * Send inactivity reminder email
     */
    public boolean sendInactiveReminder(String toEmail, String studentName, int daysInactive) {
        try {
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setFrom(fromEmail);
            msg.setTo(toEmail);
            msg.setSubject("📚 " + studentName + ", we miss you! Take a mock test today");
            msg.setText(
                "Hi " + studentName + "!\n\n"
                + "We noticed you haven't taken a mock test in " + daysInactive + " days.\n\n"
                + "Consistent practice is the key to exam success! Here's why you should come back:\n\n"
                + "✅ Track your progress with detailed analytics\n"
                + "✅ Identify and strengthen weak topics\n"
                + "✅ Build confidence for the real exam\n"
                + "✅ Maintain your study streak\n\n"
                + "Login now and take a quick test — it only takes 10 minutes!\n\n"
                + "Best regards,\n"
                + "The ExamPrep Team 🎓"
            );

            mailSender.send(msg);
            System.out.println("✅ Email sent to " + toEmail);
            return true;
        } catch (Exception e) {
            System.err.println("❌ Email failed to " + toEmail + ": " + e.getMessage());
            return false;
        }
    }
}
