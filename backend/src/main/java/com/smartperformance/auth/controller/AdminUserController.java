package com.smartperformance.auth.controller;

import com.smartperformance.auth.dto.CreateTrainerRequest;
import com.smartperformance.auth.dto.CreateTrainerResponse;
import com.smartperformance.auth.dto.TrainerResponse;
import com.smartperformance.auth.service.AuthService;
import jakarta.validation.Valid;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("/api/admin/trainers")
public class AdminUserController {

    private final AuthService authService;

    public AdminUserController(AuthService authService) {
        this.authService = authService;
    }

    /** Only ROLE_ADMIN can reach this endpoint. */
    @PostMapping
    public ResponseEntity<CreateTrainerResponse> createTrainer(
            @Valid @RequestBody CreateTrainerRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(authService.createTrainer(request));
    }

    @GetMapping
    public ResponseEntity<List<TrainerResponse>> getTrainers() {
        return ResponseEntity.ok(authService.getTrainers());
    }

    /** Set active=1 to activate or active=0 to deactivate a trainer. */
    @PatchMapping("/{id}/status")
    public ResponseEntity<TrainerResponse> changeTrainerStatus(
            @PathVariable Long id,
            @RequestParam Integer active) {
        return ResponseEntity.ok(
                authService.changeTrainerStatus(id, active));
    }
}

