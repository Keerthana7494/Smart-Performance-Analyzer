
package com.smartperformance.report;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import org.apache.poi.ss.usermodel.BorderStyle;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;

import com.smartperformance.dto.DashboardResponse;
import com.smartperformance.entity.Student;
import com.smartperformance.entity.StudentPerformance;
import com.smartperformance.exception.ResourceNotFoundException;
import com.smartperformance.repository.PerformanceRepository;
import com.smartperformance.repository.StudentRepository;
import com.smartperformance.service.PerformanceService;

@Service
public class ReportService {

    private static final DateTimeFormatter REPORT_DATE =
            DateTimeFormatter.ofPattern(
                    "dd MMM yyyy, hh:mm a",
                    Locale.ENGLISH
            );

    private final PerformanceRepository performanceRepository;
    private final StudentRepository studentRepository;
    private final PerformanceService performanceService;

    public ReportService(
            PerformanceRepository performanceRepository,
            StudentRepository studentRepository,
            PerformanceService performanceService) {

        this.performanceRepository = performanceRepository;
        this.studentRepository = studentRepository;
        this.performanceService = performanceService;
    }

    // =========================================================
    // 1. INDIVIDUAL STUDENT PERFORMANCE PDF
    // =========================================================

    public byte[] studentPerformancePdf(Long studentId) {

        StudentPerformance p =
                performanceRepository.findLatestByStudentId(studentId)
                        .filter(record ->
                                record.getStudent().getActive() != null
                                && record.getStudent().getActive() == 1
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "No active student performance record found for student: "
                                                + studentId
                                )
                        );

        try (ByteArrayOutputStream output =
                     new ByteArrayOutputStream()) {

            Document document = new Document(
                    PageSize.A4,
                    42,
                    42,
                    42,
                    42
            );

            PdfWriter.getInstance(document, output);
            document.open();

            Font titleFont = new Font(
                    Font.HELVETICA,
                    19,
                    Font.BOLD,
                    new Color(31, 55, 90)
            );

            Font subtitleFont = new Font(
                    Font.HELVETICA,
                    10,
                    Font.NORMAL,
                    Color.GRAY
            );

            Font sectionFont = new Font(
                    Font.HELVETICA,
                    12,
                    Font.BOLD,
                    new Color(31, 55, 90)
            );

            Font labelFont = new Font(
                    Font.HELVETICA,
                    10,
                    Font.BOLD
            );

            Font valueFont = new Font(
                    Font.HELVETICA,
                    10,
                    Font.NORMAL
            );

            // Report title
            Paragraph title = new Paragraph(
                    "STUDENT PERFORMANCE REPORT",
                    titleFont
            );

            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(5);
            document.add(title);

            // Application name
            Paragraph subtitle = new Paragraph(
                    "Smart Performance Analyzer",
                    subtitleFont
            );

            subtitle.setAlignment(Element.ALIGN_CENTER);
            subtitle.setSpacingAfter(8);
            document.add(subtitle);

            // Report generation date
            Paragraph generated = new Paragraph(
                    "Generated: "
                            + LocalDateTime.now().format(REPORT_DATE),
                    subtitleFont
            );

            generated.setAlignment(Element.ALIGN_RIGHT);
            generated.setSpacingAfter(18);
            document.add(generated);

            // -------------------------------------------------
            // Student information
            // -------------------------------------------------

            document.add(
                    new Paragraph("Student Information", sectionFont)
            );

            PdfPTable studentTable =
                    new PdfPTable(new float[]{1.0f, 2.4f});

            studentTable.setWidthPercentage(100);
            studentTable.setSpacingBefore(7);
            studentTable.setSpacingAfter(16);

            addPdfRow(
                    studentTable,
                    "Student ID",
                    String.valueOf(p.getStudent().getStudentId()),
                    labelFont,
                    valueFont
            );

            addPdfRow(
                    studentTable,
                    "Student Name",
                    safe(p.getStudent().getStudentName()),
                    labelFont,
                    valueFont
            );

            addPdfRow(
                    studentTable,
                    "Course",
                    safe(p.getStudent().getCourse()),
                    labelFont,
                    valueFont
            );

            addPdfRow(
                    studentTable,
                    "Email",
                    safe(p.getStudent().getEmail()),
                    labelFont,
                    valueFont
            );

            addPdfRow(
                    studentTable,
                    "Analysis Date",
                    p.getCreatedAt() == null
                            ? "N/A"
                            : p.getCreatedAt().format(REPORT_DATE),
                    labelFont,
                    valueFont
            );

            document.add(studentTable);

            // -------------------------------------------------
            // Performance metrics
            // -------------------------------------------------

            document.add(
                    new Paragraph("Performance Metrics", sectionFont)
            );

            PdfPTable metrics =
                    new PdfPTable(new float[]{2.0f, 1.0f});

            metrics.setWidthPercentage(100);
            metrics.setSpacingBefore(7);
            metrics.setSpacingAfter(14);

            addPdfHeader(metrics, "Metric");
            addPdfHeader(metrics, "Score");

            addMetric(metrics, "Attendance", p.getAttendance());
            addMetric(metrics, "Assignment", p.getAssignmentScore());
            addMetric(metrics, "Test", p.getTestScore());
            addMetric(metrics, "Project", p.getProjectScore());
            addMetric(metrics, "Overall Score", p.getOverallScore());

            document.add(metrics);

            // -------------------------------------------------
            // Performance outcome
            // -------------------------------------------------

            PdfPTable outcome =
                    new PdfPTable(new float[]{1.0f, 1.0f});

            outcome.setWidthPercentage(100);
            outcome.setSpacingAfter(10);

            addPdfRow(
                    outcome,
                    "Performance Level",
                    safe(p.getPerformanceLevel()),
                    labelFont,
                    valueFont
            );

            addPdfRow(
                    outcome,
                    "Risk Status",
                    safe(p.getRiskStatus()),
                    labelFont,
                    valueFont
            );

            document.add(outcome);

            // -------------------------------------------------
            // Learning recommendation
            // -------------------------------------------------

            Paragraph recommendationHeading =
                    new Paragraph(
                            "Learning Recommendation",
                            sectionFont
                    );

            recommendationHeading.setSpacingBefore(14);
            document.add(recommendationHeading);

            String recommendation = p.getAiRecommendation();

            if (recommendation == null
                    || recommendation.isBlank()) {

                recommendation =
                        "No recommendation is available for this performance record.";
            }

            Paragraph recommendationText =
                    new Paragraph(recommendation, valueFont);

            recommendationText.setSpacingBefore(6);
            recommendationText.setLeading(15);

            document.add(recommendationText);

            document.close();

            return output.toByteArray();

        } catch (DocumentException | IOException ex) {

            throw new IllegalStateException(
                    "Unable to generate student performance PDF.",
                    ex
            );
        }
    }

    // =========================================================
    // 2. DASHBOARD EXCEL REPORT
    // =========================================================

    public byte[] dashboardExcel() {

        DashboardResponse dashboard = performanceService.dashboard();
        List<StudentPerformance> latest =
                performanceRepository.findLatestPerformanceForActiveStudents();

        Map<String, Long> categories = new LinkedHashMap<>();
        categories.put("EXCELLENT", 0L);
        categories.put("GOOD", 0L);
        categories.put("AVERAGE", 0L);
        categories.put("POOR", 0L);

        Map<String, Long> risks = new LinkedHashMap<>();
        risks.put("LOW", 0L);
        risks.put("MEDIUM", 0L);
        risks.put("HIGH", 0L);

        for (StudentPerformance p : latest) {
            increment(categories, p.getPerformanceLevel());
            increment(risks, p.getRiskStatus());
        }

        long studentsWithScores = latest.stream()
                .filter(p -> p.getOverallScore() != null)
                .count();

        try (Workbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream output = new ByteArrayOutputStream()) {

            CellStyle titleStyle = titleStyle(workbook);
            CellStyle headerStyle = headerStyle(workbook);

            // Summary sheet: put the key dashboard metrics together so users
            // do not need to open other tabs to see the full dashboard summary.
            Sheet summary = workbook.createSheet("Summary");
            Row titleRow = summary.createRow(0);
            Cell titleCell = titleRow.createCell(0);
            titleCell.setCellValue("Smart Performance Analyzer - Dashboard Report");
            titleCell.setCellStyle(titleStyle);

            summary.createRow(1).createCell(0).setCellValue("Generated At");
            summary.getRow(1).createCell(1)
                    .setCellValue(LocalDateTime.now().format(REPORT_DATE));

            addTableHeader(summary, 3, new String[]{"Metric", "Student Count / Value", "Percentage"}, headerStyle);
            int row = 4;
            addDashboardMetric(summary, row++, "Total Active Students", dashboard.getTotalStudents(), dashboard.getTotalStudents());
            addDashboardMetric(summary, row++, "Students With Performance Records", latest.size(), dashboard.getTotalStudents());
            addDashboardMetric(summary, row++, "Students With Scores", studentsWithScores, dashboard.getTotalStudents());
            addDashboardMetric(summary, row++, "Average Score", dashboard.getAverageScore(), null);
            row++;
            summary.createRow(row).createCell(0).setCellValue("Performance Distribution");
            row++;
            addDashboardMetric(summary, row++, "Excellent", categories.get("EXCELLENT"), latest.size());
            addDashboardMetric(summary, row++, "Good", categories.get("GOOD"), latest.size());
            addDashboardMetric(summary, row++, "Average", categories.get("AVERAGE"), latest.size());
            addDashboardMetric(summary, row++, "Poor", categories.get("POOR"), latest.size());
            row++;
            summary.createRow(row).createCell(0).setCellValue("Risk Distribution");
            row++;
            addDashboardMetric(summary, row++, "Low Risk", risks.get("LOW"), latest.size());
            addDashboardMetric(summary, row++, "Medium Risk", risks.get("MEDIUM"), latest.size());
            addDashboardMetric(summary, row++, "High Risk", risks.get("HIGH"), latest.size());
            autoSize(summary, 3);

            // Dedicated performance distribution sheet, including percentages.
            Sheet categorySheet = workbook.createSheet("Performance Distribution");
            addTableHeader(categorySheet, 0,
                    new String[]{"Performance Category", "Student Count", "Percentage"}, headerStyle);
            addDistributionRow(categorySheet, 1, "Excellent", categories.get("EXCELLENT"), latest.size());
            addDistributionRow(categorySheet, 2, "Good", categories.get("GOOD"), latest.size());
            addDistributionRow(categorySheet, 3, "Average", categories.get("AVERAGE"), latest.size());
            addDistributionRow(categorySheet, 4, "Poor", categories.get("POOR"), latest.size());
            autoSize(categorySheet, 3);

            // Dedicated risk distribution sheet, including percentages.
            Sheet riskSheet = workbook.createSheet("Risk Distribution");
            addTableHeader(riskSheet, 0,
                    new String[]{"Risk Level", "Student Count", "Percentage"}, headerStyle);
            addDistributionRow(riskSheet, 1, "Low Risk", risks.get("LOW"), latest.size());
            addDistributionRow(riskSheet, 2, "Medium Risk", risks.get("MEDIUM"), latest.size());
            addDistributionRow(riskSheet, 3, "High Risk", risks.get("HIGH"), latest.size());
            autoSize(riskSheet, 3);

            // Student-by-student score comparison using each active student's latest record.
            Sheet comparison = workbook.createSheet("Student Score Comparison");
            String[] comparisonHeaders = {
                    "Student ID", "Student Name", "Course", "Attendance",
                    "Assignment Score", "Test Score", "Project Score", "Overall Score",
                    "Performance Category", "Risk Level", "Analysis Date"
            };
            addTableHeader(comparison, 0, comparisonHeaders, headerStyle);
            List<StudentPerformance> ranked = latest.stream()
                    .sorted((a, b) -> Double.compare(
                            b.getOverallScore() == null ? -1.0 : b.getOverallScore(),
                            a.getOverallScore() == null ? -1.0 : a.getOverallScore()))
                    .toList();
            int comparisonRow = 1;
            for (StudentPerformance p : ranked) {
                Row dataRow = comparison.createRow(comparisonRow++);
                set(dataRow, 0, p.getStudent().getStudentId());
                set(dataRow, 1, p.getStudent().getStudentName());
                set(dataRow, 2, p.getStudent().getCourse());
                set(dataRow, 3, p.getAttendance());
                set(dataRow, 4, p.getAssignmentScore());
                set(dataRow, 5, p.getTestScore());
                set(dataRow, 6, p.getProjectScore());
                set(dataRow, 7, p.getOverallScore());
                set(dataRow, 8, p.getPerformanceLevel());
                set(dataRow, 9, p.getRiskStatus());
                set(dataRow, 10, p.getCreatedAt() == null ? "N/A" : p.getCreatedAt().format(REPORT_DATE));
            }
            autoSize(comparison, comparisonHeaders.length);

            workbook.write(output);
            return output.toByteArray();

        } catch (IOException ex) {
            throw new IllegalStateException("Unable to generate dashboard Excel report.", ex);
        }
    }

    private void addDashboardMetric(Sheet sheet, int rowIndex, String label,
                                    Number value, Number denominator) {
        Row row = sheet.createRow(rowIndex);
        row.createCell(0).setCellValue(label);
        if (value != null) {
            row.createCell(1).setCellValue(value.doubleValue());
        }
        if (denominator != null && denominator.doubleValue() > 0 && value != null) {
            row.createCell(2).setCellValue(value.doubleValue() * 100.0 / denominator.doubleValue());
        } else if (denominator != null) {
            row.createCell(2).setCellValue(0.0);
        }
    }

    private void addDistributionRow(Sheet sheet, int rowIndex, String label,
                                    Number count, long total) {
        Row row = sheet.createRow(rowIndex);
        row.createCell(0).setCellValue(label);
        row.createCell(1).setCellValue(count == null ? 0 : count.doubleValue());
        row.createCell(2).setCellValue(total > 0 && count != null
                ? count.doubleValue() * 100.0 / total : 0.0);
    }

    // =========================================================
    // 3. PERFORMANCE EXCEL REPORT
    // =========================================================

    public byte[] performanceExcel() {

        List<StudentPerformance> records =
                performanceRepository.findActivePerformance();

        String[] headers = {
                "Performance ID",
                "Student ID",
                "Student Name",
                "Email",
                "Course",
                "Attendance",
                "Assignment Score",
                "Test Score",
                "Project Score",
                "Overall Score",
                "Performance Level",
                "Risk Status",
                "AI Recommendation",
                "Analysis Date"
        };

        try (
                Workbook workbook = new XSSFWorkbook();
                ByteArrayOutputStream output =
                        new ByteArrayOutputStream()
        ) {

            Sheet sheet =
                    workbook.createSheet("Performance Records");

            CellStyle headerStyle = headerStyle(workbook);

            addTableHeader(sheet, 0, headers, headerStyle);

            int rowNumber = 1;

            for (StudentPerformance p : records) {

                Row row = sheet.createRow(rowNumber++);

                set(row, 0, p.getPerformanceId());
                set(row, 1, p.getStudent().getStudentId());
                set(row, 2, p.getStudent().getStudentName());
                set(row, 3, p.getStudent().getEmail());
                set(row, 4, p.getStudent().getCourse());

                set(row, 5, p.getAttendance());
                set(row, 6, p.getAssignmentScore());
                set(row, 7, p.getTestScore());
                set(row, 8, p.getProjectScore());
                set(row, 9, p.getOverallScore());

                set(row, 10, p.getPerformanceLevel());
                set(row, 11, p.getRiskStatus());
                set(row, 12, p.getAiRecommendation());
                set(row, 13, p.getCreatedAt());
            }

            autoSize(sheet, headers.length);

            workbook.write(output);

            return output.toByteArray();

        } catch (IOException ex) {

            throw new IllegalStateException(
                    "Unable to generate performance Excel report.",
                    ex
            );
        }
    }

    // =========================================================
    // 4. STUDENT DETAILS EXCEL REPORT
    // =========================================================

    public byte[] studentsExcel(String status) {

        String normalizedStatus = status == null
                ? "ACTIVE"
                : status.trim().toUpperCase(Locale.ROOT);

        List<Student> students = switch (normalizedStatus) {
            case "ACTIVE" -> studentRepository.findByActiveOrderByStudentNameAsc(1);
            case "INACTIVE" -> studentRepository.findByActiveOrderByStudentNameAsc(0);
            case "ALL" -> studentRepository.findAllByOrderByStudentNameAsc();
            default -> throw new IllegalArgumentException(
                    "Invalid student status. Use ACTIVE, INACTIVE, or ALL.");
        };

        String[] headers = {
                "Student ID",
                "Student Name",
                "Email",
                "Course",
                "Status"
        };

        try (
                Workbook workbook = new XSSFWorkbook();
                ByteArrayOutputStream output =
                        new ByteArrayOutputStream()
        ) {

            Sheet sheet = workbook.createSheet("Students");

            CellStyle headerStyle = headerStyle(workbook);

            addTableHeader(sheet, 0, headers, headerStyle);

            int rowNumber = 1;

            for (Student student : students) {

                Row row = sheet.createRow(rowNumber++);

                set(row, 0, student.getStudentId());
                set(row, 1, student.getStudentName());
                set(row, 2, student.getEmail());
                set(row, 3, student.getCourse());

                status =
                        student.getActive() != null
                                && student.getActive() == 1
                                ? "Active"
                                : "Deactivated";

                set(row, 4, status);
            }

            autoSize(sheet, headers.length);

            workbook.write(output);

            return output.toByteArray();

        } catch (IOException ex) {

            throw new IllegalStateException(
                    "Unable to generate student Excel report.",
                    ex
            );
        }
    }

    // =========================================================
    // HELPER METHODS
    // =========================================================

    private void increment(
            Map<String, Long> counts,
            String key) {

        if (key == null) {
            return;
        }

        String normalized =
                key.trim().toUpperCase(Locale.ROOT);

        if (counts.containsKey(normalized)) {

            counts.put(
                    normalized,
                    counts.get(normalized) + 1
            );
        }
    }

    // Apache POI Excel title style
    private CellStyle titleStyle(Workbook workbook) {

        CellStyle style = workbook.createCellStyle();

        org.apache.poi.ss.usermodel.Font font =
                workbook.createFont();

        font.setBold(true);
        font.setFontHeightInPoints((short) 16);
        font.setColor(IndexedColors.DARK_BLUE.getIndex());

        style.setFont(font);

        return style;
    }

    // Apache POI Excel header style
    private CellStyle headerStyle(Workbook workbook) {

        CellStyle style = workbook.createCellStyle();

        org.apache.poi.ss.usermodel.Font font =
                workbook.createFont();

        font.setBold(true);
        font.setColor(IndexedColors.WHITE.getIndex());

        style.setFont(font);

        style.setFillForegroundColor(
                IndexedColors.DARK_BLUE.getIndex()
        );

        style.setFillPattern(
                FillPatternType.SOLID_FOREGROUND
        );

        style.setBorderBottom(BorderStyle.THIN);

        return style;
    }

    private void addTableHeader(
            Sheet sheet,
            int rowIndex,
            String[] values,
            CellStyle style) {

        Row row = sheet.createRow(rowIndex);

        for (int i = 0; i < values.length; i++) {

            Cell cell = row.createCell(i);

            cell.setCellValue(values[i]);
            cell.setCellStyle(style);
        }

        sheet.createFreezePane(0, rowIndex + 1);
    }

    // Apache POI cell value helper
    private void set(
            Row row,
            int index,
            Object value) {

        Cell cell = row.createCell(index);

        if (value == null) {
            return;
        }

        if (value instanceof Number number) {

            cell.setCellValue(number.doubleValue());

        } else {

            cell.setCellValue(String.valueOf(value));
        }
    }

    private void autoSize(
            Sheet sheet,
            int columns) {

        for (int i = 0; i < columns; i++) {
            sheet.autoSizeColumn(i);
        }
    }

    // OpenPDF student information table row
    private void addPdfRow(
            PdfPTable table,
            String label,
            String value,
            Font labelFont,
            Font valueFont) {

        PdfPCell labelCell =
                new PdfPCell(new Phrase(label, labelFont));

        labelCell.setPadding(8);
        labelCell.setBackgroundColor(
                new Color(242, 246, 250)
        );

        table.addCell(labelCell);

        PdfPCell valueCell =
                new PdfPCell(new Phrase(value, valueFont));

        valueCell.setPadding(8);

        table.addCell(valueCell);
    }

    // OpenPDF table header
    private void addPdfHeader(
            PdfPTable table,
            String value) {

        Font headerFont = new Font(
                Font.HELVETICA,
                10,
                Font.BOLD,
                Color.WHITE
        );

        PdfPCell cell =
                new PdfPCell(new Phrase(value, headerFont));

        cell.setPadding(8);
        cell.setBackgroundColor(
                new Color(31, 55, 90)
        );

        table.addCell(cell);
    }

    // OpenPDF performance metric row
    private void addMetric(
            PdfPTable table,
            String label,
            Double value) {

        PdfPCell labelCell = new PdfPCell(
                new Phrase(
                        label,
                        new Font(Font.HELVETICA, 10)
                )
        );

        labelCell.setPadding(6);
        table.addCell(labelCell);

        String score = value == null
                ? "N/A"
                : String.format(Locale.US, "%.2f%%", value);

        PdfPCell scoreCell = new PdfPCell(
                new Phrase(
                        score,
                        new Font(Font.HELVETICA, 10)
                )
        );

        scoreCell.setPadding(6);
        table.addCell(scoreCell);
    }

    private String safe(String value) {

        return value == null || value.isBlank()
                ? "N/A"
                : value;
    }
}
