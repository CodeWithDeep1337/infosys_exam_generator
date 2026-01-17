package com.skillforge.service;

import com.skillforge.model.Quiz;
import com.skillforge.model.Question;
import com.skillforge.model.QuizAttempt;
import com.skillforge.repository.QuizRepository;
import com.skillforge.repository.QuizAttemptRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;
import java.util.Optional;
import java.util.UUID;

@Service
public class QuizService {

    @Autowired
    private QuizRepository quizRepository;

    @Autowired
    private QuizAttemptRepository quizAttemptRepository;

    @Autowired
    private com.skillforge.repository.QuizSubmissionRepository quizSubmissionRepository;

    @Autowired
    private com.skillforge.repository.QuestionRepository questionRepository;


    /** * ✅ Generates a quiz with a unique Display ID to avoid duplicates.
     * Required by QuizController.
     */
    @Transactional
    public Quiz generateAndSave(String title, Long topicId, Integer timeLimit) {
        Quiz quiz = new Quiz();
        quiz.setTitle(title);
        quiz.setTopicId(topicId);
        quiz.setTimeLimit(timeLimit != null ? timeLimit : 10); // Default to 10 mins

        // Using UUID ensures we NEVER get a duplicate ID error in the database
        quiz.setDisplayId("QZ-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());

        List<Question> simulatedQuestions = new ArrayList<>();
        for (int i = 1; i <= 5; i++) {
            Question q = new Question();
            q.setQuiz(quiz);
            q.setQuestionText("Simulated Question #" + i + " for " + title + "?");
            q.setOptionA("Option Alpha");
            q.setOptionB("Option Beta");
            q.setOptionC("Option Gamma");
            q.setOptionD("Option Delta");
            q.setCorrectOption("A");
            simulatedQuestions.add(q);
        }

        quiz.setQuestions(simulatedQuestions);
        return quizRepository.save(quiz);
    }

    public List<Quiz> getAllQuizzes() {
        return quizRepository.findAll();
    }

    public List<Quiz> getQuizzesByInstructor(Long instructorId) {
        return quizRepository.findByCreatedBy(instructorId);
    }

    public Optional<Quiz> findByDisplayId(String displayId) {
        return quizRepository.findByDisplayId(displayId);
    }

    public List<QuizAttempt> getAttemptsByUserId(Long userId) {
        // Matches the updated repository method name
        return quizAttemptRepository.findByUserIdOrderByTimestampDesc(userId);
    }

    public QuizAttempt saveAttempt(QuizAttempt attempt) {
        if (attempt.getTimestamp() == null) {
            attempt.setTimestamp(LocalDateTime.now());
        }
        return quizAttemptRepository.save(attempt);
    }

    @Transactional
    public QuizAttempt submitQuiz(com.skillforge.dto.QuizSubmissionRequest request) {
        QuizAttempt attempt = new QuizAttempt();
        attempt.setUserId(request.getUserId());
        attempt.setQuizId(request.getQuizId());
        attempt.setTimestamp(LocalDateTime.now());
        attempt.setStatus("PENDING_REVIEW"); // Default until auto-graded or instructor review
        
        // Save Attempt first to get ID
        attempt = quizAttemptRepository.save(attempt);

        int totalScore = 0;
        int totalQuestions = 0;
        boolean allAutoGraded = true;

        for (com.skillforge.dto.QuizSubmissionRequest.AnswerRequest answerReq : request.getAnswers()) {
            totalQuestions++;
            com.skillforge.model.QuizSubmission submission = new com.skillforge.model.QuizSubmission();
            submission.setAttempt(attempt);
            
            Question q = questionRepository.findById(answerReq.getQuestionId()).orElse(null);
            submission.setQuestion(q);
            submission.setAnswerText(answerReq.getAnswer());

            // AUTO GRADING LOGIC
            if (q != null) {
                if (q.getQuestionType() == com.skillforge.model.QuestionType.MCQ || 
                    q.getQuestionType() == com.skillforge.model.QuestionType.TRUE_FALSE) {
                    
                    if (q.getCorrectOption() != null && q.getCorrectOption().equalsIgnoreCase(answerReq.getAnswer())) {
                        submission.setMarks(1); // Assuming 1 mark per question
                        totalScore++;
                    } else {
                        submission.setMarks(0);
                    }
                    submission.setIsGraded(true);
                } else {
                    // Short Answer -> Pending
                    submission.setMarks(0);
                    submission.setIsGraded(false);
                    allAutoGraded = false;
                }
            }
            quizSubmissionRepository.save(submission);
        }

        attempt.setScore(totalScore);
        attempt.setTotalQuestions(totalQuestions);
        if (allAutoGraded) {
            attempt.setStatus("COMPLETED");
        }
        
        return quizAttemptRepository.save(attempt);
    }


    public List<QuizAttempt> getAllAttempts() {
        return quizAttemptRepository.findAll();
    }

    public List<Quiz> getQuizzesByTopic(Long topicId) {
        return quizRepository.findByTopicId(topicId);
    }

    /** ✅ Assign Quiz to Students (Creates PENDING attempts) */
    @Transactional
    public void assignQuiz(Long quizId, List<Long> studentIds) {
        for (Long studentId : studentIds) {
            // Check if already assigned or completed? Assuming allowed re-assign or check exists.
            QuizAttempt attempt = new QuizAttempt();
            attempt.setUserId(studentId);
            attempt.setQuizId(quizId);
            attempt.setStatus("PENDING");
            attempt.setTimestamp(LocalDateTime.now());
            // Score null
            attempt.setTotalQuestions(0); // Set when taking? Or from quiz.
            
            quizAttemptRepository.save(attempt);
        }
    }

    public java.util.Map<String, Object> getStudentStats(Long userId) {
        // Use the Repository method we verified exists
        List<QuizAttempt> attempts = quizAttemptRepository.findByUserIdAndStatus(userId, "COMPLETED");
        
        int totalAttempts = attempts.size();
        if (totalAttempts == 0) {
           return java.util.Map.of(
                "totalAttempts", 0,
                "averageScore", 0,
                "recommendation", "Start with our Basic Math Quiz!",
                "nextDifficulty", "Easy",
                "statusMessage", "Beginner",
                "progressColor", "muted"
            );
        }

        double totalScore = attempts.stream().mapToInt(QuizAttempt::getScore).sum();
        double avg = totalScore / totalAttempts;
        
        String recommendation;
        String nextDifficulty;
        String statusMessage;
        String progressColor;

        if (avg < 50) {
            recommendation = "Focus on foundational concepts.";
            nextDifficulty = "Easy";
            statusMessage = "Needs Improvement";
            progressColor = "danger";
        } else if (avg < 80) {
            recommendation = "Good job! Try tackling more complex problems.";
            nextDifficulty = "Medium";
            statusMessage = "Good";
            progressColor = "warning";
        } else {
            recommendation = "Excellent! You are ready for advanced challenges.";
            nextDifficulty = "Hard";
            statusMessage = "Master";
            progressColor = "success";
        }

        return java.util.Map.of(
            "totalAttempts", totalAttempts,
            "averageScore", (int) avg,
            "recommendation", recommendation,
            "nextDifficulty", nextDifficulty,
            "statusMessage", statusMessage,
            "progressColor", progressColor
        );
    }

    @Transactional
    public void deleteQuiz(Long quizId) {
        quizRepository.deleteById(quizId);
    }

    @Transactional
    public Question addQuestionToQuiz(Long quizId, Question question) {
        Quiz quiz = quizRepository.findById(quizId).orElseThrow(() -> new RuntimeException("Quiz not found"));
        question.setQuiz(quiz);
        return questionRepository.save(question);
    }

    @Transactional
    public Question updateQuestion(Long questionId, Question questionData) {
        Question q = questionRepository.findById(questionId).orElseThrow(() -> new RuntimeException("Question not found"));
        q.setQuestionText(questionData.getQuestionText());
        q.setOptionA(questionData.getOptionA());
        q.setOptionB(questionData.getOptionB());
        q.setOptionC(questionData.getOptionC());
        q.setOptionD(questionData.getOptionD());
        q.setCorrectOption(questionData.getCorrectOption());
        // q.setPoints(questionData.getPoints()); // Assuming points exist in Question entity or generic 1
        q.setQuestionType(questionData.getQuestionType()); // Ensure this is copied
        return questionRepository.save(q);
    }

    @Transactional
    public void deleteQuestion(Long questionId) {
        questionRepository.deleteById(questionId);
    }
}