package com.chat.controller;

import java.time.Duration;
import java.util.*;

import org.springframework.web.bind.annotation.*;

import com.chat.dto.RealExamRankResponse;
import com.chat.entity.RealExamSession;
import com.chat.repo.RealExamSessionRepository;
import com.chat.repo.Userrepo;

@RestController
@RequestMapping("/api/real-exam")
public class RealExamRankController {

    private final RealExamSessionRepository sessionRepo;
    private final Userrepo userRepo;

    public RealExamRankController(
            RealExamSessionRepository sessionRepo,
            Userrepo userRepo
    ) {
        this.sessionRepo = sessionRepo;
        this.userRepo = userRepo;
    }

    @GetMapping("/ranking")
    public List<RealExamRankResponse> ranking(
            @RequestParam Long examId) {

        List<RealExamSession> sessions =
                sessionRepo.findByExamIdAndStatus(
                        examId,
                        RealExamSession.Status.COMPLETED
                );

        sessions.sort(
                Comparator
                        .comparingInt(RealExamSession::getCorrect).reversed()
                        .thenComparing(
                                Comparator.comparingDouble(
                                        RealExamSession::getScorePercent
                                ).reversed()
                        )
                        .thenComparingInt(RealExamSession::getWrong)
                        .thenComparingLong(this::timeTaken)
        );

        List<RealExamRankResponse> result = new ArrayList<>();
        int rank = 1;

        for (RealExamSession s : sessions) {

            String name = userRepo.findById(s.getUserId())
                    .map(u -> u.getName())
                    .orElse("User");

            result.add(
                    new RealExamRankResponse(
                            rank++,
                            name,
                            s.getTotal(),
                            s.getCorrect(),
                            s.getWrong(),
                            s.getScorePercent(),
                            timeTaken(s)
                    )
            );
        }

        return result;
    }

    private long timeTaken(RealExamSession s) {
        if (s.getStartedAt() == null || s.getEndTime() == null)
            return 0;

        return Duration
                .between(s.getStartedAt(), s.getEndTime())
                .getSeconds();
    }
}