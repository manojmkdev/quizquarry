package com.example.demo.repository;
import com.example.demo.entity.AttemptAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface AttemptAnswerRepository extends JpaRepository<AttemptAnswer, Long> {
    List<AttemptAnswer> findByStudentAttemptId(Long attemptId);
}
