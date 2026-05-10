package com.example.demo.dto;
import lombok.Data;
import java.util.List;
@Data public class AttemptStartDto {
    private Long attemptId;
    private String title;
    private Integer timeLimitMinutes;
    private Integer questionTimeLimitSeconds;


    private List<QuestionAttemptDto> questions;
    private Integer totalQuestions;
    private Integer maxTabSwitches;
}

