package com.smartperformance.report;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reports")
public class ReportController {
    private static final MediaType XLSX_MEDIA_TYPE =
            MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    private final ReportService reportService;

    public ReportController(ReportService reportService) { this.reportService = reportService; }

    @GetMapping(value = "/students/{studentId}/performance.pdf", produces = "application/pdf")
    public ResponseEntity<byte[]> studentPerformancePdf(@PathVariable Long studentId) {
        return attachment(reportService.studentPerformancePdf(studentId),
                "student-" + studentId + "-performance-report.pdf", MediaType.APPLICATION_PDF);
    }
    @GetMapping("/dashboard.xlsx")
    public ResponseEntity<byte[]> dashboardExcel() {
        return attachment(reportService.dashboardExcel(), "dashboard-report.xlsx", XLSX_MEDIA_TYPE);
    }
    @GetMapping("/performance.xlsx")
    public ResponseEntity<byte[]> performanceExcel() {
        return attachment(reportService.performanceExcel(), "performance-report.xlsx", XLSX_MEDIA_TYPE);
    }
    @GetMapping("/students.xlsx")
    public ResponseEntity<byte[]> studentsExcel(
            @RequestParam(defaultValue = "ACTIVE") String status) {
        String normalizedStatus = status.trim().toUpperCase(java.util.Locale.ROOT);
        String filename = switch (normalizedStatus) {
            case "ACTIVE" -> "active-students.xlsx";
            case "INACTIVE" -> "deactivated-students.xlsx";
            case "ALL" -> "all-students.xlsx";
            default -> throw new IllegalArgumentException(
                    "Invalid student status. Use ACTIVE, INACTIVE, or ALL.");
        };
        return attachment(reportService.studentsExcel(normalizedStatus), filename, XLSX_MEDIA_TYPE);
    }
    private ResponseEntity<byte[]> attachment(byte[] data, String filename, MediaType mediaType) {
        return ResponseEntity.ok().contentType(mediaType)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentLength(data.length).body(data);
    }
}
