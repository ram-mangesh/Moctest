package com.chat.service;

import com.chat.entity.FacultyAnnotation;
import com.chat.entity.User;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

/**
 * Task 3 — Faculty Annotation Email Hook
 *
 * Sends an email to the student when a teacher adds an annotation.
 * Runs @Async so it never blocks the HTTP response.
 *
 * Setup required in application.properties:
 *   spring.mail.host=smtp.gmail.com
 *   spring.mail.port=587
 *   spring.mail.username=your@gmail.com
 *   spring.mail.password=your-app-password
 *   spring.mail.properties.mail.smtp.auth=true
 *   spring.mail.properties.mail.smtp.starttls.enable=true
 *   app.mail.from=your@gmail.com
 */
@Service
public class Annotationemailservice {

    private final JavaMailSender mailSender;

    // Injected from application.properties
    @org.springframework.beans.factory.annotation.Value("${app.mail.from:noreply@rapidrebels.com}")
    private String fromAddress;

    public Annotationemailservice(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    /**
     * Sends a notification email to the student.
     *
     * @param student    the student who owns the attempt
     * @param teacher    the teacher who wrote the annotation
     * @param annotation the annotation that was just saved
     */
    @Async
    public void notifyStudent(User student,
                              User teacher,
                              FacultyAnnotation annotation) {
        try {
            SimpleMailMessage mail = new SimpleMailMessage();

            mail.setFrom(fromAddress);
            mail.setTo(student.getEmail());
            mail.setSubject("Your teacher has reviewed your study roadmap");

            String body = String.format(
                "Hi %s,\n\n"
                + "%s has added feedback to your study roadmap.\n\n"
                + "--- Feedback ---\n"
                + "%s\n"
                + "----------------\n\n"
                + "Log in to your dashboard to view your updated roadmap.\n\n"
                + "Best,\nRapid Rebels Team",
                student.getName(),
                teacher.getName(),
                annotation.getNote()
            );

            mail.setText(body);
            mailSender.send(mail);

            System.out.println("📧 Annotation email sent to: " + student.getEmail());

        } catch (Exception e) {
            // Log but do not throw — email failure must never break the API
            System.err.println("❌ Annotation email failed: " + e.getMessage());
        }
    }
}