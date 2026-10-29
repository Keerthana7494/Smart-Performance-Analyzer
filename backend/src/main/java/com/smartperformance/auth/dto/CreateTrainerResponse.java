package com.smartperformance.auth.dto;

/** The temporary password is returned once to the admin and is never stored in plaintext. */
public record CreateTrainerResponse(
        String message,
        Long userId,
        String fullName,
        String email,
        String role,
        String temporaryPassword,
        String expiresAt
) {}
