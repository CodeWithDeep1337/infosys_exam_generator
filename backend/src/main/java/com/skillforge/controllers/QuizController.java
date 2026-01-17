package com.skillforge.controllers;

import com.skillforge.model.*;
import com.skillforge.service.QuizService;
import com.skillforge.dto.QuizRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/quizzes")
// Note: CORS is also handled globally in SecurityConfig, but this local one is fine.
@CrossOrigin(origins = { "http://localhost:3001"})
public class QuizController {

    @Autowired
    private QuizService quizService;

    // =========================================================================
    // INSTRUCTOR & ADMIN ENDPOINTS
    // =========================================================================

    /** ✅ GET all quizzes for the management table */
    @PreAuthorize("hasAnyAuthority('INSTRUCTOR', 'ADMIN')")
    @GetMapping
    public ResponseEntity<List<Quiz>> getAllQuizzes() {
        return ResponseEntity.ok(quizService.getAllQuizzes());
    }

    /** ✅ GET quizzes by Instructor */
    @PreAuthorize("hasAnyAuthority('INSTRUCTOR', 'ADMIN')")
    @GetMapping("/instructor/{userId}")
    public ResponseEntity<List<Quiz>> getQuizzesByInstructor(@PathVariable Long userId) {
        return ResponseEntity.ok(quizService.getQuizzesByInstructor(userId));
    }

    /** ✅ AI Generation Endpoint */
    @PreAuthorize("hasAnyAuthority('INSTRUCTOR', 'ADMIN')")
    @PostMapping("/generate")
    public ResponseEntity<?> createQuiz(@RequestBody QuizRequest request) {
        if (request.getTitle() == null || request.getTitle().trim().length() < 5) {
            return ResponseEntity.badRequest().body("Title must be at least 5 characters.");
        }
        if (request.getTopicId() == null) {
            return ResponseEntity.badRequest().body("Topic selection is required.");
        }
        return ResponseEntity.ok(quizService.generateAndSave(request.getTitle(), request.getTopicId(), request.getTimeLimit()));
    }

    /** ✅ Assign Quiz to Students */
    @PreAuthorize("hasAnyAuthority('INSTRUCTOR', 'ADMIN')")
    @PostMapping("/assign")
    public ResponseEntity<?> assignQuiz(@RequestBody java.util.Map<String, Object> payload) {
        try {
            Long quizId = Long.valueOf(payload.get("quizId").toString());
            List<Integer> studentIdInts = (List<Integer>) payload.get("studentIds");
            List<Long> studentIds = studentIdInts.stream().map(Long::valueOf).collect(java.util.stream.Collectors.toList());
            
            quizService.assignQuiz(quizId, studentIds);
            return ResponseEntity.ok("Quiz assigned successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to assign: " + e.getMessage());
        }
    }

    /** ✅ GET all student attempts (For the Instructor Reports Page) */
    @PreAuthorize("hasAnyAuthority('INSTRUCTOR', 'ADMIN')")
    @GetMapping("/attempts")
    public ResponseEntity<List<QuizAttempt>> getAllAttempts() {
        return ResponseEntity.ok(quizService.getAllAttempts());
    }

    @PreAuthorize("hasAnyAuthority('INSTRUCTOR', 'ADMIN')")
    @GetMapping("/topic/{topicId}")
    public ResponseEntity<List<Quiz>> getQuizzesByTopic(@PathVariable Long topicId) {
        return ResponseEntity.ok(quizService.getQuizzesByTopic(topicId));
    }

    // =========================================================================
    // STUDENT & PUBLIC ENDPOINTS
    // =========================================================================

    /** ✅ GET all available quizzes for the Student Lobby */
    @PreAuthorize("hasAnyAuthority('STUDENT', 'INSTRUCTOR', 'ADMIN')")
    @GetMapping("/all")
    public ResponseEntity<List<Quiz>> getQuizzesForStudents() {
        return ResponseEntity.ok(quizService.getAllQuizzes());
    }

    /** ✅ Get Quiz by Public Display ID (Used by TakeQuiz.jsx) */
    @PreAuthorize("hasAnyAuthority('STUDENT', 'INSTRUCTOR', 'ADMIN')")
    @GetMapping("/public/{displayId}")
    public ResponseEntity<Quiz> getPublicQuiz(@PathVariable String displayId) {
        return quizService.findByDisplayId(displayId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /** ✅ Submit Quiz Score (Detailed) */
    @PreAuthorize("hasAuthority('STUDENT')")
    @PostMapping("/submit-attempt")

    public ResponseEntity<?> submitAttempt(@RequestBody com.skillforge.dto.QuizSubmissionRequest request) {
        if (request.getUserId() == null || request.getQuizId() == null) {
            return ResponseEntity.badRequest().body("User ID and Quiz ID are required.");
        }
        return ResponseEntity.ok(quizService.submitQuiz(request));
    }


    @Autowired
    private com.skillforge.repository.UserRepository userRepository;

    /** ✅ Get Student Adaptive Stats (Matches Node Logic) */
    @PreAuthorize("hasAuthority('STUDENT')")
    @GetMapping("/stats")
    public ResponseEntity<?> getStats(java.security.Principal principal) {
        String username = principal.getName();
        return userRepository.findByUsername(username)
            .map(user -> ResponseEntity.ok(quizService.getStudentStats(user.getId())))
            .orElse(ResponseEntity.notFound().build());
    }

    /** * ✅ FIXED: Get history for a specific student */
    @PreAuthorize("hasAnyAuthority('STUDENT', 'INSTRUCTOR', 'ADMIN')")
    @GetMapping("/user-attempts/{userId}")
    public ResponseEntity<List<QuizAttempt>> getUserAttempts(@PathVariable Long userId) {
        List<QuizAttempt> attempts = quizService.getAttemptsByUserId(userId);
        return ResponseEntity.ok(attempts);
    }


    /** ✅ Delete Quiz */
    @PreAuthorize("hasAnyAuthority('INSTRUCTOR', 'ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteQuiz(@PathVariable Long id) {
        quizService.deleteQuiz(id);
        return ResponseEntity.ok().build();
    }

    /** ✅ Add Question to Quiz */
    @PreAuthorize("hasAnyAuthority('INSTRUCTOR', 'ADMIN')")
    @PostMapping("/{quizId}/question")
    public ResponseEntity<Question> addQuestion(@PathVariable Long quizId, @RequestBody Question question) {
        return ResponseEntity.ok(quizService.addQuestionToQuiz(quizId, question));
    }

    /** ✅ Update Question */
    @PreAuthorize("hasAnyAuthority('INSTRUCTOR', 'ADMIN')")
    @PutMapping("/question/{id}")
    public ResponseEntity<Question> updateQuestion(@PathVariable Long id, @RequestBody Question question) {
        return ResponseEntity.ok(quizService.updateQuestion(id, question));
    }

    /** ✅ Delete Question */
    @PreAuthorize("hasAnyAuthority('INSTRUCTOR', 'ADMIN')")
    @DeleteMapping("/question/{id}")
    public ResponseEntity<?> deleteQuestion(@PathVariable Long id) {
        quizService.deleteQuestion(id);
        return ResponseEntity.ok().build();
    }
}