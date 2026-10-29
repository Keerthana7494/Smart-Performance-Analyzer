package com.smartperformance.service;

import com.smartperformance.dto.DashboardResponse;
import com.smartperformance.dto.PerformanceRequest;
import com.smartperformance.dto.PerformanceResponse;
import com.smartperformance.entity.Student;
import com.smartperformance.entity.StudentPerformance;
import com.smartperformance.exception.ResourceNotFoundException;
import com.smartperformance.repository.PerformanceRepository;
import com.smartperformance.repository.StudentRepository;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.CallableStatement;
import java.sql.Types;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PerformanceService {

    private static final String AUDIT_ENTITY_TYPE = "STUDENT_PERFORMANCE";

    private final PerformanceRepository performanceRepository;
    private final StudentRepository studentRepository;
    private final JdbcTemplate jdbcTemplate;
    private final AIService aiService;
    private final AuditLogService auditLogService;

    public PerformanceService(PerformanceRepository performanceRepository,
                              StudentRepository studentRepository,
                              JdbcTemplate jdbcTemplate,
                              AIService aiService,
                              AuditLogService auditLogService) {
        this.performanceRepository = performanceRepository;
        this.studentRepository = studentRepository;
        this.jdbcTemplate = jdbcTemplate;
        this.aiService = aiService;
        this.auditLogService = auditLogService;
    }

    @Transactional
    public PerformanceResponse create(PerformanceRequest request) {
        Student student = getActiveStudent(request.getStudentId());
        PerformanceResult result = calculateUsingPlsql(request);

        StudentPerformance p = new StudentPerformance();
        p.setStudent(student);
        applyRequest(p, request);
        applyCalculatedResult(p, result);
        p = performanceRepository.save(p);

        p.setAiRecommendation(aiService.generateRecommendation(p));
        p = performanceRepository.save(p);

        // The audit event shares this transaction with the performance insert.
        auditLogService.record(
                "CREATE_PERFORMANCE",
                AUDIT_ENTITY_TYPE,
                p.getPerformanceId(),
                "Created performance for student: " + student.getStudentName()
                        + " (student ID: " + student.getStudentId() + ")",
                null,
                snapshot(p)
        );

        return toResponse(p);
    }

    @Transactional
    public PerformanceResponse update(Long performanceId, PerformanceRequest request) {
        StudentPerformance p = performanceRepository.findById(performanceId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Performance not found: " + performanceId));

        String oldValue = snapshot(p);
        Student student = getActiveStudent(request.getStudentId());

        p.setStudent(student);
        applyRequest(p, request);
        applyCalculatedResult(p, calculateUsingPlsql(request));

        p.setAiRecommendation(aiService.generateRecommendation(p));
        p = performanceRepository.save(p);

        auditLogService.record(
                "UPDATE_PERFORMANCE",
                AUDIT_ENTITY_TYPE,
                p.getPerformanceId(),
                "Updated performance for student: " + student.getStudentName()
                        + " (student ID: " + student.getStudentId() + ")",
                oldValue,
                snapshot(p)
        );

        return toResponse(p);
    }

    public List<PerformanceResponse> getAll() {
        return performanceRepository.findActivePerformance()
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public PerformanceResponse getById(Long id) {
        StudentPerformance p = performanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Performance not found: " + id));
        return toResponse(p);
    }

    @Transactional
    public void delete(Long id) {
        if (!performanceRepository.existsById(id)) {
            throw new ResourceNotFoundException("Performance not found: " + id);
        }
        performanceRepository.deleteById(id);
    }

    public DashboardResponse dashboard() {
        long totalStudents = studentRepository.findByActiveOrderByStudentNameAsc(1).size();
        Double avg = performanceRepository.findAverageScore();

        return new DashboardResponse(
                totalStudents,
                avg == null ? 0.0 : avg,
                performanceRepository.countLatestByPerformanceLevel("EXCELLENT"),
                performanceRepository.countLatestByPerformanceLevel("GOOD"),
                performanceRepository.countLatestByPerformanceLevel("AVERAGE"),
                performanceRepository.countLatestByPerformanceLevel("POOR"),
                performanceRepository.countLatestByRiskStatus("HIGH")
        );
    }

    private Student getActiveStudent(Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found: " + studentId));

        if (student.getActive() == null || student.getActive() != 1) {
            throw new ResourceNotFoundException("Student is inactive.");
        }
        return student;
    }

    private void applyRequest(StudentPerformance p, PerformanceRequest request) {
        p.setAttendance(request.getAttendance());
        p.setAssignmentScore(request.getAssignmentScore());
        p.setTestScore(request.getTestScore());
        p.setProjectScore(request.getProjectScore());
    }

    private void applyCalculatedResult(StudentPerformance p, PerformanceResult result) {
        p.setOverallScore(result.overallScore);
        p.setPerformanceLevel(result.level);
        p.setRiskStatus(result.risk);
    }

    /** Human-readable, non-sensitive snapshot stored in OLD_VALUE / NEW_VALUE. */
    private String snapshot(StudentPerformance p) {
        return "studentId=" + p.getStudent().getStudentId()
                + ", attendance=" + p.getAttendance()
                + ", assignmentScore=" + p.getAssignmentScore()
                + ", testScore=" + p.getTestScore()
                + ", projectScore=" + p.getProjectScore()
                + ", overallScore=" + p.getOverallScore()
                + ", performanceLevel=" + p.getPerformanceLevel()
                + ", riskStatus=" + p.getRiskStatus();
    }

    private PerformanceResult calculateUsingPlsql(PerformanceRequest r) {
        return jdbcTemplate.execute(
                "{call calculate_performance(?,?,?,?,?,?,?)}",
                (CallableStatement cs) -> {
                    cs.setDouble(1, r.getAttendance());
                    cs.setDouble(2, r.getAssignmentScore());
                    cs.setDouble(3, r.getTestScore());
                    cs.setDouble(4, r.getProjectScore());
                    cs.registerOutParameter(5, Types.NUMERIC);
                    cs.registerOutParameter(6, Types.VARCHAR);
                    cs.registerOutParameter(7, Types.VARCHAR);
                    cs.execute();
                    return new PerformanceResult(cs.getDouble(5), cs.getString(6), cs.getString(7));
                }
        );
    }

    private PerformanceResponse toResponse(StudentPerformance p) {
        PerformanceResponse r = new PerformanceResponse();
        r.setPerformanceId(p.getPerformanceId());
        r.setStudentId(p.getStudent().getStudentId());
        r.setStudentName(p.getStudent().getStudentName());
        r.setCourse(p.getStudent().getCourse());
        r.setAttendance(p.getAttendance());
        r.setAssignmentScore(p.getAssignmentScore());
        r.setTestScore(p.getTestScore());
        r.setProjectScore(p.getProjectScore());
        r.setOverallScore(p.getOverallScore());
        r.setPerformanceLevel(p.getPerformanceLevel());
        r.setRiskStatus(p.getRiskStatus());
        r.setAiRecommendation(p.getAiRecommendation());
        r.setCreatedAt(p.getCreatedAt() == null ? null : p.getCreatedAt().toString());
        return r;
    }

    private static class PerformanceResult {
        private final Double overallScore;
        private final String level;
        private final String risk;

        private PerformanceResult(Double overallScore, String level, String risk) {
            this.overallScore = overallScore;
            this.level = level;
            this.risk = risk;
        }
    }
}
