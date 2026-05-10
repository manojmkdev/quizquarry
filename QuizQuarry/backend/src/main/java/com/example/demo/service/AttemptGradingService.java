package com.example.demo.service;

import com.example.demo.dto.*;
import com.example.demo.exception.BusinessValidationException;
import com.example.demo.entity.*;
import com.example.demo.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.time.Duration;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AttemptGradingService {
    private final StudentAttemptRepository aRepo;
    private final QuizAssessmentRepository qRepo;
    private final SystemUserRepository uRepo;

    public AttemptGradingService(StudentAttemptRepository aRepo, QuizAssessmentRepository qRepo,
            SystemUserRepository uRepo) {
        this.qRepo = qRepo;
        this.uRepo = uRepo;
        this.aRepo = aRepo;
    }

    @Transactional
    public AttemptStartDto startAttempt(Long quizId, String email, String code) {
        SystemUser student = uRepo.findByEmail(email).orElseThrow();
        QuizAssessment quiz = qRepo.findById(quizId).orElseThrow();

        if (quiz.getAccessType() == QuizAssessment.AccessType.PRIVATE) {
            if (code == null || !code.equals(quiz.getAccessCode())) {
                throw new BusinessValidationException("Invalid access code for this private quiz.");
            }
        }

        if (quiz.getQuestions() == null || quiz.getQuestions().isEmpty()) {
            throw new BusinessValidationException("AI questions have not been generated for this quiz yet.");
        }

        Long attemptCount = aRepo.countByStudentIdAndQuizAssessmentId(student.getId(), quizId);
        int maxAllowed = quiz.getMaxAttempts() != null ? quiz.getMaxAttempts() : 1;
        if (attemptCount >= maxAllowed) {
            throw new BusinessValidationException("Attempt limit reached. You have used all " + maxAllowed + " attempt(s) for this quiz.");
        }

        StudentAttempt attempt = new StudentAttempt();
        attempt.setQuizAssessment(quiz);
        attempt.setStudent(student);
        attempt.setAttemptNumber(attemptCount.intValue() + 1);
        attempt.setStatus(StudentAttempt.Status.IN_PROGRESS);
        attempt.setStartedAt(LocalDateTime.now());
        attempt.setTabSwitchCount(0);
        attempt.setCurrentQuestionIndex(0);
        aRepo.save(attempt);

        AttemptStartDto res = new AttemptStartDto();
        res.setAttemptId(attempt.getId());
        res.setTitle(quiz.getTitle());
        res.setTimeLimitMinutes(quiz.getTimeLimitMinutes());
        res.setQuestionTimeLimitSeconds(quiz.getQuestionTimeLimitSeconds());
        res.setMaxTabSwitches(quiz.getMaxTabSwitches());
        res.setTotalQuestions(quiz.getQuestions().size());

        QuizQuestion first = quiz.getQuestions().get(0);
        QuestionAttemptDto firstQ = new QuestionAttemptDto();
        firstQ.setQuestionId(first.getId());
        firstQ.setQuestionText(first.getQuestionText());
        firstQ.setOptionsJson(first.getOptionsJson());
        res.setQuestions(java.util.List.of(firstQ));

        return res;
    }

    @Transactional
    public QuestionAttemptDto getCurrentQuestion(Long attemptId) {
        StudentAttempt attempt = aRepo.findById(attemptId).orElseThrow();
        List<QuizQuestion> questions = attempt.getQuizAssessment().getQuestions();

        if (attempt.getCurrentQuestionIndex() >= questions.size()) return null;

        QuizQuestion q = questions.get(attempt.getCurrentQuestionIndex());
        QuestionAttemptDto d = new QuestionAttemptDto();
        d.setQuestionId(q.getId());
        d.setQuestionText(q.getQuestionText());
        d.setOptionsJson(q.getOptionsJson());
        return d;
    }

    @Transactional
    public void submitAnswer(Long attemptId, String selectedOption) {
        StudentAttempt attempt = aRepo.findById(attemptId).orElseThrow();
        List<QuizQuestion> questions = attempt.getQuizAssessment().getQuestions();

        if (attempt.getCurrentQuestionIndex() >= questions.size()) {
            throw new BusinessValidationException("All questions already answered.");
        }

        QuizQuestion currentQ = questions.get(attempt.getCurrentQuestionIndex());

        AttemptAnswer ans = new AttemptAnswer();
        ans.setStudentAttempt(attempt);
        ans.setQuizQuestion(currentQ);
        ans.setSelectedOption(selectedOption);
        ans.setIsCorrect(selectedOption != null && selectedOption.equals(currentQ.getCorrectAnswer()));

        if (attempt.getAnswers() == null) {
            attempt.setAnswers(new java.util.ArrayList<>());
        }
        attempt.getAnswers().add(ans);
        attempt.setCurrentQuestionIndex(attempt.getCurrentQuestionIndex() + 1);
        aRepo.save(attempt);
    }

    @Transactional
    public AttemptResultDto submitAttempt(Long id) {
        StudentAttempt a = aRepo.findById(id).orElseThrow();
        a.setStatus(StudentAttempt.Status.SUBMITTED);
        a.setSubmittedAt(LocalDateTime.now());

        List<AttemptAnswer> answers = a.getAnswers();
        long correctCount = answers != null ? answers.stream().filter(ans -> ans.getIsCorrect() != null && ans.getIsCorrect()).count() : 0;
        int totalQuestions = a.getQuizAssessment().getQuestions().size();

        int score = (int) Math.round(((double) correctCount / totalQuestions) * 100);
        a.setScore(score);
        aRepo.save(a);

        AttemptResultDto res = new AttemptResultDto();
        res.setId(a.getId());
        res.setScore(score);
        res.setTotalQuestions(totalQuestions);
        res.setQuizTitle(a.getQuizAssessment().getTitle());
        res.setAttemptNumber(a.getAttemptNumber());
        res.setQuestions(answers != null ? answers.stream().map(ans -> {
            QuestionReviewDto d = new QuestionReviewDto();
            d.setQuestionId(ans.getQuizQuestion().getId());
            d.setQuestionText(ans.getQuizQuestion().getQuestionText());
            d.setSelectedOption(ans.getSelectedOption());
            d.setCorrectAnswer(ans.getQuizQuestion().getCorrectAnswer());
            d.setExplanation(ans.getQuizQuestion().getExplanation());
            return d;
        }).collect(Collectors.toList()) : new java.util.ArrayList<>());

        return res;
    }

    @Transactional(readOnly = true)
    public List<AttemptReportDto> getInstructorReport() {
        return aRepo.findAll().stream()
                .filter(a -> a.getStatus() == StudentAttempt.Status.SUBMITTED)
                .map(a -> {
            AttemptReportDto d = new AttemptReportDto();
            d.setAttemptId(a.getId());
            d.setStudentId(a.getStudent() != null ? a.getStudent().getId() : 0L);
            d.setStudentName(a.getStudent() != null ? a.getStudent().getFullName() : "Unknown");
            d.setSubject(a.getQuizAssessment().getTitle());
            d.setAttemptNumber(a.getAttemptNumber());
            d.setScore(a.getScore());
            d.setAccuracy((double) a.getScore());

            if (a.getStartedAt() != null && a.getSubmittedAt() != null) {
                d.setDurationSeconds(Duration.between(a.getStartedAt(), a.getSubmittedAt()).getSeconds());
            }

            d.setSubmittedAt(a.getSubmittedAt());
            return d;
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AttemptReportDto> getMyHistory(String email) {
        SystemUser student = uRepo.findByEmail(email).orElseThrow();
        return aRepo.findByStudentId(student.getId()).stream()
                .filter(a -> a.getStatus() == StudentAttempt.Status.SUBMITTED)
                .map(a -> {
                    AttemptReportDto d = new AttemptReportDto();
                    d.setAttemptId(a.getId());
                    d.setStudentId(student.getId());
                    d.setStudentName(student.getFullName());
                    d.setSubject(a.getQuizAssessment().getTitle());
                    d.setAttemptNumber(a.getAttemptNumber());
                    d.setScore(a.getScore());
                    d.setAccuracy((double) (a.getScore() != null ? a.getScore() : 0));
                    if (a.getStartedAt() != null && a.getSubmittedAt() != null) {
                        d.setDurationSeconds(Duration.between(a.getStartedAt(), a.getSubmittedAt()).getSeconds());
                    }
                    d.setSubmittedAt(a.getSubmittedAt());
                    return d;
                })
                .sorted((a, b) -> b.getSubmittedAt().compareTo(a.getSubmittedAt()))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<LeaderboardDto> getLeaderboard() {
        return aRepo.findAll().stream()
                .filter(a -> a.getStatus() == StudentAttempt.Status.SUBMITTED)
                .collect(Collectors.groupingBy(a -> a.getStudent() != null ? a.getStudent().getFullName() : "Unknown"))
                .entrySet().stream()
                .map(e -> {
                    LeaderboardDto d = new LeaderboardDto();
                    d.setStudentName(e.getKey());
                    int uniqueQuizzes = (int) e.getValue().stream().map(a -> a.getQuizAssessment().getId()).distinct().count();
                    d.setQuizzesAttended(uniqueQuizzes);
                    d.setAverageScore(e.getValue().stream().mapToInt(a -> a.getScore() == null ? 0 : a.getScore()).average().orElse(0.0));
                    return d;
                })
                .sorted((a, b) -> Double.compare(b.getAverageScore(), a.getAverageScore()))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<QuizStatDto> getQuizSubmissionStats() {
        return aRepo.findAll().stream()
                .filter(a -> a.getStatus() == StudentAttempt.Status.SUBMITTED)
                .collect(Collectors.groupingBy(a -> a.getQuizAssessment().getTitle(), Collectors.counting()))
                .entrySet().stream()
                .map(e -> {
                    QuizStatDto d = new QuizStatDto();
                    d.setQuizTitle(e.getKey());
                    d.setSubmissionCount(e.getValue());
                    return d;
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public void recordTabSwitch(Long attemptId) {
        StudentAttempt attempt = aRepo.findById(attemptId).orElseThrow();
        attempt.setTabSwitchCount(attempt.getTabSwitchCount() + 1);
        aRepo.save(attempt);
    }

    @Transactional(readOnly = true)
    public AttemptResultDto getResult(Long id) {
        StudentAttempt a = aRepo.findById(id).orElseThrow();
        AttemptResultDto res = new AttemptResultDto();
        res.setId(a.getId());
        res.setScore(a.getScore());
        res.setTotalQuestions(a.getQuizAssessment().getQuestions().size());
        res.setQuizTitle(a.getQuizAssessment().getTitle());
        res.setAttemptNumber(a.getAttemptNumber());

        List<AttemptAnswer> answers = a.getAnswers();
        res.setQuestions(answers != null ? answers.stream().map(ans -> {
            QuestionReviewDto d = new QuestionReviewDto();
            d.setQuestionId(ans.getQuizQuestion().getId());
            d.setQuestionText(ans.getQuizQuestion().getQuestionText());
            d.setSelectedOption(ans.getSelectedOption());
            d.setCorrectAnswer(ans.getQuizQuestion().getCorrectAnswer());
            d.setExplanation(ans.getQuizQuestion().getExplanation());
            return d;
        }).collect(Collectors.toList()) : new java.util.ArrayList<>());
        return res;
    }
}
