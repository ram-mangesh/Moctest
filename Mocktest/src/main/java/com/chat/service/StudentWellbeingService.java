package com.chat.service;

import com.chat.entity.StudentWellbeing;
import com.chat.entity.User;
import com.chat.repo.StudentWellbeingRepository;
import com.chat.repo.Userrepo;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class StudentWellbeingService {

    private final StudentWellbeingRepository wellbeingRepo;
    private final Userrepo userRepo;

    public StudentWellbeingService(StudentWellbeingRepository wellbeingRepo, Userrepo userRepo) {
        this.wellbeingRepo = wellbeingRepo;
        this.userRepo = userRepo;
    }

    /**
     * Record new data from Smart Watch and analyze for stress/burnout.
     */
    public StudentWellbeing recordMetrics(Long studentId, StudentWellbeing data) {
        User student = userRepo.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        data.setStudent(student);
        analyzeWellbeing(data);

        return wellbeingRepo.save(data);
    }

    /**
     * Logic to detect high stress or burnout risk based on watch data.
     */
    private void analyzeWellbeing(StudentWellbeing data) {
        boolean highStress = false;
        StringBuilder advice = new StringBuilder();

        // Heart Rate Analysis
        if (data.getHeartRate() != null) {
            if (data.getHeartRate() > 105) {
                highStress = true;
                advice.append("⚠️ Elevated Heart Rate detected. Possible high anxiety. Try box breathing (4-4-4-4). ");
            }
        }

        // Stress Level Calculation (Pseudo-logic based on metrics)
        int calculatedStress = 20; // base
        if (data.getHeartRate() != null && data.getHeartRate() > 90) calculatedStress += 30;
        if (data.getSleepMinutes() != null && data.getSleepMinutes() < 360) calculatedStress += 25; // Lack of sleep
        
        data.setStressLevel(Math.min(calculatedStress, 100));

        if (data.getStressLevel() > 70) {
            highStress = true;
            advice.append("🔥 High Stress Level. Recommendation: Take a 15-minute break away from screens.");
        } else if (data.getSteps() != null && data.getSteps() < 500) {
            advice.append("🚶 You've been sitting too long. Stand up and stretch for 2 minutes.");
        } else {
            advice.append("✅ Physical metrics look stable. You are in the focus zone.");
        }

        data.setIsBurnoutRisk(highStress);
        data.setAiRecommendation(advice.length() > 0 ? advice.toString() : "Stay hydrated and keep practicing!");
    }

    public List<StudentWellbeing> getStudentHistory(Long studentId) {
        return wellbeingRepo.findByStudentIdOrderByRecordedAtDesc(studentId);
    }

    public List<StudentWellbeing> getRecentMetrics(Long studentId) {
        return wellbeingRepo.findRecentByStudent(studentId, LocalDateTime.now().minusHours(24));
    }

    public List<StudentWellbeing> getHighRiskSurveillance() {
        return wellbeingRepo.findAllHighRiskStudents();
    }
}
