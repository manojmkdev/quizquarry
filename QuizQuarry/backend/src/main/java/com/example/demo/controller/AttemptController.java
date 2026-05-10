package com.example.demo.controller;

import com.example.demo.dto.*;
import com.example.demo.service.AttemptGradingService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/attempts")
public class AttemptController {
    private final AttemptGradingService svc;

    public AttemptController(AttemptGradingService svc) {
        this.svc = svc;
    }

    @PreAuthorize("hasRole('STUDENT')")
    @PostMapping("/start/{quizId}")
    public AttemptStartDto start(@PathVariable Long quizId, @RequestParam(required = false) String code, org.springframework.security.core.Authentication auth) {
        return svc.startAttempt(quizId, auth.getName(), code);
    }

    @PreAuthorize("hasRole('STUDENT')")
    @PostMapping("/{id}/tab-switch")
    public void recordTabSwitch(@PathVariable Long id) {
        svc.recordTabSwitch(id);
    }

    @PreAuthorize("hasRole('STUDENT')")
    @GetMapping("/{id}/current-question")
    public QuestionAttemptDto getCurrentQuestion(@PathVariable Long id) {
        return svc.getCurrentQuestion(id);
    }

    @PreAuthorize("hasRole('STUDENT')")
    @PostMapping("/{id}/answer")
    public void submitAnswer(@PathVariable Long id, @RequestBody java.util.Map<String, String> body) {
        svc.submitAnswer(id, body.get("answer"));
    }

    @PreAuthorize("hasRole('STUDENT')")
    @PostMapping("/{id}/submit")
    public AttemptResultDto sub(@PathVariable Long id) {
        return svc.submitAttempt(id);
    }

    @PreAuthorize("hasRole('INSTRUCTOR')")
    @GetMapping("/instructor-report")
    public List<AttemptReportDto> rep(java.security.Principal principal) {
        return svc.getInstructorReport(principal.getName());
    }

    @GetMapping("/leaderboard")
    public List<LeaderboardDto> getLeaderboard() {
        return svc.getLeaderboard();
    }

    @PreAuthorize("hasRole('INSTRUCTOR')")
    @GetMapping("/submission-stats")
    public List<QuizStatDto> getQuizStats(java.security.Principal principal) {
        return svc.getQuizSubmissionStats(principal.getName());
    }

    @PreAuthorize("hasRole('STUDENT')")
    @GetMapping("/results/{id}")
    public AttemptResultDto getResult(@PathVariable Long id) {
        return svc.getResult(id);
    }

    /** Student history — all their submitted attempts */
    @PreAuthorize("hasRole('STUDENT')")
    @GetMapping("/my-history")
    public List<AttemptReportDto> getMyHistory(org.springframework.security.core.Authentication auth) {
        return svc.getMyHistory(auth.getName());
    }

    /** Instructor can also fetch a specific result for viewing */
    @PreAuthorize("hasRole('INSTRUCTOR')")
    @GetMapping("/instructor-results/{id}")
    public AttemptResultDto getResultAsInstructor(@PathVariable Long id) {
        return svc.getResult(id);
    }
}
