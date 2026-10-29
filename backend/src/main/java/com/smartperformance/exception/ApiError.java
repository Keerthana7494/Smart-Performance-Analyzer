package com.smartperformance.exception;

import java.time.LocalDateTime;
//import java.util.LinkedHashMap;
import java.util.Map;

public class ApiError {

    private int status;
    private String message;
    private LocalDateTime timestamp;
    private Map<String, String> validationErrors;

    public ApiError() {
        this.timestamp = LocalDateTime.now();
    }

    public ApiError(int status, String message) {
        this.status = status;
        this.message = message;
        this.timestamp = LocalDateTime.now();
    }

    public int getStatus() {
        return status;
    }

    public void setStatus(int status) {
        this.status = status;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public Map<String, String> getValidationErrors() {
        return validationErrors;
    }

    public void setValidationErrors(Map<String, String> validationErrors) {
        this.validationErrors = validationErrors;
    }
}