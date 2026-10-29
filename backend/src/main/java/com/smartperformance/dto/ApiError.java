package com.smartperformance.dto;

import java.time.LocalDateTime;
import java.util.Map;

public class ApiError {
    private LocalDateTime timestamp = LocalDateTime.now();
    private int status;
    private String message;
    private Map<String, String> validationErrors;

    public ApiError(int status, String message) {
        this.status = status;
        this.message = message;
    }

    public LocalDateTime getTimestamp() { return timestamp; }
    public int getStatus() { return status; }
    public String getMessage() { return message; }
    public Map<String, String> getValidationErrors() { return validationErrors; }
    public void setValidationErrors(Map<String, String> validationErrors) { this.validationErrors = validationErrors; }
}
