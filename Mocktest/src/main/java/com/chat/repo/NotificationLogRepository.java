package com.chat.repo;

import com.chat.entity.NotificationLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationLogRepository
        extends JpaRepository<NotificationLog, Long> {

    List<NotificationLog> findTop50ByOrderBySentAtDesc();
    List<NotificationLog> findByUserIdOrderBySentAtDesc(Long userId);
}
