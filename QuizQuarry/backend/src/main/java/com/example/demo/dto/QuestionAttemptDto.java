package com.example.demo.dto;
import lombok.Data;
@Data public class QuestionAttemptDto {
    private Long questionId;
    private String questionText;
    private String optionsJson;
}
