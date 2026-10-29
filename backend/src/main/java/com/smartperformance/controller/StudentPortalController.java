
package com.smartperformance.controller;

import com.smartperformance.dto.StudentPortalResponse;
import com.smartperformance.service.StudentPortalService;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/student/me")
public class StudentPortalController {

    private final StudentPortalService studentPortalService;

    public StudentPortalController(
            StudentPortalService studentPortalService) {
        this.studentPortalService = studentPortalService;
    }

    @GetMapping("/performance")
    public StudentPortalResponse getMyPerformance(
            Authentication authentication) {

        return studentPortalService.getMyPerformance(
            authentication.getName()
        );
    }
}

