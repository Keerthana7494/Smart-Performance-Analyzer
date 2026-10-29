-- Basic checks
SELECT * FROM student ORDER BY student_id;
SELECT * FROM student_performance ORDER BY performance_id;
SELECT * FROM vw_student_performance ORDER BY performance_id;

-- Relationship check
SELECT s.student_id, s.student_name, s.course,
       p.performance_id, p.overall_score,
       p.performance_level, p.risk_status
FROM student s
JOIN student_performance p ON p.student_id = s.student_id
ORDER BY p.performance_id;

-- Dashboard checks
SELECT COUNT(*) AS total_students FROM student WHERE active = 1;

SELECT ROUND(AVG(overall_score), 2) AS average_score
FROM student_performance;

SELECT performance_level, COUNT(*) AS total
FROM student_performance
GROUP BY performance_level
ORDER BY performance_level;

SELECT risk_status, COUNT(*) AS total
FROM student_performance
GROUP BY risk_status
ORDER BY risk_status;
