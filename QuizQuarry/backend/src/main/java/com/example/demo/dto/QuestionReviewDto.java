package com.example.demo.dto;

import lombok.Data;

@Data
public class QuestionReviewDto {
    private Long questionId;
    private String questionText;
    private String selectedOption;
    private String correctAnswer;
    private String explanation;

}
