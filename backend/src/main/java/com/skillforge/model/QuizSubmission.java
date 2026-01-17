package com.skillforge.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "quiz_submissions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuizSubmission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Link to the attempt (session)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "attempt_id", nullable = false)
    private QuizAttempt attempt;

    // Link to the specific question
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;

    @Column(columnDefinition = "TEXT")
    private String answerText; // For short answer or selected option

    private Integer marks = 0; // 0 if wrong/ungraded, >0 if correct

    private Boolean isGraded = false; // True if auto-graded or instructor graded
}
