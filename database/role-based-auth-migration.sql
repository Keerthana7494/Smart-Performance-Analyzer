-- Run this script against the Oracle schema used by the application.
-- Back up the USERS table first. Review existing accounts before assigning roles.

ALTER TABLE USERS ADD ROLE VARCHAR2(20);
ALTER TABLE USERS ADD MUST_CHANGE_PASSWORD NUMBER(1) DEFAULT 0 NOT NULL;
ALTER TABLE USERS ADD PASSWORD_EXPIRES_AT TIMESTAMP NULL;

-- Existing accounts are conservatively set to STUDENT. Promote trusted admin accounts below.
UPDATE USERS SET ROLE = 'STUDENT' WHERE ROLE IS NULL;
ALTER TABLE USERS MODIFY ROLE NOT NULL;

ALTER TABLE USERS ADD CONSTRAINT CK_USERS_ROLE
    CHECK (ROLE IN ('ADMIN', 'TRAINER', 'STUDENT'));
ALTER TABLE USERS ADD CONSTRAINT CK_USERS_MUST_CHANGE
    CHECK (MUST_CHANGE_PASSWORD IN (0, 1));

-- IMPORTANT: replace this with the email of your own already-registered account.
-- Run only after confirming that the email belongs to you and the account is trusted.
-- UPDATE USERS SET ROLE = 'ADMIN' WHERE LOWER(EMAIL) = LOWER('your-admin-email@example.com');
-- COMMIT;
