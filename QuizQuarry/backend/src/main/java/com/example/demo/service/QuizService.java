package com.example.demo.service;

import com.example.demo.dto.*;
import com.example.demo.entity.*;
import com.example.demo.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class QuizService {
    private final QuizAssessmentRepository qRepo;
    private final StudentAttemptRepository aRepo;
    private final SystemUserRepository uRepo;
    private final QuestionService aiService;

    public QuizService(QuizAssessmentRepository qRepo, StudentAttemptRepository aRepo,
            SystemUserRepository uRepo, QuestionService aiService) {
        this.qRepo = qRepo;
        this.aRepo = aRepo;
        this.uRepo = uRepo;
        this.aiService = aiService;
    }

    public List<QuizDto> getQuizzes(String email) {
        SystemUser user = (email != null) ? uRepo.findByEmail(email).orElse(null) : null;

        return qRepo.findAll().stream()
                .filter(q -> user != null && (user.getRole() == SystemUser.Role.INSTRUCTOR || q.getStatus() == QuizAssessment.Status.PUBLISHED))
                .map(q -> {
            QuizDto d = new QuizDto();
            d.setId(q.getId());
            d.setTitle(q.getTitle());
            d.setConcepts(q.getConcepts());
            d.setTimeLimitMinutes(q.getTimeLimitMinutes());
            d.setQuestionTimeLimitSeconds(q.getQuestionTimeLimitSeconds());
            d.setStatus(q.getStatus().name());
            d.setAccessType(q.getAccessType().name());
            d.setAccessCode(q.getAccessCode());
            d.setMaxTabSwitches(q.getMaxTabSwitches());
            d.setMaxAttempts(q.getMaxAttempts());
            d.setQuestionCount(q.getQuestions() != null ? q.getQuestions().size() : 0);

            if (user != null && user.getRole() == SystemUser.Role.STUDENT) {
                long used = aRepo.countByStudentIdAndQuizAssessmentId(user.getId(), q.getId());
                d.setAttemptsUsed((int) used);

                aRepo.findByStudentId(user.getId()).stream()
                        .filter(a -> a.getQuizAssessment() != null && a.getQuizAssessment().getId().equals(q.getId())
                                && a.getStatus() == StudentAttempt.Status.SUBMITTED)
                        .map(a -> a.getScore())
                        .reduce((first, second) -> second)
                        .ifPresent(score -> d.setLastAttemptScore(score));
            }
            return d;
        }).collect(Collectors.toList());
    }

    public List<com.example.demo.dto.QuizDtos.QuestionDto> getQuestionsForQuiz(Long quizId) {
        QuizAssessment quiz = qRepo.findById(quizId).orElseThrow();
        return quiz.getQuestions().stream().map(q -> {
            com.example.demo.dto.QuizDtos.QuestionDto d = new com.example.demo.dto.QuizDtos.QuestionDto();
            d.setId(q.getId());
            d.setQuestionText(q.getQuestionText());
            d.setOptionsJson(q.getOptionsJson());
            d.setCorrectAnswer(q.getCorrectAnswer());
            d.setExplanation(q.getExplanation());
            return d;
        }).collect(Collectors.toList());
    }

    @Transactional
    public String publish(Long id) {
        QuizAssessment q = qRepo.findById(id).orElseThrow();
        q.setStatus(QuizAssessment.Status.PUBLISHED);
        if (q.getAccessType() == QuizAssessment.AccessType.PRIVATE && q.getAccessCode() == null) {
            q.setAccessCode(String.format("%06d", new java.util.Random().nextInt(1000000)));
        }
        qRepo.save(q);
        return q.getAccessCode();
    }

    @Transactional
    public void create(QuizDto dto, String instructorEmail) {
        SystemUser instructor = uRepo.findByEmail(instructorEmail).orElseThrow();
        
        QuizAssessment q = new QuizAssessment();
        q.setTitle(dto.getTitle());
        q.setConcepts(dto.getConcepts());
        q.setQuestionTimeLimitSeconds(dto.getQuestionTimeLimitSeconds() != null ? dto.getQuestionTimeLimitSeconds() : 30);
        q.setInstructor(instructor);
        q.setStatus(QuizAssessment.Status.DRAFT);
        
        if (dto.getAccessType() != null) {
            q.setAccessType(QuizAssessment.AccessType.valueOf(dto.getAccessType()));
        }
        if (dto.getMaxTabSwitches() != null) {
            q.setMaxTabSwitches(dto.getMaxTabSwitches());
        }
        if (dto.getMaxAttempts() != null) {
            q.setMaxAttempts(dto.getMaxAttempts());
        }

        // Auto-calculate total time: questionTimeLimitSeconds * questionCount / 60, rounded up
        int count = dto.getInitialQuestionCount() != null ? dto.getInitialQuestionCount() : 10;
        int perQ = q.getQuestionTimeLimitSeconds();
        int autoMinutes = (int) Math.ceil((double)(perQ * count) / 60.0);
        q.setTimeLimitMinutes(dto.getTimeLimitMinutes() != null ? dto.getTimeLimitMinutes() : autoMinutes);

        QuizAssessment saved = qRepo.save(q);
        aiService.generateAndSaveQuestions(saved, count);
    }

    /**
     * Update quiz settings (time, maxAttempts, etc.) from the Manage page.
     */
    @Transactional
    public QuizDto updateSettings(Long id, QuizDto dto) {
        QuizAssessment q = qRepo.findById(id).orElseThrow();
        
        if (dto.getTimeLimitMinutes() != null) q.setTimeLimitMinutes(dto.getTimeLimitMinutes());
        if (dto.getQuestionTimeLimitSeconds() != null) q.setQuestionTimeLimitSeconds(dto.getQuestionTimeLimitSeconds());
        if (dto.getMaxTabSwitches() != null) q.setMaxTabSwitches(dto.getMaxTabSwitches());
        if (dto.getMaxAttempts() != null) q.setMaxAttempts(dto.getMaxAttempts());
        if (dto.getAccessType() != null) q.setAccessType(QuizAssessment.AccessType.valueOf(dto.getAccessType()));
        
        qRepo.save(q);
        
        QuizDto res = new QuizDto();
        res.setId(q.getId());
        res.setTimeLimitMinutes(q.getTimeLimitMinutes());
        res.setQuestionTimeLimitSeconds(q.getQuestionTimeLimitSeconds());
        res.setMaxTabSwitches(q.getMaxTabSwitches());
        res.setMaxAttempts(q.getMaxAttempts());
        res.setQuestionCount(q.getQuestions().size());
        return res;
    }

    /**
     * Recalculate time after adding a question.
     */
    @Transactional
    public void recalculateTime(Long quizId) {
        QuizAssessment q = qRepo.findById(quizId).orElseThrow();
        int count = q.getQuestions().size();
        int perQ = q.getQuestionTimeLimitSeconds();
        q.setTimeLimitMinutes((int) Math.ceil((double)(perQ * count) / 60.0));
        qRepo.save(q);
    }

    /**
     * Get quiz settings for the manage page.
     */
    public QuizDto getQuizSettings(Long id) {
        QuizAssessment q = qRepo.findById(id).orElseThrow();
        QuizDto d = new QuizDto();
        d.setId(q.getId());
        d.setTitle(q.getTitle());
        d.setConcepts(q.getConcepts());
        d.setTimeLimitMinutes(q.getTimeLimitMinutes());
        d.setQuestionTimeLimitSeconds(q.getQuestionTimeLimitSeconds());
        d.setMaxTabSwitches(q.getMaxTabSwitches());
        d.setMaxAttempts(q.getMaxAttempts());
        d.setStatus(q.getStatus().name());
        d.setAccessType(q.getAccessType().name());
        d.setAccessCode(q.getAccessCode());
        d.setQuestionCount(q.getQuestions().size());
        return d;
    }

    @Transactional
    public void deleteQuiz(Long id) {
        QuizAssessment q = qRepo.findById(id).orElseThrow();
        // Delete all student attempts for this quiz first
        aRepo.findByQuizAssessmentIdIn(java.util.List.of(id)).forEach(aRepo::delete);
        qRepo.delete(q);
    }
}
