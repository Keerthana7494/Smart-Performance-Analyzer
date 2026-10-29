
package com.smartperformance.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AuditLogResponse {

    private Long logId;

    private Long actorUserId;

    private String actorName;

    private String actorEmail;

    private String actorRole;

    private String action;

    private String entityType;

    private Long entityId;

    private String description;

    private String oldValue;

    private String newValue;

    private String ipAddress;

    private String requestMethod;

    private String requestPath;

    private LocalDateTime createdAt;
}
