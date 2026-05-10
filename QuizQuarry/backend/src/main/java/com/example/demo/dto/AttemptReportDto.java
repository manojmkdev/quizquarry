package com.example.demo.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class AttemptReportDto {
    private Long attemptId;
    private Long studentId;
    private String studentName;
    private String subject;
    private Integer attemptNumber;
    private Integer score;
    private Double accuracy;
    private Long durationSeconds;
    private LocalDateTime submittedAt;
}
