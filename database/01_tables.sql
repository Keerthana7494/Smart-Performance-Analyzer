-- Smart Performance Analyzer
-- Oracle 10g compatible schema.
-- Run as the application schema user.

//Student Table Created

CREATE TABLE student (
    student_id NUMBER CONSTRAINT pk_student PRIMARY KEY,
    student_name VARCHAR2(100) NOT NULL,
    email VARCHAR2(150) CONSTRAINT uq_student_email UNIQUE NOT NULL,
    course VARCHAR2(100) NOT NULL,
    active NUMBER(1) DEFAULT 1 NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT chk_student_active CHECK (active IN (0,1))
);

//Student_performance Table Created

CREATE TABLE student_performance (
    performance_id NUMBER,
    student_id NUMBER NOT NULL,
    attendance NUMBER(5,2) NOT NULL,
    assignment_score NUMBER(5,2) NOT NULL,
    test_score NUMBER(5,2) NOT NULL,
    project_score NUMBER(5,2) NOT NULL,
    overall_score NUMBER(5,2),
    performance_level VARCHAR2(30),
    risk_status VARCHAR2(20),
    ai_recommendation CLOB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT pk_student_performance PRIMARY KEY (performance_id),
    CONSTRAINT fk_performance_student FOREIGN KEY (student_id)
        REFERENCES student(student_id),

    CONSTRAINT chk_attendance CHECK (attendance BETWEEN 0 AND 100),
    CONSTRAINT chk_assignment_score CHECK (assignment_score BETWEEN 0 AND 100),
    CONSTRAINT chk_test_score CHECK (test_score BETWEEN 0 AND 100),
    CONSTRAINT chk_project_score CHECK (project_score BETWEEN 0 AND 100),
    CONSTRAINT chk_overall_score CHECK (
        overall_score IS NULL OR overall_score BETWEEN 0 AND 100
    ),
    CONSTRAINT chk_performance_level CHECK (
        performance_level IS NULL OR performance_level IN
        ('EXCELLENT','GOOD','AVERAGE','POOR')
    ),
    CONSTRAINT chk_risk_status CHECK (
        risk_status IS NULL OR risk_status IN ('LOW','MEDIUM','HIGH')
    )
);


//Count Total records
//Calculate average performance_score

SELECT
    COUNT(*) AS total_records,
    AVG(overall_score) AS average_score
FROM student_performance;

//Display columns from Student_performance

SELECT
    performance_id,
    student_id,
    attendance,
    assignment_score,
    test_score,
    project_score,
    overall_score,
    performance_level,
    risk_status
FROM student_performance
ORDER BY performance_id;