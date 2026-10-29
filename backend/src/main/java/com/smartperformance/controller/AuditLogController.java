
package com.smartperformance.controller;

import com.smartperformance.dto.AuditLogResponse;
import com.smartperformance.entity.AuditLog;
import com.smartperformance.repository.AuditLogRepository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/audit-logs")
@PreAuthorize("hasRole('ADMIN')")
public class AuditLogController {

    private final AuditLogRepository auditLogRepository;

    public AuditLogController(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    // GET /api/audit-logs?page=0&size=20
    @GetMapping
    public Page<AuditLogResponse> getAuditLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        if (page < 0) {
            throw new IllegalArgumentException(
                    "Page number cannot be negative.");
        }

        if (size < 1) {
            throw new IllegalArgumentException(
                    "Page size must be at least 1.");
        }

        // Prevent excessively large responses.
        size = Math.min(size, 100);

        long startRow = (long) page * size;
        long endRow = startRow + size;

        // Fetch the requested records using Oracle 10g pagination.
        List<AuditLog> logs =
                auditLogRepository.findAuditLogsForOracle10g(
                        startRow,
                        endRow
                );

        // Convert entities into response DTOs.
        List<AuditLogResponse> responses = logs.stream()
                .map(this::toResponse)
                .toList();

        // Get the total number of audit records.
        long totalElements = auditLogRepository.count();

        // Return the same Page response structure expected by React.
        return new PageImpl<>(
                responses,
                PageRequest.of(page, size),
                totalElements
        );
    }

    private AuditLogResponse toResponse(AuditLog log) {

        return new AuditLogResponse(
                log.getLogId(),
                log.getActorUserId(),
                log.getActorName(),
                log.getActorEmail(),
                log.getActorRole(),
                log.getAction(),
                log.getEntityType(),
                log.getEntityId(),
                log.getDescription(),
                log.getOldValue(),
                log.getNewValue(),
                log.getIpAddress(),
                log.getRequestMethod(),
                log.getRequestPath(),
                log.getCreatedAt()
        );
    }
}
