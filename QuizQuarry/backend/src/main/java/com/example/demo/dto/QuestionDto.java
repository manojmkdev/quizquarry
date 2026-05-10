package com.example.demo.dto;

import lombok.Data;

@Data
public class QuestionDto {
    private Long id;
    private Long questionBankId;
    private String questionText;
    private String optionsJson;
    private String difficultyLevel;
    private Boolean isAiGenerated;
}
