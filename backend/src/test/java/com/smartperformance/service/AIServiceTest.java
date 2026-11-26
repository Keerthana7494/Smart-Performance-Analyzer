package com.smartperformance.service;

import com.smartperformance.entity.StudentPerformance;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;

class AIServiceTest {

    private StudentPerformance lowScorer() {
        StudentPerformance p = new StudentPerformance();
        p.setAttendance(40.0);
        p.setAssignmentScore(50.0);
        p.setTestScore(45.0);
        p.setProjectScore(55.0);
        p.setOverallScore(49.0);
        p.setPerformanceLevel("POOR");
        p.setRiskStatus("HIGH");
        return p;
    }

    @Test
    void aiDisabled_returnsRuleBasedRecommendation() {
        AIService ai = new AIService();
        ReflectionTestUtils.setField(ai, "enabled", false);
        ReflectionTestUtils.setField(ai, "token", "");

        assertThat(ai.generateRecommendation(lowScorer())).isNotBlank();
    }

    @Test
    void aiEnabledButTokenMissing_stillFallsBack() {
        AIService ai = new AIService();
        ReflectionTestUtils.setField(ai, "enabled", true);
        ReflectionTestUtils.setField(ai, "token", "   ");

        assertThat(ai.generateRecommendation(lowScorer())).isNotBlank();
    }

    @Test
    void nullScores_doNotCrashFallback() {
        AIService ai = new AIService();
        ReflectionTestUtils.setField(ai, "enabled", false);

        assertThat(ai.generateRecommendation(new StudentPerformance())).isNotBlank();
    }
}
