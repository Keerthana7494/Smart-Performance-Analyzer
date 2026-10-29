package com.smartperformance.dto;

import jakarta.validation.constraints.*;

public class PerformanceRequest {
    @NotNull(message = "Student is required")
    private Long studentId;

    @NotNull @DecimalMin("0.0") @DecimalMax("100.0")
    private Double attendance;

    @NotNull @DecimalMin("0.0") @DecimalMax("100.0")
    private Double assignmentScore;

    @NotNull @DecimalMin("0.0") @DecimalMax("100.0")
    private Double testScore;

    @NotNull @DecimalMin("0.0") @DecimalMax("100.0")
    private Double projectScore;

    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }
    public Double getAttendance() { return attendance; }
    public void setAttendance(Double attendance) { this.attendance = attendance; }
    public Double getAssignmentScore() { return assignmentScore; }
    public void setAssignmentScore(Double assignmentScore) { this.assignmentScore = assignmentScore; }
    public Double getTestScore() { return testScore; }
    public void setTestScore(Double testScore) { this.testScore = testScore; }
    public Double getProjectScore() { return projectScore; }
    public void setProjectScore(Double projectScore) { this.projectScore = projectScore; }
}
