package com.smartperformance.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ChangeTemporaryPasswordRequest(
        @NotBlank(message = "New password is required")
        @Size(min = 12, max = 72, message = "Password must contain 12 to 72 characters")
        String newPassword,

        @NotBlank(message = "Confirm password is required")
        String confirmPassword
) {}
