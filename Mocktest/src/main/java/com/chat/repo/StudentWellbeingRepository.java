package com.chat.repo;

import com.chat.entity.StudentWellbeing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface StudentWellbeingRepository extends JpaRepository<StudentWellbeing, Long> {
    
    List<StudentWellbeing> findByStudentIdOrderByRecordedAtDesc(Long studentId);
    
    @Query("SELECT s FROM StudentWellbeing s WHERE s.isBurnoutRisk = true ORDER BY s.recordedAt DESC")
    List<StudentWellbeing> findAllHighRiskStudents();

    @Query("SELECT s FROM StudentWellbeing s WHERE s.student.id = :studentId AND s.recordedAt >= :since ORDER BY s.recordedAt ASC")
    List<StudentWellbeing> findRecentByStudent(Long studentId, java.time.LocalDateTime since);
}
