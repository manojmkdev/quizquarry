package com.example.demo.controller;

import com.example.demo.dto.*;
import com.example.demo.service.QuizService;
import com.example.demo.service.QuestionService;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import java.util.List;

@RestController
@RequestMapping("/api/quizzes")
public class QuizController {
    private final QuizService svc;
    private final QuestionService qSvc;

    public QuizController(QuizService svc, QuestionService qSvc) {
        this.svc = svc;
        this.qSvc = qSvc;
    }

    @GetMapping
    public ResponseEntity<List<QuizDto>> get(java.security.Principal principal) {
        return ResponseEntity.ok(svc.getQuizzes(principal != null ? principal.getName() : null));
    }

    @PostMapping
    public ResponseEntity<String> create(@RequestBody QuizDto req, java.security.Principal principal) {
        svc.create(req, principal.getName());
        return ResponseEntity.ok("Quiz created in DRAFT. AI questions generated.");
    }

    @GetMapping("/{id}/questions")
    public List<com.example.demo.dto.QuizDtos.QuestionDto> getQuestions(@PathVariable Long id) {
        return svc.getQuestionsForQuiz(id);
    }

    @GetMapping("/{id}/settings")
    public QuizDto getSettings(@PathVariable Long id) {
        return svc.getQuizSettings(id);
    }

    @PutMapping("/{id}/settings")
    public QuizDto updateSettings(@PathVariable Long id, @RequestBody QuizDto req) {
        return svc.updateSettings(id, req);
    }

    @PutMapping("/{id}/publish")
    public String publish(@PathVariable Long id) {
        return svc.publish(id);
    }

    @PostMapping("/{id}/add-ai-question")
    public void addAi(@PathVariable Long id) {
        qSvc.addSingleAiQuestion(id);
        svc.recalculateTime(id); // auto-recalculate time
    }

    @PutMapping("/questions/{id}")
    public void updateQ(@PathVariable Long id, @RequestBody com.example.demo.dto.QuizDtos.QuestionDto req) {
        qSvc.updateQuestion(id, req);
    }

    @DeleteMapping("/questions/{id}")
    public void deleteQ(@PathVariable Long id) {
        qSvc.deleteQuestion(id);
    }

    @DeleteMapping("/{id}")
    public void deleteQuiz(@PathVariable Long id) {
        svc.deleteQuiz(id);
    }
}
