package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name="quiz_question")
@Data @NoArgsConstructor @AllArgsConstructor
public class QuizQuestion {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="quiz_assessment_id")
    @JsonIgnore
    private QuizAssessment quizAssessment;
    
    @Column(columnDefinition="TEXT")
    private String questionText;
    
    @Column(columnDefinition="TEXT") // Changed from JSON for simplicity in this specific project context
    private String optionsJson;
    
    private String correctAnswer;
    
    @Column(columnDefinition="TEXT")
    private String explanation;
    
    @Enumerated(EnumType.STRING)
    private Difficulty difficultyLevel;
    
    private Boolean isAiGenerated = true;
    
    public enum Difficulty { EASY, MEDIUM, HARD }
}
