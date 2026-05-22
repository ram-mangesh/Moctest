package com.chat.repo;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.chat.dto.LeaderboardDTO;
import com.chat.entity.GroupParticipant;

public interface GroupParticipantRepository
extends JpaRepository<GroupParticipant, Long> {

boolean existsByGroupExamIdAndUserId(Long groupExamId, Long userId);

List<GroupParticipant> findByGroupExamId(Long groupExamId);

Optional<GroupParticipant> findByGroupExamIdAndUserId(
    Long groupExamId, Long userId
);
long countByGroupExamId(Long groupId);

@Query("""
SELECT new com.chat.dto.LeaderboardDTO(
    p.userId,
    u.name,
    p.score,
    p.attempted,
    p.timeTaken
)
FROM GroupParticipant p
JOIN User u ON u.id = p.userId
WHERE p.groupExam.id = :groupExamId
ORDER BY p.score DESC, p.timeTaken ASC
""")
List<LeaderboardDTO> getLeaderboard(Long groupExamId);

}
