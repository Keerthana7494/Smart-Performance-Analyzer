package com.smartperformance.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SignupRequest(

        @NotBlank(message = "Full name is required")
        @Size(min = 3, max = 100,
                message = "Full name must be between 3 and 100 characters")
        String fullName,

        @NotBlank(message = "Email address is required")
        @Email(message = "Enter a valid email address")
        @Size(max = 150,
                message = "Email address is too long")
        String email,

        @NotBlank(message = "Password is required")
        @Size(min = 8, max = 72,
                message = "Password must contain 8 to 72 characters")
        String password,

        @NotBlank(message = "Please confirm your password")
        String confirmPassword

) {}