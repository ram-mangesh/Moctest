package com.chat.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.chat.entity.RealExamAttempt;

public interface RealExamAttemptRepository
        extends JpaRepository<RealExamAttempt, Long> {

    @Query("""
        select r.questionId
        from RealExamAttempt r
        where r.userId = :userId
          and r.examId = :examId
    """)
    List<Long> findUsedQuestionIds(Long userId, Long examId);
}