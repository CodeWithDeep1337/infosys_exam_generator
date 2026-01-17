package com.skillforge.controllers;

import com.skillforge.model.*;
import com.skillforge.repository.CourseRepository;
import com.skillforge.repository.EnrollmentRepository;
import com.skillforge.repository.QuizAttemptRepository;
import com.skillforge.repository.QuizSubmissionRepository;
import com.skillforge.repository.SubjectRepository;
import com.skillforge.repository.TopicRepository;
import com.skillforge.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/instructor")
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:3001" }) // Allow both default and active port
public class InstructorController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private QuizAttemptRepository quizAttemptRepository;

    @Autowired
    private com.skillforge.repository.QuizRepository quizRepository;

    @Autowired
    private QuizSubmissionRepository quizSubmissionRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private SubjectRepository subjectRepository;

    @Autowired
    private TopicRepository topicRepository;

    @GetMapping("/dashboard-stats/{instructorId}")
    public ResponseEntity<?> getDashboardStats(@PathVariable Long instructorId) {
        Map<String, Object> stats = new HashMap<>();
        
        // Filter by Instructor
        stats.put("courses", courseRepository.findByInstructor_Id(instructorId).size());
        stats.put("subjects", subjectRepository.findByInstructorId(instructorId).size());
        stats.put("topics", topicRepository.findBySubject_Course_Instructor_Id(instructorId).size());
        stats.put("quizzes", quizRepository.findByCreatedBy(instructorId).size());
        stats.put("students", enrollmentRepository.countByInstructorId(instructorId));
        
        List<Course> recentCourses = courseRepository.findTop5ByInstructor_IdOrderByCreatedAtDesc(instructorId);
        stats.put("recentCourses", recentCourses);

        return ResponseEntity.ok(stats);
    }


    @GetMapping("/student/{studentId}/details")
    public ResponseEntity<?> getStudentDetails(@PathVariable Long studentId) {
        User student = userRepository.findById(studentId)
                .orElse(null);
        if (student == null) {
            return ResponseEntity.notFound().build();
        }

        // 1. Enrollments (Course Progress)
        List<Enrollment> enrollments = enrollmentRepository.findByUserId(studentId);
        List<Map<String, Object>> courseProgress = enrollments.stream().map(enrollment -> {
            Map<String, Object> map = new HashMap<>();
            map.put("courseId", enrollment.getCourse().getId());
            map.put("courseTitle", enrollment.getCourse().getTitle());
            map.put("progress", enrollment.getProgress());
            map.put("status", enrollment.getProgress() == 100 ? "Completed" : "In Progress");
            return map;
        }).collect(Collectors.toList());

        // 2. Quiz History
        List<QuizAttempt> attempts = quizAttemptRepository.findByUserIdOrderByTimestampDesc(studentId);
        List<Map<String, Object>> quizHistory = attempts.stream().map(attempt -> {
            Map<String, Object> map = new HashMap<>();
            map.put("attemptId", attempt.getId());
            map.put("quizTitle", getQuizTitle(attempt.getQuizId())); // Helper needed or fetch quiz
            // We define score logic, if pending review, etc.
            map.put("score", attempt.getScore());
            map.put("status", attempt.getStatus());
            map.put("date", attempt.getTimestamp());
            return map;
        }).collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("studentName", student.getName());
        response.put("email", student.getEmail());
        response.put("courseProgress", courseProgress);
        response.put("quizHistory", quizHistory);

        return ResponseEntity.ok(response);
    }
    
    // Helper to get Quiz Title (Inefficient n+1 but works for now, or join in repo)
    private String getQuizTitle(Long quizId) {
       // Ideally we would have Quiz object in Attempt or fetch it.
       // For this demo let's Mock or assumes simple lookup if Repository available.
       return "Quiz #" + quizId; // Placeholder to avoid wiring QuizRepo just for this if not needed
    }

    @GetMapping("/reports")
    public ResponseEntity<?> getInstructorReports() {
        List<QuizAttempt> attempts = quizAttemptRepository.findAll();
        List<Map<String, Object>> reports = attempts.stream().map(a -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", a.getId());
            map.put("userId", a.getUserId());
            
            User u = userRepository.findById(a.getUserId()).orElse(null);
            map.put("username", u != null ? u.getName() : "Unknown");

            com.skillforge.model.Quiz q = quizRepository.findById(a.getQuizId()).orElse(null);
            map.put("title", q != null ? q.getTitle() : "Quiz #" + a.getQuizId());

            map.put("status", a.getStatus());
            map.put("score", a.getScore());
            map.put("completed_at", a.getCompletedAt()); // Ensure formatting in frontend
            return map;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(reports);
    }

    @GetMapping("/quiz/attempt/{attemptId}")

    public ResponseEntity<?> getQuizAttemptDetails(@PathVariable Long attemptId) {
        QuizAttempt attempt = quizAttemptRepository.findById(attemptId)
                .orElseThrow(() -> new RuntimeException("Attempt not found"));
        
        List<QuizSubmission> submissions = quizSubmissionRepository.findByAttemptId(attemptId);
        
        return ResponseEntity.ok(submissions);
    }

    @PostMapping("/grade")
    public ResponseEntity<?> gradeSubmission(@RequestBody Map<String, Object> payload) {
        Long submissionId = Long.valueOf(payload.get("submissionId").toString());
        Integer marks = Integer.valueOf(payload.get("marks").toString());
        
        QuizSubmission submission = quizSubmissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found"));
        
        submission.setMarks(marks);
        submission.setIsGraded(true);
        quizSubmissionRepository.save(submission);
        
        // Update Total Score for Attempt
        QuizAttempt attempt = submission.getAttempt();
        updateAttemptScore(attempt);
        
        return ResponseEntity.ok("Graded successfully");
    }

    private void updateAttemptScore(QuizAttempt attempt) {
        List<QuizSubmission> submissions = quizSubmissionRepository.findByAttemptId(attempt.getId());
        int totalScore = submissions.stream().mapToInt(QuizSubmission::getMarks).sum();
        
        // CHECK IF ALL GRADED
        boolean allGraded = submissions.stream().allMatch(QuizSubmission::getIsGraded);
        
        attempt.setScore(totalScore);
        if (allGraded) {
            attempt.setStatus("COMPLETED");
        } else {
             // Keep as PENDING_REVIEW if not all graded? Or COMPLETED? 
             // Logic: If Instructor updates strict marks, set COMPLETED.
        }
        quizAttemptRepository.save(attempt);
    }

    @PostMapping("/grade-attempt-score")
    public ResponseEntity<?> gradeAttemptScore(@RequestBody Map<String, Object> payload) {
        Long attemptId = Long.valueOf(payload.get("attemptId").toString());
        Integer newScore = Integer.valueOf(payload.get("newScore").toString());
        
        QuizAttempt attempt = quizAttemptRepository.findById(attemptId)
             .orElseThrow(() -> new RuntimeException("Attempt not found"));
        
        attempt.setScore(newScore);
        attempt.setStatus("COMPLETED"); 
        quizAttemptRepository.save(attempt);
        
        return ResponseEntity.ok("Score updated");
    }

}
