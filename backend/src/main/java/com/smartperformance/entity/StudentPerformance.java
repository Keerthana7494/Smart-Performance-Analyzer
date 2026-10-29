package com.smartperformance.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "STUDENT_PERFORMANCE")
public class StudentPerformance {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "perf_seq_gen")
    @SequenceGenerator(name = "perf_seq_gen", sequenceName = "PERF_SEQ", allocationSize = 1)
    @Column(name = "PERFORMANCE_ID")
    private Long performanceId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "STUDENT_ID", nullable = false)
    private Student student;

    @Column(name = "ATTENDANCE", nullable = false)
    private Double attendance;

    @Column(name = "ASSIGNMENT_SCORE", nullable = false)
    private Double assignmentScore;

    @Column(name = "TEST_SCORE", nullable = false)
    private Double testScore;

    @Column(name = "PROJECT_SCORE", nullable = false)
    private Double projectScore;

    @Column(name = "OVERALL_SCORE")
    private Double overallScore;

    @Column(name = "PERFORMANCE_LEVEL", length = 30)
    private String performanceLevel;

    @Column(name = "RISK_STATUS", length = 20)
    private String riskStatus;

    @Lob
    @Column(name = "AI_RECOMMENDATION")
    private String aiRecommendation;

    @Column(name = "CREATED_AT", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "UPDATED_AT", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getPerformanceId() { return performanceId; }
    public void setPerformanceId(Long performanceId) { this.performanceId = performanceId; }
    public Student getStudent() { return student; }
    public void setStudent(Student student) { this.student = student; }
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
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
