package com.chat.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import com.chat.entity.QuestionAttempt;

public interface QuestionAttemptRepository
        extends JpaRepository<QuestionAttempt, Long> {

    List<QuestionAttempt> findBySessionId(Long sessionId);
}
