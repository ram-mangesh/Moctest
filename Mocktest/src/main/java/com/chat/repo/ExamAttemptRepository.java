package com.chat.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.chat.entity.ExamAttempt;

public interface ExamAttemptRepository
extends JpaRepository<ExamAttempt, Long> {

List<ExamAttempt> findByUserIdOrderByAttemptedAtAsc(Long userId);
List<ExamAttempt> findByUserId(Long userId);


}
