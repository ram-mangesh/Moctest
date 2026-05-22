package com.chat.repo;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import com.chat.entity.GroupExam;

public interface GroupExamRepository
        extends JpaRepository<GroupExam, Long> {
    Optional<GroupExam> findByInviteCode(String inviteCode);
    List<GroupExam> findByCreatedByAndExpiredFalse(Long createdBy); 
    List<GroupExam> findByCreatedBy(Long userId);// ✅ creator only


	
}
