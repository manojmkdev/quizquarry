package com.example.demo.dto;

import lombok.Data;
import java.util.List;

@Data
public class AttemptResultDto {
    private Long id;
    private Integer score;
    private Integer totalQuestions;
    private String quizTitle;
    private Integer attemptNumber;
    private List<QuestionReviewDto> questions;
}
