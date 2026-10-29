package com.smartperformance.auth.dto;

import jakarta.validation.constraints.*;


public record LoginRequest(

        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email")
        String email,

        @NotBlank(message = "Password is required")
        String password
)

{
    
}
