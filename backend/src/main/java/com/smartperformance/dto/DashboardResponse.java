package com.smartperformance.dto;

public class DashboardResponse {
    private long totalStudents;
    private double averageScore;
    private long excellentCount;
    private long goodCount;
    private long averageCount;
    private long poorCount;
    private long highRiskCount;

    public DashboardResponse(long totalStudents, double averageScore, long excellentCount,
                             long goodCount, long averageCount, long poorCount, long highRiskCount) {
        this.totalStudents = totalStudents;
        this.averageScore = averageScore;
        this.excellentCount = excellentCount;
        this.goodCount = goodCount;
        this.averageCount = averageCount;
        this.poorCount = poorCount;
        this.highRiskCount = highRiskCount;
    }

    public long getTotalStudents() { return totalStudents; }
    public double getAverageScore() { return averageScore; }
    public long getExcellentCount() { return excellentCount; }
    public long getGoodCount() { return goodCount; }
    public long getAverageCount() { return averageCount; }
    public long getPoorCount() { return poorCount; }
    public long getHighRiskCount() { return highRiskCount; }
}
