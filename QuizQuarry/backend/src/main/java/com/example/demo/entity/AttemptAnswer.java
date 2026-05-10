package com.example.demo.entity;
import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
@Entity
@Table(name="attempt_answer")
@Data @NoArgsConstructor @AllArgsConstructor
public class AttemptAnswer {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="student_attempt_id")
    @JsonIgnore
    private StudentAttempt studentAttempt;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="quiz_question_id")
    @JsonIgnore
    private QuizQuestion quizQuestion;

    private String selectedOption;
    private Boolean isCorrect;
}
