package com.smartperformance.dto;

public class PerformanceResponse {
    private Long performanceId;
    private Long studentId;
    private String studentName;
    private String course;
    private Double attendance;
    private Double assignmentScore;
    private Double testScore;
    private Double projectScore;
    private Double overallScore;
    private String performanceLevel;
    private String riskStatus;
    private String aiRecommendation;
    private String createdAt;

    public Long getPerformanceId() { return performanceId; }
    public void setPerformanceId(Long performanceId) { this.performanceId = performanceId; }
    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }
    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }
    public String getCourse() { return course; }
    public void setCourse(String course) { this.course = course; }
    public Double getAttendance() { return attendance; }
    public void setAttendance(Double attendance) { this.attendance = attendance; }
    public Double getAssignmentScore() { return assignmentScore; }
    public void setAssignmentScore(Double assignmentScore) { this.assignmentScore = assignmentScore; }
    public Double getTestScore() { return testScore; }
    public void setTestScore(Double testScore) { this.testScore = testScore; }
    public Double getProjectScore() { return projectScore; }
    public void setProjectScore(Double projectScore) { this.projectScore = projectScore; }
    public Double getOverallScore() { return overallScore; }
    public void setOverallScore(Double overallScore) { this.overallScore = overallScore; }
    public String getPerformanceLevel() { return performanceLevel; }
    public void setPerformanceLevel(String performanceLevel) { this.performanceLevel = performanceLevel; }
    public String getRiskStatus() { return riskStatus; }
    public void setRiskStatus(String riskStatus) { this.riskStatus = riskStatus; }
    public String getAiRecommendation() { return aiRecommendation; }
    public void setAiRecommendation(String aiRecommendation) { this.aiRecommendation = aiRecommendation; }
    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}
