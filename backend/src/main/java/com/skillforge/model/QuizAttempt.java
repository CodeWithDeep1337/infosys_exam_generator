package com.skillforge.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "quiz_attempts")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuizAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    // Use Long quizId if you want a simple reference, or @ManyToOne Quiz quiz
    @Column(name = "quiz_id", nullable = false)
    private Long quizId;

    private Integer score;
    private Integer totalQuestions;

    // ✅ This MUST be named 'timestamp' to match sort? Re-mapped to created_at usually.
    // Ideally we rename to createdAt, but keeping existing for compatibility.
    @Column(name = "created_at")
    private LocalDateTime timestamp = LocalDateTime.now();

    @Column(name = "status")
    private String status = "PENDING";

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    // Constructor for Service use
    public QuizAttempt(Long userId, Long quizId, Integer score, Integer totalQuestions) {
        this.userId = userId;
        this.quizId = quizId;
        this.score = score;
        this.totalQuestions = totalQuestions;
        this.timestamp = LocalDateTime.now();
        this.status = "COMPLETED"; // Legacy constructor assumes completion?
        this.completedAt = LocalDateTime.now();
    }
}