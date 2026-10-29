
package com.smartperformance.repository;

import com.smartperformance.entity.AuditLog;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AuditLogRepository
        extends JpaRepository<AuditLog, Long> {

    @Query(value =
            "SELECT log_id, action, actor_email, actor_name, actor_role, " +
            "actor_user_id, created_at, description, entity_id, entity_type, " +
            "ip_address, new_value, old_value, request_method, request_path " +
            "FROM ( " +
            "    SELECT audit_rows.*, ROWNUM AS rn " +
            "    FROM ( " +
            "        SELECT * FROM AUDIT_LOG " +
            "        ORDER BY created_at DESC, log_id DESC " +
            "    ) audit_rows " +
            "    WHERE ROWNUM <= :endRow " +
            ") " +
            "WHERE rn > :startRow",
            nativeQuery = true)
    List<AuditLog> findAuditLogsForOracle10g(
            @Param("startRow") long startRow,
            @Param("endRow") long endRow
    );
}
