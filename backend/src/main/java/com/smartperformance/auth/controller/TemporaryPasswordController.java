package com.smartperformance.auth.controller;

import com.smartperformance.auth.dto.ChangeTemporaryPasswordRequest;
import com.smartperformance.auth.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class TemporaryPasswordController {
    private final AuthService authService;

    public TemporaryPasswordController(AuthService authService) {
        this.authService = authService;
    }

    /** Only a short-lived ROLE_PASSWORD_CHANGE token can call this endpoint. */
    @PostMapping("/change-temporary-password")
    public ResponseEntity<Map<String, String>> changePassword(
            Authentication authentication,
            @Valid @RequestBody ChangeTemporaryPasswordRequest request) {
        String message = authService.changeTemporaryPassword(authentication.getName(), request);
        return ResponseEntity.ok(Map.of("message", message));
    }
}
