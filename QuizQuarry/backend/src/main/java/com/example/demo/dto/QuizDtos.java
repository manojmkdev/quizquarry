package com.example.demo.dto;

import lombok.Data;
import java.util.List;
import java.time.LocalDateTime;

public class QuizDtos {
    @Data
    public static class BankDto {
        private Long id;
        private String title;
        private String subjectArea;
    }

    @Data
    public static class QuestionDto {
        private Long id;
        private Long questionBankId;
        private String questionText;
        private String optionsJson;
        private String correctAnswer;
        private String explanation;
        private String difficultyLevel;

        private Boolean isAiGenerated;
    }

    @Data
    public static class AiRequestDto {
        private Long bankId;
        private String topic;
        private Integer count;
        private String difficulty;
    }

    @Data
    public static class QuizDto {
        private Long id;
        private String title;
        private String concepts;
        private Integer timeLimitMinutes;
        private Integer questionTimeLimitSeconds;

        private String status;

        private String accessType;
        private String accessCode;
        private Integer maxTabSwitches;
    }


    @Data
    public static class AttemptResultDto {
        private Long id;
        private Integer score;
        private Integer totalQuestions;
        private List<QuestionReviewDto> questions;
    }

    @Data
    public static class QuestionReviewDto {
        private Long questionId;
        private String questionText;
        private String selectedOption;
        private String correctAnswer;
        private String explanation;

    }

    @Data
    public static class ExplanationDto {
        private String correctAnswer;
        private String explanation;
    }

    @Data
    public static class AttemptReportDto {
        private Long studentId;
        private String studentName;
        private String subject;
        private Integer attemptNumber;
        private Integer score;
        private Double accuracy;
        private Long durationSeconds;
        private LocalDateTime submittedAt;

    }
}
