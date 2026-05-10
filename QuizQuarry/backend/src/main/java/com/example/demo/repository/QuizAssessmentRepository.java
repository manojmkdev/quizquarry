package com.example.demo.repository;
import com.example.demo.entity.QuizAssessment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface QuizAssessmentRepository extends JpaRepository<QuizAssessment, Long> {
    List<QuizAssessment> findByInstructorId(Long instructorId);
    List<QuizAssessment> findByStatus(QuizAssessment.Status status);
}
