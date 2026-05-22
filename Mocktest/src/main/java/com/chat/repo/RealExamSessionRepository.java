package com.chat.repo;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.chat.entity.RealExamSession;

public interface RealExamSessionRepository
        extends JpaRepository<RealExamSession, Long> {
	List<RealExamSession> findByUserIdAndStatus(
		    Long userId,
		    RealExamSession.Status status
		);
	
	List<RealExamSession> findByExamIdAndStatus(
		    Long examId,
		    RealExamSession.Status status
		);
    Optional<RealExamSession> findByUserIdAndExamId(Long userId, Long examId);
}