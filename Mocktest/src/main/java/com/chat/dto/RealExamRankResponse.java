package com.chat.dto;

public class RealExamRankResponse {

    private int rank;
    private String userName;
    private int total;
    private int correct;
    private int wrong;
    private double scorePercent;
    private long timeTakenSeconds; // ✅ ADD

    public RealExamRankResponse(
            int rank,
            String userName,
            int total,
            int correct,
            int wrong,
            double scorePercent,
            long timeTakenSeconds
    ) {
        this.rank = rank;
        this.userName = userName;
        this.total = total;
        this.correct = correct;
        this.wrong = wrong;
        this.scorePercent = scorePercent;
        this.timeTakenSeconds = timeTakenSeconds;
    }

    public int getRank() { return rank; }
    public String getUserName() { return userName; }
    public int getTotal() { return total; }
    public int getCorrect() { return correct; }
    public int getWrong() { return wrong; }
    public double getScorePercent() { return scorePercent; }
    public long getTimeTakenSeconds() { return timeTakenSeconds; }
}