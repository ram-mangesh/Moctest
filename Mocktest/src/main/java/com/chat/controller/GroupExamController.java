package com.chat.controller;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.web.bind.annotation.*;

import com.chat.dto.GroupSubmitRequest;
import com.chat.dto.LeaderboardDTO;
import com.chat.entity.GroupExam;
import com.chat.entity.GroupParticipant;
import com.chat.entity.User;
import com.chat.repo.GroupExamRepository;
import com.chat.repo.GroupParticipantRepository;
import com.chat.repo.Userrepo;
import com.chat.security.JwtUtil;
@RestController
@RequestMapping("/api/group-exam")
public class GroupExamController {

    private final GroupExamRepository groupRepo;
    private final GroupParticipantRepository participantRepo;
    private final JwtUtil jwtUtil;
    private final Userrepo userRepo;

    public GroupExamController(
            GroupExamRepository groupRepo,
            GroupParticipantRepository participantRepo,
            JwtUtil jwtUtil,
            Userrepo userRepo
    ) {
        this.groupRepo = groupRepo;
        this.participantRepo = participantRepo;
        this.jwtUtil = jwtUtil;
        this.userRepo = userRepo;
    }

    /* ================= CREATE GROUP ================= */
    @PostMapping("/create")
    public GroupExam createGroup(
            @RequestParam Long topicId,
            @RequestHeader("Authorization") String auth
    ) {
        String token = auth.replace("Bearer ", "");
        String email = jwtUtil.extractEmail(token);

        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        GroupExam group = new GroupExam();
        group.setTopicId(topicId);
        group.setCreatedBy(user.getId());
        group.setInviteCode(UUID.randomUUID().toString().substring(0, 6));
        group.setStarted(false);
        group.setStartTime(LocalDateTime.now());
        group.setDuration(1800); // ✅ FIXED (IMPORTANT)

        group = groupRepo.save(group);

        // ✅ ADD CREATOR AS PARTICIPANT
        GroupParticipant creator = new GroupParticipant();
        creator.setUserId(user.getId());
        creator.setGroupExam(group);
        creator.setScore(0);
        creator.setTimeTaken(0);
        creator.setAttempted(0);

        participantRepo.save(creator);

        return group;
    }

    /* ================= JOIN GROUP ================= */
  @PostMapping("/join/{code}")
public GroupExam joinGroup(
        @PathVariable String code,
        @RequestHeader("Authorization") String auth
) {
    String token = auth.replace("Bearer ", "");
    String email = jwtUtil.extractEmail(token);

    User user = userRepo.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));

    GroupExam group = groupRepo.findByInviteCode(code.trim())
            .orElseThrow(() -> new RuntimeException("Invalid invite code"));

    boolean exists = participantRepo
            .existsByGroupExamIdAndUserId(group.getId(), user.getId());

    if (!exists) {
        GroupParticipant p = new GroupParticipant();
        p.setUserId(user.getId());
        p.setGroupExam(group);
        p.setScore(0);
        p.setAttempted(0);   // ✅ THIS IS THE ONLY FIX
        p.setTimeTaken(0);
        participantRepo.save(p);
    }

    // 🔥 LOAD PARTICIPANTS AGAIN
    group.setParticipants(
            participantRepo.findByGroupExamId(group.getId())
    );

    return group;
}

    /* ================= GET LOBBY ================= */	
    @GetMapping("/{id}")
    public GroupExam getGroup(@PathVariable Long id) {

        GroupExam group = groupRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        // 🔥 FIX: LOAD PARTICIPANTS MANUALLY
        List<GroupParticipant> participants =
                participantRepo.findByGroupExamId(id);

        group.setParticipants(participants); // ✅ THIS LINE FIXES COUNT

        return group;
    }
    /* ================= START EXAM ================= */
    @PostMapping("/{id}/start")
    public void startExam(
            @PathVariable Long id,
            @RequestHeader("Authorization") String auth
    ) {
        String token = auth.replace("Bearer ", "");
        String email = jwtUtil.extractEmail(token);

        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        GroupExam group = groupRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        if (!group.getCreatedBy().equals(user.getId())) {
            throw new RuntimeException("Only creator can start exam");
        }

        group.setStarted(true);
        group.setStartTime(LocalDateTime.now());
        groupRepo.save(group);
    }
    @GetMapping("/my-groups")
    public List<GroupExam> myGroups(
            @RequestHeader("Authorization") String auth
    ) {
        String token = auth.replace("Bearer ", "");
        String email = jwtUtil.extractEmail(token);

        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<GroupExam> groups = groupRepo.findByCreatedBy(user.getId());

        // ✅ load participants for each group
        for (GroupExam g : groups) {
            g.setParticipants(
                    participantRepo.findByGroupExamId(g.getId())
            );
        }

        return groups;
    }
    
    /* ================= SUBMIT GROUP EXAM ================= */
    @PostMapping("/{id}/submit")
    public void submitGroupExam(
            @PathVariable Long id,
            @RequestBody Map<String, Integer> payload,
            @RequestHeader("Authorization") String auth
    ) {
        // 🔐 AUTH
        String token = auth.replace("Bearer ", "");
        String email = jwtUtil.extractEmail(token);

        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 👤 PARTICIPANT
        GroupParticipant participant =
                participantRepo.findByGroupExamIdAndUserId(id, user.getId())
                .orElseThrow(() -> new RuntimeException("Not a participant"));

        // 🚫 PREVENT DOUBLE SUBMIT
        if (participant.getAttempted() > 0) {
            throw new RuntimeException("Exam already submitted");
        }

        // 📦 PAYLOAD VALIDATION
        Integer score = payload.get("score");
        Integer attempted = payload.get("attempted");
        Integer timeTaken = payload.get("timeTaken");

        if (score == null || attempted == null) {
            throw new RuntimeException("Invalid submission data");
        }

        if (attempted <= 0) {
            throw new RuntimeException("Attempted must be greater than zero");
        }

        if (score < 0 || score > attempted) {
            throw new RuntimeException("Invalid score value");
        }

        // 💾 SAVE FINAL RESULT
        participant.setScore(score);
        participant.setAttempted(attempted);
        participant.setTimeTaken(timeTaken != null ? timeTaken : 0);

        participantRepo.save(participant);
    }
    
    
@GetMapping("/{id}/leaderboard")
public List<LeaderboardDTO> getLeaderboard(
        @PathVariable Long id,
        @RequestHeader("Authorization") String auth
) {
    String token = auth.replace("Bearer ", "");
    String email = jwtUtil.extractEmail(token);

    User user = userRepo.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));


    List<LeaderboardDTO> leaderboard = participantRepo.getLeaderboard(id);
    return leaderboard;
}
   

@DeleteMapping("/{id}")
public void deleteGroupExam(
        @PathVariable Long id,
        @RequestHeader("Authorization") String auth
) {

    String token = auth.replace("Bearer ", "");
    String email = jwtUtil.extractEmail(token);

    User user = userRepo.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));

    GroupExam group = groupRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Group not found"));

    // Only creator can delete
    if (!group.getCreatedBy().equals(user.getId())) {
        throw new RuntimeException("Only creator can delete this group");
    }

    groupRepo.deleteById(id);
}
   
}