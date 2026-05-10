package com.example.demo.dto;

import lombok.Data;

@Data
public class QuizDto {
    private Long id;
    private String title;
    private String concepts;
    private Integer timeLimitMinutes;
    private Integer questionTimeLimitSeconds;
    private Integer initialQuestionCount;
    private Integer questionCount; // actual count of questions

    private String status;
    private Long bankId;
    private Integer lastAttemptScore;
    private String accessType;
    private String accessCode;
    private Integer maxTabSwitches;
    private Integer maxAttempts;
    private Integer attemptsUsed; // how many attempts this student has used
}
