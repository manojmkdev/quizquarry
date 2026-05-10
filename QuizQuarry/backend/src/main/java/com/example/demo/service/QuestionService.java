package com.example.demo.service;

import com.example.demo.dto.*;
import com.example.demo.entity.*;
import com.example.demo.repository.*;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class QuestionService {
    private final QuizQuestionRepository qRepo;
    private final QuizAssessmentRepository quizRepo;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    public QuestionService(QuizQuestionRepository qRepo, QuizAssessmentRepository quizRepo) {
        this.qRepo = qRepo;
        this.quizRepo = quizRepo;
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    public void generateForQuiz(Long quizId) {
        QuizAssessment quiz = quizRepo.findById(quizId).orElseThrow();
        generateAndSaveQuestions(quiz, 10);
        
        // Initial generation keeps it as DRAFT for instructor review
        quiz.setStatus(QuizAssessment.Status.DRAFT);
        quizRepo.save(quiz);
    }

    public void addSingleAiQuestion(Long quizId) {
        QuizAssessment quiz = quizRepo.findById(quizId).orElseThrow();
        generateAndSaveQuestions(quiz, 1);
    }

    public void generateAndSaveQuestions(QuizAssessment quiz, int count) {

        String concepts = quiz.getConcepts();
        String prompt = String.format(
                "Generate %d multiple choice questions about: '%s'. " +
                "Return ONLY a raw JSON array. " +
                "Each object: 'question', 'options' (array of 4), 'correctAnswer' (string), 'explanation' (string).",
                count, concepts);

        String requestBody = "{\"contents\": [{\"parts\":[{\"text\": \"" + prompt.replace("\"", "\\\"") + "\"}]}]}";
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<String> entity = new HttpEntity<>(requestBody, headers);

        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + geminiApiKey;

        try {
            String response = restTemplate.postForObject(url, entity, String.class);
            JsonNode root = objectMapper.readTree(response);
            String aiText = root.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText();
            aiText = aiText.replaceAll("^```json", "").replaceAll("```$", "").trim();
            JsonNode questionsArray = objectMapper.readTree(aiText);

            for (JsonNode qNode : questionsArray) {
                QuizQuestion q = new QuizQuestion();
                q.setQuizAssessment(quiz);
                q.setQuestionText(qNode.get("question").asText());
                q.setOptionsJson(objectMapper.writeValueAsString(qNode.get("options")));
                q.setCorrectAnswer(qNode.get("correctAnswer").asText());
                q.setExplanation(qNode.get("explanation").asText());
                q.setDifficultyLevel(QuizQuestion.Difficulty.MEDIUM);
                qRepo.save(q);
            }
        } catch (Exception e) {
            throw new RuntimeException("AI Generation failed: " + e.getMessage());
        }
    }

    public void updateQuestion(Long id, com.example.demo.dto.QuizDtos.QuestionDto dto) {
        QuizQuestion q = qRepo.findById(id).orElseThrow();
        q.setQuestionText(dto.getQuestionText());
        q.setOptionsJson(dto.getOptionsJson());
        q.setCorrectAnswer(dto.getCorrectAnswer());
        q.setExplanation(dto.getExplanation());
        qRepo.save(q);
    }
    
    public void deleteQuestion(Long id) {
        qRepo.deleteById(id);
    }
}

