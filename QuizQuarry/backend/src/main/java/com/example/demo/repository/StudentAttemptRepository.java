package com.example.demo.repository;
import com.example.demo.entity.StudentAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface StudentAttemptRepository extends JpaRepository<StudentAttempt, Long> {
    List<StudentAttempt> findByStudentId(Long studentId);
    Long countByStudentIdAndQuizAssessmentId(Long studentId, Long quizId);
    List<StudentAttempt> findByQuizAssessmentIdIn(List<Long> quizIds);
}
