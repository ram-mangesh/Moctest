package com.chat.repo;

import com.chat.entity.UserStressConfig;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserStressConfigRepository
        extends JpaRepository<UserStressConfig, Long> {

    Optional<UserStressConfig> findByUserId(Long userId);
}