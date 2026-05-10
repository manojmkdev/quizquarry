package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name="quiz_assessment")
@Data @NoArgsConstructor @AllArgsConstructor
public class QuizAssessment {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="instructor_id")
    @JsonIgnore
    private SystemUser instructor;
    
    private String title;
    @Column(columnDefinition="TEXT")
    private String concepts; // Topics/Concepts to cover in the quiz
    
    private Integer timeLimitMinutes;
    private Integer questionTimeLimitSeconds = 30; // Default 30s per question
    
    @Enumerated(EnumType.STRING)

    private Status status = Status.DRAFT;
    
    @Enumerated(EnumType.STRING)
    private AccessType accessType = AccessType.PUBLIC;
    
    private String accessCode;
    private Integer maxTabSwitches = 0;
    private Integer maxAttempts = 1; // Default: 1 attempt per student
    
    @OneToMany(mappedBy = "quizAssessment", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<QuizQuestion> questions = new ArrayList<>();

    public enum Status { DRAFT, PUBLISHED }
    public enum AccessType { PUBLIC, PRIVATE }
}
