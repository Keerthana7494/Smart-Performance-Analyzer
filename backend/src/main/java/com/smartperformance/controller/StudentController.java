package com.smartperformance.controller;

import com.smartperformance.dto.StudentRequest;
import com.smartperformance.dto.StudentResponse;
import com.smartperformance.service.StudentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/students")
public class StudentController {
    private final StudentService service;

    public StudentController(StudentService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<StudentResponse> create(@Valid @RequestBody StudentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(request));
    }

    /** Defaults to ACTIVE so existing frontend calls keep working. */
    @GetMapping
    public ResponseEntity<List<StudentResponse>> getAll(
            @RequestParam(defaultValue = "ACTIVE") String status) {
        return ResponseEntity.ok(service.getStudents(status));
    }

    @GetMapping("/{id}")
    public ResponseEntity<StudentResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    /** Set active=0 to deactivate, or active=1 to reactivate a student. */
    @PatchMapping("/{id}/status")
    public ResponseEntity<StudentResponse> changeStatus(
            @PathVariable Long id,
            @RequestParam Integer active) {
        return ResponseEntity.ok(service.changeStatus(id, active));
    }
}
