package com.chat.dto;

public class LeaderboardDTO {

    private Long userId;
    private String username;
    private int score;
    private int attempted;
    private int timeTaken;

    public LeaderboardDTO(
            Long userId,
            String username,
            int score,
            int attempted,
            int timeTaken
    ) {
        this.userId = userId;
        this.username = username;
        this.score = score;
        this.attempted = attempted;
        this.timeTaken = timeTaken;
    }

    // getters
    public Long getUserId() { return userId; }
    public String getUsername() { return username; }
    public int getScore() { return score; }
    public int getAttempted() { return attempted; }
    public int getTimeTaken() { return timeTaken; }
}