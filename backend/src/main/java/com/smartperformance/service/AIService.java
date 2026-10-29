package com.smartperformance.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartperformance.entity.StudentPerformance;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class AIService {

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${huggingface.api-url}")
    private String apiUrl;

    @Value("${huggingface.model}")
    private String model;

    @Value("${huggingface.token:}")
    private String token;

    @Value("${huggingface.enabled:false}")
    private boolean enabled;

    public String generateRecommendation(StudentPerformance p) {

        // If AI is disabled or token is unavailable,
        // generate a complete rule-based recommendation.
        if (!enabled || token == null || token.trim().isEmpty()) {
            return buildFallbackRecommendation(p);
        }

        try {

            String prompt = buildPrompt(p);

            Map<String, Object> body = new LinkedHashMap<>();

            body.put("model", model);

            body.put("messages", Arrays.asList(

                    Map.of(
                            "role", "system",
                            "content",
                            "You are an academic performance advisor. " +
                            "Analyze only the information provided. " +
                            "Give complete, practical and supportive recommendations. " +
                            "Do not invent facts."
                    ),

                    Map.of(
                            "role", "user",
                            "content", prompt
                    )
            ));

            body.put("temperature", 0.3);

          
            body.put("max_tokens", 500);

            HttpHeaders headers = new HttpHeaders();

            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(token);

            HttpEntity<Map<String, Object>> request =
                    new HttpEntity<>(body, headers);

            ResponseEntity<String> response =
                    restTemplate.exchange(
                            apiUrl,
                            HttpMethod.POST,
                            request,
                            String.class
                    );

            JsonNode root =
                    objectMapper.readTree(response.getBody());

            JsonNode content =
                    root.path("choices")
                        .path(0)
                        .path("message")
                        .path("content");

            if (content.isTextual()
                    && !content.asText().trim().isEmpty()) {

                String recommendation = content.asText().trim();

                // Basic validation
                if (isCompleteRecommendation(recommendation)) {
                    return recommendation;
                }
            }

        } catch (Exception ex) {

            System.err.println(
                    "Hugging Face request failed: "
                            + ex.getMessage()
            );
        }

        // If AI fails or gives incomplete output,
        // always return a complete fallback.
        return buildFallbackRecommendation(p);
    }


    // =========================================================
    // BUILD AI PROMPT
    // =========================================================

    private String buildPrompt(StudentPerformance p) {

        return String.format(

                """
                Analyze the following student's academic performance.

                Student Name: %s
                Course: %s

                Attendance: %.2f%%
                Assignment Score: %.2f%%
                Test Score: %.2f%%
                Project Score: %.2f%%
                Overall Score: %.2f%%

                Performance Level: %s
                Risk Status: %s

                Generate a COMPLETE student performance recommendation.

                Use exactly these sections:

                1. Performance Summary
                2. Strengths
                3. Areas to Improve
                4. Risk Analysis
                5. Recommended Actions
                6. Weekly Study Plan
                7. Encouragement

                Requirements:

                - Mention the strongest academic area.
                - Mention the weakest academic area.
                - Consider attendance separately.
                - Consider assignments separately.
                - Consider tests separately.
                - Consider projects separately.
                - Explain the risk status.
                - Give at least 3 specific actions.
                - Give a simple weekly study plan.
                - Recommendations must be based only on the supplied scores.
                - Do not invent subjects, personal information or achievements.
                - Use simple language that a student can understand.
                - Keep the response between 180 and 300 words.
                """,

                p.getStudent().getStudentName(),
                p.getStudent().getCourse(),

                safe(p.getAttendance()),
                safe(p.getAssignmentScore()),
                safe(p.getTestScore()),
                safe(p.getProjectScore()),
                safe(p.getOverallScore()),

                safeText(p.getPerformanceLevel()),
                safeText(p.getRiskStatus())
        );
    }


    // =========================================================
    // CHECK WHETHER AI RESPONSE IS COMPLETE
    // =========================================================

    private boolean isCompleteRecommendation(String recommendation) {

        String text = recommendation.toLowerCase();

        return text.contains("performance summary")
                && text.contains("strength")
                && text.contains("areas to improve")
                && text.contains("risk")
                && text.contains("recommended actions")
                && text.contains("weekly study plan")
                && text.contains("encouragement");
    }


    // =========================================================
    // FALLBACK RECOMMENDATION
    // =========================================================

    private String buildFallbackRecommendation(StudentPerformance p) {

        double attendance = safe(p.getAttendance());
        double assignment = safe(p.getAssignmentScore());
        double test = safe(p.getTestScore());
        double project = safe(p.getProjectScore());
        double overall = safe(p.getOverallScore());

        String level = safeText(p.getPerformanceLevel());
        String risk = safeText(p.getRiskStatus());

        // -----------------------------------------------------
        // Find strongest area
        // -----------------------------------------------------

        Map<String, Double> scores = new LinkedHashMap<>();

        scores.put("Attendance", attendance);
        scores.put("Assignment", assignment);
        scores.put("Test", test);
        scores.put("Project", project);

        String strongest = Collections.max(
                scores.entrySet(),
                Map.Entry.comparingByValue()
        ).getKey();

        // -----------------------------------------------------
        // Find weakest area
        // -----------------------------------------------------

        String weakest = Collections.min(
                scores.entrySet(),
                Map.Entry.comparingByValue()
        ).getKey();

        // -----------------------------------------------------
        // Build recommendation
        // -----------------------------------------------------

        StringBuilder recommendation = new StringBuilder();

        recommendation.append("PERFORMANCE SUMMARY\n");
        recommendation.append("--------------------\n");

        recommendation.append(
                String.format(
                        "Overall performance is %.2f%% and the current performance level is %s. ",
                        overall,
                        level
                )
        );

        recommendation.append(
                "The student's strongest area is "
                        + strongest
                        + ", while "
                        + weakest
                        + " requires the most attention.\n\n"
        );


        // -----------------------------------------------------
        // Strengths
        // -----------------------------------------------------

        recommendation.append("STRENGTHS\n");
        recommendation.append("---------\n");

        recommendation.append(
                strongest
                        + " is currently the strongest area with a score of "
                        + String.format("%.2f%%", scores.get(strongest))
                        + ". Continue maintaining this performance.\n\n"
        );


        // -----------------------------------------------------
        // Areas to improve
        // -----------------------------------------------------

        recommendation.append("AREAS TO IMPROVE\n");
        recommendation.append("-----------------\n");

        recommendation.append(
                weakest
                        + " is currently the weakest area with a score of "
                        + String.format("%.2f%%", scores.get(weakest))
                        + ". Focus additional practice time on this area.\n"
        );

        if (attendance < 75) {

            recommendation.append(
                    "Attendance is below 75%. Attend classes regularly "
                            + "and avoid unnecessary absences.\n"
            );
        }

        if (assignment < 60) {

            recommendation.append(
                    "Assignment performance needs improvement. "
                            + "Complete assignments regularly and review mistakes.\n"
            );
        }

        if (test < 60) {

            recommendation.append(
                    "Test performance needs improvement. "
                            + "Revise concepts regularly and practice mock tests.\n"
            );
        }

        if (project < 60) {

            recommendation.append(
                    "Project performance needs improvement. "
                            + "Spend more time on practical coding and project work.\n"
            );
        }

        recommendation.append("\n");


        // -----------------------------------------------------
        // Risk analysis
        // -----------------------------------------------------

        recommendation.append("RISK ANALYSIS\n");
        recommendation.append("-------------\n");

        recommendation.append(
                "Current risk status: "
                        + risk
                        + ". "
        );

        if (risk.equalsIgnoreCase("High")) {

            recommendation.append(
                    "Immediate improvement is recommended. "
                            + "Focus on the weakest areas and maintain regular attendance."
            );

        } else if (risk.equalsIgnoreCase("Medium")) {

            recommendation.append(
                    "Regular monitoring and consistent practice are recommended "
                            + "to prevent further performance decline."
            );

        } else {

            recommendation.append(
                    "Current performance does not indicate a major academic risk. "
                            + "Continue the current learning routine."
            );
        }

        recommendation.append("\n\n");


        // -----------------------------------------------------
        // Recommended actions
        // -----------------------------------------------------

        recommendation.append("RECOMMENDED ACTIONS\n");
        recommendation.append("-------------------\n");

        recommendation.append(
                "1. Spend additional practice time on "
                        + weakest
                        + ".\n"
        );

        recommendation.append(
                "2. Review mistakes from assignments and tests "
                        + "and revise the related concepts.\n"
        );

        recommendation.append(
                "3. Maintain regular attendance and participate "
                        + "actively in practical sessions.\n"
        );

        recommendation.append("\n");


        // -----------------------------------------------------
        // Weekly study plan
        // -----------------------------------------------------

        recommendation.append("WEEKLY STUDY PLAN\n");
        recommendation.append("-----------------\n");

        recommendation.append(
                "Monday-Friday: Spend at least 1 hour reviewing concepts "
                        + "and practicing problems.\n"
        );

        recommendation.append(
                "Saturday: Complete one mock test or practical exercise.\n"
        );

        recommendation.append(
                "Sunday: Review mistakes and prepare the next week's study plan.\n\n"
        );


        // -----------------------------------------------------
        // Encouragement
        // -----------------------------------------------------

        recommendation.append("ENCOURAGEMENT\n");
        recommendation.append("-------------\n");

        if (overall >= 80) {

            recommendation.append(
                    "Your overall performance is strong. "
                            + "Continue improving your weaker areas "
                            + "while maintaining your current strengths."
            );

        } else if (overall >= 60) {

            recommendation.append(
                    "Your performance shows good potential. "
                            + "Consistent practice and focused improvement "
                            + "can help you achieve a higher performance level."
            );

        } else {

            recommendation.append(
                    "Improvement is possible with consistent effort. "
                            + "Start with the weakest area, follow the weekly plan, "
                            + "and gradually build stronger study habits."
            );
        }

        return recommendation.toString();
    }


    // =========================================================
    // SAFE NUMBER
    // =========================================================

    private double safe(Double value) {

        return value == null ? 0.0 : value;
    }


    // =========================================================
    // SAFE TEXT
    // =========================================================

    private String safeText(String value) {

        return value == null || value.trim().isEmpty()
                ? "Not specified"
                : value;
    }
}