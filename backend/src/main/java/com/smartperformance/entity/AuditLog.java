
package com.smartperformance.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "AUDIT_LOG")
@Getter
@Setter
@NoArgsConstructor
public class AuditLog {

    @Id
    @GeneratedValue(
        strategy = GenerationType.SEQUENCE,
        generator = "audit_log_seq_generator"
    )
    @SequenceGenerator(
        name = "audit_log_seq_generator",
        sequenceName = "AUDIT_LOG_SEQ",
        allocationSize = 1
    )
    @Column(name = "LOG_ID")
    private Long logId;

    @Column(name = "ACTOR_USER_ID")
    private Long actorUserId;

    @Column(name = "ACTOR_NAME", length = 100)
    private String actorName;

    @Column(name = "ACTOR_EMAIL", length = 150)
    private String actorEmail;

    @Column(name = "ACTOR_ROLE", length = 30)
    private String actorRole;

    @Column(name = "ACTION", nullable = false, length = 50)
    private String action;

    @Column(name = "ENTITY_TYPE", nullable = false, length = 50)
    private String entityType;

    @Column(name = "ENTITY_ID")
    private Long entityId;

    @Column(name = "DESCRIPTION", length = 1000)
    private String description;

    @Lob
    @Column(name = "OLD_VALUE")
    private String oldValue;

    @Lob
    @Column(name = "NEW_VALUE")
    private String newValue;

    @Column(name = "IP_ADDRESS", length = 64)
    private String ipAddress;

    @Column(name = "REQUEST_METHOD", length = 10)
    private String requestMethod;

    @Column(name = "REQUEST_PATH", length = 500)
    private String requestPath;

    @Column(name = "CREATED_AT", insertable = false, updatable = false)
    private LocalDateTime createdAt;
}
