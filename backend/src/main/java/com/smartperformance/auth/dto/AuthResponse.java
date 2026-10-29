package com.smartperformance.auth.dto;

import com.smartperformance.auth.entity.Role;

public record AuthResponse(
        String message,
        String token,
        Long userId,
        String fullName,
        String email,
        Role role,
        boolean mustChangePassword
) {}
