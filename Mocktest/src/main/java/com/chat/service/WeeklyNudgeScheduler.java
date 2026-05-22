package com.chat.service;

import com.chat.entity.ExamAttempt;
import com.chat.entity.User;
import com.chat.repo.ExamAttemptRepository;
import com.chat.repo.Userrepo;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Task 9 — Weekly Prep Nudge Scheduler
 *
 * Runs every Sunday at 8:00 AM (cron: "0 0 8 * * SUN").
 * For each active user:
 *   1. Fetches their recent ExamAttempts (last 7 days)
 *   2. Identifies predicted mistake hotspots (topics with lowest scores)
 *   3. Builds a personalized weekly plan
 *   4. Sends it via email
 *
 * Required in application.properties:
 *   spring.mail.host=smtp.gmail.com
 *   spring.mail.port=587
 *   spring.mail.username=your@gmail.com
 *   spring.mail.password=your-app-password
 *   spring.mail.properties.mail.smtp.auth=true
 *   spring.mail.properties.mail.smtp.starttls.enable=true
 *   app.mail.from=your@gmail.com
 *   app.scheduler.enabled=true        (set false in dev to disable)
 *
 * Enable scheduling in your main class:
 *   @EnableScheduling
 */
@Service
public class WeeklyNudgeScheduler {

    private final ExamAttemptRepository attemptRepo;
    private final Userrepo userRepo;
    private final JavaMailSender mailSender;

    @org.springframework.beans.factory.annotation.Value(
            "${app.mail.from:noreply@rapidrebels.com}")
    private String fromAddress;

    @org.springframework.beans.factory.annotation.Value(
            "${app.scheduler.enabled:true}")
    private boolean schedulerEnabled;

    public WeeklyNudgeScheduler(
            ExamAttemptRepository attemptRepo,
            Userrepo userRepo,
            JavaMailSender mailSender
    ) {
        this.attemptRepo = attemptRepo;
        this.userRepo    = userRepo;
        this.mailSender  = mailSender;
    }

    /* ═══════════════════════════════════════════════════════════════════════
       SCHEDULED JOB — every Sunday at 8:00 AM
    ═══════════════════════════════════════════════════════════════════════ */

    @Scheduled(cron = "0 0 8 * * SUN")
    public void sendWeeklyNudges() {

        if (!schedulerEnabled) {
            System.out.println("⏸ Weekly nudge scheduler is disabled");
            return;
        }

        System.out.println("📅 Weekly nudge scheduler started: "
                + LocalDateTime.now());

        List<User> allUsers = userRepo.findAll();
        int sent = 0;

        for (User user : allUsers) {
            try {
                boolean emailSent = processUser(user);
                if (emailSent) sent++;
            } catch (Exception e) {
                System.err.println("❌ Weekly nudge failed for userId="
                        + user.getId() + ": " + e.getMessage());
            }
        }

        System.out.println("✅ Weekly nudge scheduler done. Emails sent: " + sent);
    }

    /* ═══════════════════════════════════════════════════════════════════════
       PROCESS ONE USER
    ═══════════════════════════════════════════════════════════════════════ */

    /**
     * @return true if email was sent, false if user had no recent activity
     */
    private boolean processUser(User user) {

        LocalDateTime oneWeekAgo = LocalDateTime.now().minusDays(7);

        // get last 7 days of attempts
        List<ExamAttempt> recentAttempts =
                attemptRepo.findByUserIdOrderByAttemptedAtAsc(user.getId())
                        .stream()
                        .filter(a -> a.getAttemptedAt() != null
                                && a.getAttemptedAt().isAfter(oneWeekAgo))
                        .collect(Collectors.toList());

        // no activity this week → skip email
        if (recentAttempts.isEmpty()) return false;

        // ── identify weak topics (score < 60%) ───────────────────────────────
        List<String> hotspots = recentAttempts.stream()
                .filter(a -> a.getScorePercent() < 60.0)
                .map(a -> String.format("Topic ID %d (%.0f%% score)",
                        a.getTopicId(), a.getScorePercent()))
                .distinct()
                .limit(3)
                .collect(Collectors.toList());

        // ── calculate overall weekly stats ───────────────────────────────────
        double avgScore = recentAttempts.stream()
                .mapToDouble(ExamAttempt::getScorePercent)
                .average()
                .orElse(0.0);

        int totalTests = recentAttempts.size();

        // ── build and send email ──────────────────────────────────────────────
        String body = buildEmailBody(user, totalTests, avgScore, hotspots);

        SimpleMailMessage mail = new SimpleMailMessage();
        mail.setFrom(fromAddress);
        mail.setTo(user.getEmail());
        mail.setSubject("Your Weekly Study Plan — " +
                LocalDateTime.now().format(
                        DateTimeFormatter.ofPattern("dd MMM yyyy")));
        mail.setText(body);

        mailSender.send(mail);
        System.out.println("📧 Weekly nudge sent to: " + user.getEmail());

        return true;
    }

    /* ═══════════════════════════════════════════════════════════════════════
       EMAIL BODY BUILDER
    ═══════════════════════════════════════════════════════════════════════ */

    private String buildEmailBody(User user,
                                  int totalTests,
                                  double avgScore,
                                  List<String> hotspots) {

        StringBuilder sb = new StringBuilder();

        sb.append("Hi ").append(user.getName()).append(",\n\n");
        sb.append("Here's your personalized weekly study plan based on ")
          .append("your performance this week.\n\n");

        // weekly summary
        sb.append("━━━ THIS WEEK'S SUMMARY ━━━\n");
        sb.append("Tests taken     : ").append(totalTests).append("\n");
        sb.append(String.format("Average score   : %.1f%%\n", avgScore));
        sb.append("\n");

        // hotspots
        if (!hotspots.isEmpty()) {
            sb.append("━━━ PREDICTED MISTAKE HOTSPOTS ━━━\n");
            sb.append("These topics had below 60% score — focus here first:\n");
            for (String h : hotspots) {
                sb.append("  • ").append(h).append("\n");
            }
            sb.append("\n");
        }

        // weekly plan
        sb.append("━━━ YOUR 7-DAY ADAPTIVE PLAN ━━━\n");

        if (avgScore >= 75) {
            sb.append("Great performance! Aim to:\n")
              .append("  Mon–Tue : Revise hotspot topics (20 mins each)\n")
              .append("  Wed–Thu : Take 1 full mock test per day\n")
              .append("  Fri     : Review wrong answers, re-read notes\n")
              .append("  Sat–Sun : Rest + light revision only\n");
        } else if (avgScore >= 50) {
            sb.append("Good effort — here's how to improve:\n")
              .append("  Mon–Wed : 30 min daily on your weakest topic\n")
              .append("  Thu     : Full mock test\n")
              .append("  Fri     : Analyse mistakes from the mock\n")
              .append("  Sat     : Targeted MCQ practice (50 questions)\n")
              .append("  Sun     : Rest\n");
        } else {
            sb.append("Let's get back on track:\n")
              .append("  Mon–Fri : 45 min daily — focus on basics only\n")
              .append("  Sat     : Mini test (20 questions)\n")
              .append("  Sun     : Review + plan for next week\n");
        }

        sb.append("\n");
        sb.append("━━━ TIP OF THE WEEK ━━━\n");
        sb.append(weeklyTip(avgScore)).append("\n\n");

        sb.append("Log in to your dashboard to see full analytics.\n\n");
        sb.append("Best,\nRapid Rebels AI Prep Team");

        return sb.toString();
    }

    private String weeklyTip(double avgScore) {
        if (avgScore >= 75)
            return "Top performers spend 20% of study time on revision, "
                 + "not new content. Keep revising!";
        if (avgScore >= 50)
            return "Attempting a question twice is better than skipping it. "
                 + "Trust your first instinct on MCQs.";
        return "Start each session with the easiest topic. "
             + "Build momentum before tackling hard questions.";
    }
}