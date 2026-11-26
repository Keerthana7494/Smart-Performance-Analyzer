package com.smartperformance.service;

import com.smartperformance.dto.PerformanceRequest;
import com.smartperformance.dto.PerformanceResponse;
import com.smartperformance.entity.Student;
import com.smartperformance.entity.StudentPerformance;
import com.smartperformance.exception.ResourceNotFoundException;
import com.smartperformance.repository.PerformanceRepository;
import com.smartperformance.repository.StudentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.jdbc.core.CallableStatementCallback;
import org.springframework.jdbc.core.JdbcTemplate;

import java.sql.CallableStatement;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.contains;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class PerformanceServiceTest {

    @Mock PerformanceRepository performanceRepository;
    @Mock StudentRepository studentRepository;
    @Mock JdbcTemplate jdbcTemplate;
    @Mock AIService aiService;
    @Mock AuditLogService auditLogService;
    @InjectMocks PerformanceService service;

    private Student student;
    private CallableStatement callable;

    @BeforeEach
    @SuppressWarnings({"unchecked", "rawtypes"})
    void setUp() throws Exception {
        student = new Student();
        student.setStudentId(1L);
        student.setStudentName("Asha");
        student.setActive(1);

        // Fake the PL/SQL procedure: OUT params 5,6,7 = score, level, risk
        callable = mock(CallableStatement.class);
        when(callable.getDouble(5)).thenReturn(80.5);
        when(callable.getString(6)).thenReturn("GOOD");
        when(callable.getString(7)).thenReturn("LOW");

        when(jdbcTemplate.execute(anyString(), any(CallableStatementCallback.class)))
                .thenAnswer(inv -> ((CallableStatementCallback) inv.getArgument(1))
                        .doInCallableStatement(callable));

        when(performanceRepository.save(any(StudentPerformance.class)))
                .thenAnswer(inv -> inv.getArgument(0));
        when(aiService.generateRecommendation(any())).thenReturn("Keep it up.");
    }

    private PerformanceRequest request(long studentId) {
        PerformanceRequest r = new PerformanceRequest();
        r.setStudentId(studentId);
        r.setAttendance(80.0);
        r.setAssignmentScore(70.0);
        r.setTestScore(75.0);
        r.setProjectScore(90.0);
        return r;
    }

    @Test
    void create_usesProcedureResultAndWritesAuditLog() throws Exception {
        when(studentRepository.findById(1L)).thenReturn(Optional.of(student));

        PerformanceResponse response = service.create(request(1L));

        assertThat(response.getOverallScore()).isEqualTo(80.5);
        assertThat(response.getPerformanceLevel()).isEqualTo("GOOD");
        assertThat(response.getRiskStatus()).isEqualTo("LOW");
        assertThat(response.getAiRecommendation()).isEqualTo("Keep it up.");

        verify(callable).setDouble(1, 80.0);
        verify(callable).setDouble(2, 70.0);
        verify(callable).setDouble(3, 75.0);
        verify(callable).setDouble(4, 90.0);

        verify(auditLogService).record(
                eq("CREATE_PERFORMANCE"), eq("STUDENT_PERFORMANCE"), any(),
                contains("Asha"), isNull(), contains("overallScore=80.5"));
    }

    @Test
    void create_unknownStudent_throwsAndSavesNothing() {
        when(studentRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.create(request(99L)))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(performanceRepository, never()).save(any());
        verify(auditLogService, never()).record(any(), any(), any(), any(), any(), any());
    }

    @Test
    void create_inactiveStudent_isRejected() {
        student.setActive(0);
        when(studentRepository.findById(1L)).thenReturn(Optional.of(student));

        assertThatThrownBy(() -> service.create(request(1L)))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("inactive");

        verify(performanceRepository, never()).save(any());
    }

    @Test
    void update_recordsOldAndNewValues() {
        StudentPerformance existing = new StudentPerformance();
        existing.setStudent(student);
        existing.setAttendance(50.0);
        existing.setAssignmentScore(50.0);
        existing.setTestScore(50.0);
        existing.setProjectScore(50.0);

        when(performanceRepository.findById(5L)).thenReturn(Optional.of(existing));
        when(studentRepository.findById(1L)).thenReturn(Optional.of(student));

        service.update(5L, request(1L));

        verify(auditLogService).record(
                eq("UPDATE_PERFORMANCE"), eq("STUDENT_PERFORMANCE"), any(),
                contains("Asha"),
                contains("attendance=50.0"),
                contains("attendance=80.0"));
    }

    @Test
    void getById_missing_throwsNotFound() {
        when(performanceRepository.findById(404L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getById(404L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void delete_missing_throwsNotFound() {
        when(performanceRepository.findById(404L)).thenReturn(Optional.empty());
        when(performanceRepository.existsById(404L)).thenReturn(false);

        assertThatThrownBy(() -> service.delete(404L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    // Fails until you add auditing to PerformanceService.delete() (Step 7 of the guide).
    @Test
    void delete_writesAuditLog() {
        StudentPerformance existing = new StudentPerformance();
        existing.setStudent(student);
        when(performanceRepository.findById(5L)).thenReturn(Optional.of(existing));
        when(performanceRepository.existsById(5L)).thenReturn(true);

        service.delete(5L);

        verify(auditLogService).record(
                eq("DELETE_PERFORMANCE"), eq("STUDENT_PERFORMANCE"), any(),
                any(), any(), isNull());
    }
}
