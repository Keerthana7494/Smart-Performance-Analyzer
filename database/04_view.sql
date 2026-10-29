CREATE OR REPLACE VIEW vw_student_performance AS
SELECT
    p.performance_id,
    s.student_id,
    s.student_name,
    s.email,
    s.course,
    p.attendance,
    p.assignment_score,
    p.test_score,
    p.project_score,
    p.overall_score,
    p.performance_level,
    p.risk_status,
    p.ai_recommendation,
    p.created_at,
    p.updated_at
FROM student s
JOIN student_performance p
    ON s.student_id = p.student_id
WHERE s.active = 1;
