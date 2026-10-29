
package com.smartperformance.service;

import com.smartperformance.auth.entity.User;
import com.smartperformance.auth.repository.UserRepository;
import com.smartperformance.entity.AuditLog;
import com.smartperformance.repository.AuditLogRepository;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Service
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    public AuditLogService(
            AuditLogRepository auditLogRepository,
            UserRepository userRepository) {
        this.auditLogRepository = auditLogRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public void record(
            String action,
            String entityType,
            Long entityId,
            String description,
            String oldValue,
            String newValue) {

        AuditLog log = new AuditLog();

        // Identify the authenticated user from Spring Security.
        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication != null
                && authentication.isAuthenticated()
                && authentication.getName() != null
                && !"anonymousUser".equals(authentication.getName())) {

            String email = authentication.getName();

            User user = userRepository.findByEmail(email)
                    .orElseThrow(() ->
                            new IllegalStateException(
                                    "Authenticated user was not found in the database."));

            log.setActorUserId(user.getUserId());
            log.setActorName(user.getFullName());
            log.setActorEmail(user.getEmail());
            log.setActorRole(user.getRole().name());

        } else {
            // Unauthenticated events must not be attributed to a user.
            log.setActorName("SYSTEM");
            log.setActorRole("SYSTEM");
        }

        // Record the action and affected entity.
        log.setAction(action);
        log.setEntityType(entityType);
        log.setEntityId(entityId);
        log.setDescription(description);

        // Store only relevant, non-sensitive change details.
        log.setOldValue(oldValue);
        log.setNewValue(newValue);

        // Capture request metadata when an HTTP request is available.
        ServletRequestAttributes attributes =
                (ServletRequestAttributes)
                        RequestContextHolder.getRequestAttributes();

        if (attributes != null) {
            HttpServletRequest request = attributes.getRequest();

            log.setRequestMethod(request.getMethod());
            log.setRequestPath(request.getRequestURI());

            // Avoid trusting arbitrary forwarded-IP headers.
            log.setIpAddress(request.getRemoteAddr());
        }

        auditLogRepository.save(log);
    }
}
