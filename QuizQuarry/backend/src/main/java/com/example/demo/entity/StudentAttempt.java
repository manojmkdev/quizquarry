package com.example.demo.entity;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnore;
@Entity
@Table(name="student_attempt")
@Data @NoArgsConstructor @AllArgsConstructor
public class StudentAttempt {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="quiz_assessment_id")
    @JsonIgnore
    private QuizAssessment quizAssessment;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="student_id")
    @JsonIgnore
    private SystemUser student;
    private Integer attemptNumber;
    private Integer score;
    @Enumerated(EnumType.STRING)
    private Status status = Status.IN_PROGRESS;
    private LocalDateTime startedAt = LocalDateTime.now();
    private LocalDateTime submittedAt;
    private Integer tabSwitchCount = 0;
    private Integer currentQuestionIndex = 0;
    
    @OneToMany(mappedBy="studentAttempt", cascade=CascadeType.ALL)
    @JsonIgnore
    private List<AttemptAnswer> answers;
    
    public enum Status { IN_PROGRESS, SUBMITTED }
}
