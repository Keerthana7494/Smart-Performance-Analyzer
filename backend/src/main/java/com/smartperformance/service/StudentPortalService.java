
package com.smartperformance.service;

//import com.smartperformance.auth.entity.User;
import com.smartperformance.auth.repository.UserRepository;
import com.smartperformance.dto.PerformanceResponse;
import com.smartperformance.dto.StudentPortalResponse;
import com.smartperformance.entity.Student;
import com.smartperformance.entity.StudentPerformance;
import com.smartperformance.repository.PerformanceRepository;
import com.smartperformance.repository.StudentRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class StudentPortalService {

    //private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final PerformanceRepository performanceRepository;

    public StudentPortalService(
            UserRepository userRepository,
            StudentRepository studentRepository,
            PerformanceRepository performanceRepository) {
        //this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.performanceRepository = performanceRepository;
    }

    @Transactional(readOnly = true)
    public StudentPortalResponse getMyPerformance(String email) {

        Student student = studentRepository
    .findByEmailIgnoreCaseAndActive(email, 1)
    .orElseThrow(() ->
        new ResponseStatusException(
            HttpStatus.NOT_FOUND,
            "No student profile is linked to this account."
        )
    );

        List<PerformanceResponse> records =
            performanceRepository
                .findByStudent_StudentIdOrderByCreatedAtAsc(
                    student.getStudentId()
                )
                .stream()
                .map(this::toResponse)
                .toList();

        return new StudentPortalResponse(
            student.getStudentId(),
            student.getStudentName(),
            student.getCourse(),
            records
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
        r.setCreatedAt(
            p.getCreatedAt() == null
                ? null
                : p.getCreatedAt().toString()
        );

        return r;
    }
}

