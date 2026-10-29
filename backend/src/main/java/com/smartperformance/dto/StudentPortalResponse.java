package com.smartperformance.dto;

import java.util.List;

public record StudentPortalResponse(
    Long studentId,
    String studentName,
    String course,
    List<PerformanceResponse> records
) {}
