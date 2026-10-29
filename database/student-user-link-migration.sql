
-- Link each academic student record to one login account.
ALTER TABLE STUDENT ADD USER_ID NUMBER;

-- A login account can be linked to at most one student record.
ALTER TABLE STUDENT ADD CONSTRAINT UK_STUDENT_USER_ID
    UNIQUE (USER_ID);

-- Ensure linked users exist.
ALTER TABLE STUDENT ADD CONSTRAINT FK_STUDENT_USER
    FOREIGN KEY (USER_ID)
    REFERENCES USERS (USER_ID);

-- After verifying and linking all existing student accounts,
-- optionally make USER_ID mandatory:
-- ALTER TABLE STUDENT MODIFY USER_ID NOT NULL;
