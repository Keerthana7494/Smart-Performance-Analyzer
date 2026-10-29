//Sequence Created

CREATE SEQUENCE student_seq
START WITH 1
INCREMENT BY 1
NOCACHE
NOCYCLE;

CREATE SEQUENCE perf_seq
START WITH 1
INCREMENT BY 1
NOCACHE
NOCYCLE;

//Trigger Created

CREATE OR REPLACE TRIGGER trg_student_id
BEFORE INSERT ON student
FOR EACH ROW
BEGIN
    IF :NEW.student_id IS NULL THEN
        SELECT student_seq.NEXTVAL INTO :NEW.student_id FROM dual;
    END IF;
END;
/

CREATE OR REPLACE TRIGGER trg_performance_id
BEFORE INSERT ON student_performance
FOR EACH ROW
BEGIN
    IF :NEW.performance_id IS NULL THEN
        SELECT perf_seq.NEXTVAL INTO :NEW.performance_id FROM dual;
    END IF;
END;
/

//Index Created

CREATE INDEX idx_student_name
    ON student(student_name);

CREATE INDEX idx_performance_student
    ON student_performance(student_id);

CREATE INDEX idx_performance_risk
    ON student_performance(risk_status);

CREATE INDEX idx_performance_level
    ON student_performance(performance_level);
