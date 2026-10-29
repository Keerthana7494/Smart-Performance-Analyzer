//Procedure created to calculate performance

CREATE OR REPLACE PROCEDURE calculate_performance
(
    p_attendance        IN NUMBER,
    p_assignment        IN NUMBER,
    p_test              IN NUMBER,
    p_project           IN NUMBER,
    p_overall_score     OUT NUMBER,
    p_performance_level OUT VARCHAR2,
    p_risk_status       OUT VARCHAR2
)
AS
BEGIN
    p_overall_score :=
          (p_attendance * 0.10)
        + (p_assignment * 0.20)
        + (p_test * 0.30)
        + (p_project * 0.40);

    p_overall_score := ROUND(p_overall_score, 2);

    IF p_overall_score >= 90 THEN
        p_performance_level := 'EXCELLENT';
    ELSIF p_overall_score >= 75 THEN
        p_performance_level := 'GOOD';
    ELSIF p_overall_score >= 60 THEN
        p_performance_level := 'AVERAGE';
    ELSE
        p_performance_level := 'POOR';
    END IF;

    IF p_overall_score >= 75 THEN
        p_risk_status := 'LOW';
    ELSIF p_overall_score >= 60 THEN
        p_risk_status := 'MEDIUM';
    ELSE
        p_risk_status := 'HIGH';
    END IF;
END;
/
