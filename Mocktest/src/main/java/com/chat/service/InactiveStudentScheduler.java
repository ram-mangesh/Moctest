package com.chat.service;

import com.chat.entity.ExamAttempt;
import com.chat.entity.NotificationLog;
import com.chat.entity.User;
import com.chat.repo.ExamAttemptRepository;
import com.chat.repo.NotificationLogRepository;
import com.chat.repo.Userrepo;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Scheduled service that checks for students inactive for 2+ days
 * and sends them reminders via SMS, Call, and Email.
 */
@Service
public class InactiveStudentScheduler {

    private final Userrepo userRepo;
    private final ExamAttemptRepository attemptRepo;
    private final TwilioNotificationService twilioService;
    private final EmailNotificationService emailService;
    private final NotificationLogRepository logRepo;

    @Value("${inactive.days.threshold:2}")
    private int inactiveDaysThreshold;

    public InactiveStudentScheduler(
            Userrepo userRepo,
            ExamAttemptRepository attemptRepo,
            TwilioNotificationService twilioService,
            EmailNotificationService emailService,
            NotificationLogRepository logRepo
    ) {
        this.userRepo = userRepo;
        this.attemptRepo = attemptRepo;
        this.twilioService = twilioService;
        this.emailService = emailService;
        this.logRepo = logRepo;
    }

    /**
     * Runs daily at 9 AM — checks all students for inactivity
     */
    @Scheduled(cron = "${inactive.check.cron:0 0 9 * * ?}")
    public void checkInactiveStudents() {
        System.out.println("🔍 [Scheduler] Checking for inactive students...");
        List<Map<String, Object>> inactive = findInactiveStudents();
        System.out.println("📊 Found " + inactive.size() + " inactive students");

        for (Map<String, Object> stu : inactive) {
            notifyStudent(stu);
        }
    }

    /**
     * Find students who haven't taken a test in threshold days
     */
    public List<Map<String, Object>> findInactiveStudents() {
        List<User> allStudents = userRepo.findByRole("USER");
        LocalDateTime cutoff = LocalDateTime.now().minusDays(inactiveDaysThreshold);
        List<Map<String, Object>> result = new ArrayList<>();

        for (User u : allStudents) {
            List<ExamAttempt> attempts = attemptRepo.findByUserId(u.getId());

            boolean isInactive;
            int daysInactive;

            if (attempts.isEmpty()) {
                // Never taken a test
                isInactive = true;
                daysInactive = 999;
            } else {
                LocalDateTime lastAttempt = attempts.stream()
                        .map(ExamAttempt::getAttemptedAt)
                        .filter(Objects::nonNull)
                        .max(LocalDateTime::compareTo)
                        .orElse(null);

                if (lastAttempt == null) {
                    isInactive = true;
                    daysInactive = 999;
                } else {
                    isInactive = lastAttempt.isBefore(cutoff);
                    daysInactive = (int) java.time.Duration.between(lastAttempt, LocalDateTime.now()).toDays();
                }
            }

            if (isInactive) {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("id", u.getId());
                m.put("name", u.getName());
                m.put("email", u.getEmail());
                m.put("phone", u.getPhone());
                m.put("daysInactive", daysInactive);
                m.put("totalAttempts", attempts.size());
                result.add(m);
            }
        }

        return result.stream()
                .sorted(Comparator.comparingInt(m -> (int) m.get("daysInactive")))
                .collect(Collectors.toList());
    }

    /**
     * Send all 3 notifications to a student
     */
    public Map<String, Object> notifyStudent(Map<String, Object> stu) {
        Long userId = ((Number) stu.get("id")).longValue();
        String name = (String) stu.get("name");
        String email = (String) stu.get("email");
        String phone = (String) stu.get("phone");
        int daysInactive = (int) stu.get("daysInactive");

        Map<String, Object> results = new LinkedHashMap<>();
        results.put("studentId", userId);
        results.put("name", name);

        // 1. SMS
        boolean smsOk = false;
        String smsErr = null;
        if (phone != null && !phone.isBlank()) {
            String formattedPhone = phone.startsWith("+") ? phone : "+91" + phone;
            try {
                smsOk = twilioService.sendSms(formattedPhone, name);
            } catch (Exception e) { smsErr = e.getMessage(); }
        } else { smsErr = "No phone number"; }
        logNotification(userId, name, "SMS", phone, smsOk, smsErr);
        results.put("sms", smsOk);

        // 2. Call
        boolean callOk = false;
        String callErr = null;
        if (phone != null && !phone.isBlank()) {
            String formattedPhone = phone.startsWith("+") ? phone : "+91" + phone;
            try {
                callOk = twilioService.makeCall(formattedPhone, name);
            } catch (Exception e) { callErr = e.getMessage(); }
        } else { callErr = "No phone number"; }
        logNotification(userId, name, "CALL", phone, callOk, callErr);
        results.put("call", callOk);

        // 3. Email
        boolean emailOk = false;
        String emailErr = null;
        if (email != null && !email.isBlank()) {
            try {
                emailOk = emailService.sendInactiveReminder(email, name, daysInactive);
            } catch (Exception e) { emailErr = e.getMessage(); }
        } else { emailErr = "No email"; }
        logNotification(userId, name, "EMAIL", email, emailOk, emailErr);
        results.put("email", emailOk);

        return results;
    }

    private void logNotification(Long userId, String name, String channel, String dest, boolean ok, String err) {
        NotificationLog log = new NotificationLog();
        log.setUserId(userId);
        log.setStudentName(name);
        log.setChannel(channel);
        log.setDestination(dest);
        log.setSuccess(ok);
        log.setErrorMessage(err);
        logRepo.save(log);
    }
}
