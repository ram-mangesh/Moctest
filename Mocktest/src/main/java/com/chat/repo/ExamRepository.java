package com.chat.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import com.chat.entity.Exam;

public interface ExamRepository extends JpaRepository<Exam, Long> {
    List<Exam> findByNameContainingIgnoreCase(String name);

}
