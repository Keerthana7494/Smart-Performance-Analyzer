package com.smartperformance.auth.dto;

public record TrainerResponse(
        Long userId,
        String fullName,
        String email,
        Integer isActive
) {}
