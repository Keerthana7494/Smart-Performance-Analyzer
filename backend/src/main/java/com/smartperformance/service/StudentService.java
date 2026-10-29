// package com.smartperformance.service;

// import com.smartperformance.dto.StudentRequest;
// import com.smartperformance.dto.StudentResponse;
// import com.smartperformance.entity.Student;
// import com.smartperformance.exception.DuplicateResourceException;
// import com.smartperformance.exception.ResourceNotFoundException;
// import com.smartperformance.repository.StudentRepository;
// import org.springframework.stereotype.Service;
// import org.springframework.transaction.annotation.Transactional;

// import java.util.List;
// import java.util.stream.Collectors;

// @Service
// public class StudentService {
//     private final StudentRepository repository;

//     public StudentService(StudentRepository repository) {
//         this.repository = repository;
//     }

//     public StudentResponse create(StudentRequest request) {
//         if (repository.findByEmailIgnoreCase(request.getEmail()).isPresent()) {
//             throw new DuplicateResourceException("A student with this email already exists.");
//         }
//         Student s = new Student();
//         s.setStudentName(request.getStudentName().trim());
//         s.setEmail(request.getEmail().trim().toLowerCase());
//         s.setCourse(request.getCourse().trim());
//         s.setActive(1);
//         return toResponse(repository.save(s));
//     }

//     /** ACTIVE is the default view. Use ALL or INACTIVE to view other records. */
//     public List<StudentResponse> getStudents(String status) {
//         String normalized = status == null ? "ACTIVE" : status.trim().toUpperCase();
//         List<Student> students;
//         switch (normalized) {
//             case "ACTIVE":
//                 students = repository.findByActiveOrderByStudentNameAsc(1);
//                 break;
//             case "INACTIVE":
//                 students = repository.findByActiveOrderByStudentNameAsc(0);
//                 break;
//             case "ALL":
//                 students = repository.findAllByOrderByStudentNameAsc();
//                 break;
//             default:
//                 throw new IllegalArgumentException("Invalid student status filter. Use ACTIVE, INACTIVE, or ALL.");
//         }
//         return students.stream().map(this::toResponse).collect(Collectors.toList());
//     }

//     public StudentResponse getActiveStudentById(Long id) {
//         Student student = repository.findById(id)
//                 .orElseThrow(() -> new ResourceNotFoundException("Student not found: " + id));
//         if (student.getActive() == null || student.getActive() != 1) {
//             throw new ResourceNotFoundException("Active student not found: " + id);
//         }
//         return toResponse(student);
//     }

//     public StudentResponse getById(Long id) {
//         return toResponse(repository.findById(id)
//                 .orElseThrow(() -> new ResourceNotFoundException("Student not found: " + id)));
//     }

//     @Transactional
//     public StudentResponse changeStatus(Long id, Integer active) {
//         if (active == null || (active != 0 && active != 1)) {
//             throw new IllegalArgumentException("Status must be 1 (active) or 0 (inactive).");
//         }
//         Student student = repository.findById(id)
//                 .orElseThrow(() -> new ResourceNotFoundException("Student not found: " + id));
//         student.setActive(active);
//         return toResponse(repository.save(student));
//     }

//     private StudentResponse toResponse(Student s) {
//         return new StudentResponse(s.getStudentId(), s.getStudentName(), s.getEmail(), s.getCourse(), s.getActive(), s.getCreatedAt());
//     }
// }
//========================================================================================================

package com.smartperformance.service;

import com.smartperformance.dto.StudentRequest;
import com.smartperformance.dto.StudentResponse;
import com.smartperformance.entity.Student;
import com.smartperformance.exception.DuplicateResourceException;
import com.smartperformance.exception.ResourceNotFoundException;
import com.smartperformance.repository.StudentRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class StudentService {

    private final StudentRepository repository;
    private final AuditLogService auditLogService;

    public StudentService(
            StudentRepository repository,
            AuditLogService auditLogService) {
        this.repository = repository;
        this.auditLogService = auditLogService;
    }

    // ---------------------------------------------------------
    // CREATE STUDENT
    // ---------------------------------------------------------

    @Transactional
    public StudentResponse create(StudentRequest request) {

        if (repository.findByEmailIgnoreCase(request.getEmail()).isPresent()) {
            throw new DuplicateResourceException(
                    "A student with this email already exists.");
        }

        Student student = new Student();

        student.setStudentName(request.getStudentName().trim());
        student.setEmail(request.getEmail().trim().toLowerCase());
        student.setCourse(request.getCourse().trim());
        student.setActive(1);

        // Save the student first to obtain the generated student ID.
        Student savedStudent = repository.save(student);

        // Record the successful creation in the same transaction.
        auditLogService.record(
                "CREATE_STUDENT",
                "STUDENT",
                savedStudent.getStudentId(),
                "Created student: " + savedStudent.getStudentName(),
                null,
                "{\"active\":1}"
        );

        return toResponse(savedStudent);
    }

    // ---------------------------------------------------------
    // GET STUDENTS BY STATUS
    // ---------------------------------------------------------

    /** ACTIVE is the default view. Use ALL or INACTIVE to view other records. */
    public List<StudentResponse> getStudents(String status) {

        String normalized = status == null
                ? "ACTIVE"
                : status.trim().toUpperCase();

        List<Student> students;

        switch (normalized) {
            case "ACTIVE":
                students = repository.findByActiveOrderByStudentNameAsc(1);
                break;

            case "INACTIVE":
                students = repository.findByActiveOrderByStudentNameAsc(0);
                break;

            case "ALL":
                students = repository.findAllByOrderByStudentNameAsc();
                break;

            default:
                throw new IllegalArgumentException(
                        "Invalid student status filter. Use ACTIVE, INACTIVE, or ALL.");
        }

        return students.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ---------------------------------------------------------
    // GET ACTIVE STUDENT BY ID
    // ---------------------------------------------------------

    public StudentResponse getActiveStudentById(Long id) {

        Student student = repository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Student not found: " + id));

        if (student.getActive() == null || student.getActive() != 1) {
            throw new ResourceNotFoundException(
                    "Active student not found: " + id);
        }

        return toResponse(student);
    }

    // ---------------------------------------------------------
    // GET STUDENT BY ID
    // ---------------------------------------------------------

    public StudentResponse getById(Long id) {

        return toResponse(
                repository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Student not found: " + id))
        );
    }

    // ---------------------------------------------------------
    // DEACTIVATE / REACTIVATE STUDENT
    // ---------------------------------------------------------

    @Transactional
    public StudentResponse changeStatus(Long id, Integer active) {

        if (active == null || (active != 0 && active != 1)) {
            throw new IllegalArgumentException(
                    "Status must be 1 (active) or 0 (inactive).");
        }

        Student student = repository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Student not found: " + id));

        Integer previousStatus = student.getActive();

        // Do not create duplicate audit events for unchanged status.
        if (Objects.equals(previousStatus, active)) {
            return toResponse(student);
        }

        student.setActive(active);

        Student savedStudent = repository.save(student);

        String action;
        String description;

        if (active == 0) {
            action = "DEACTIVATE_STUDENT";
            description = "Deactivated student: "
                    + savedStudent.getStudentName();
        } else {
            action = "REACTIVATE_STUDENT";
            description = "Reactivated student: "
                    + savedStudent.getStudentName();
        }

        // Store the status change in the audit history.
        auditLogService.record(
                action,
                "STUDENT",
                savedStudent.getStudentId(),
                description,
                "{\"active\":" + previousStatus + "}",
                "{\"active\":" + active + "}"
        );

        return toResponse(savedStudent);
    }

    // ---------------------------------------------------------
    // ENTITY TO RESPONSE DTO
    // ---------------------------------------------------------

    private StudentResponse toResponse(Student student) {

        return new StudentResponse(
                student.getStudentId(),
                student.getStudentName(),
                student.getEmail(),
                student.getCourse(),
                student.getActive(),
                student.getCreatedAt()
        );
    }
}
