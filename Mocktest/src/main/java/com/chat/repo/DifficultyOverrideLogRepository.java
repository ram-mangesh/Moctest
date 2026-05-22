package com.chat.repo;

import com.chat.entity.DifficultyOverrideLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DifficultyOverrideLogRepository
        extends JpaRepository<DifficultyOverrideLog, Long> {

    List<DifficultyOverrideLog> findByUserId(Long userId);
    List<DifficultyOverrideLog> findByTopicId(Long topicId);
    List<DifficultyOverrideLog> findByUserIdAndTopicId(Long userId, Long topicId);
}