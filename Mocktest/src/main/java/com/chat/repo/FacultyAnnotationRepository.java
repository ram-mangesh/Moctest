package com.chat.repo;

import com.chat.entity.FacultyAnnotation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FacultyAnnotationRepository
        extends JpaRepository<FacultyAnnotation, Long> {

    List<FacultyAnnotation> findByAttemptId(Long attemptId);

    List<FacultyAnnotation> findByStudentId(Long studentId);

    List<FacultyAnnotation> findByTeacherId(Long teacherId);
}