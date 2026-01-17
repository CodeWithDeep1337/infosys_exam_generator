package com.skillforge.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "quizzes")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Quiz {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "display_id", unique = true, nullable = false)
    private String displayId; // ✅ This must match findByDisplayId in the Repository

    @Column(nullable = false)
    private String title;

    @Column(name = "topic_id", nullable = false)
    private Long topicId;

    @Column(name = "created_by")
    private Long createdBy;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "time_limit")
    private Integer timeLimit; // Time limit in minutes

    @OneToMany(mappedBy = "quiz", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Question> questions = new ArrayList<>();

    @PrePersist
    public void generateId() {
        if (this.displayId == null) {
            this.displayId = "QZ-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        }
    }

    // Custom helper for bidirectional relationship
    public void setQuestions(List<Question> questions) {
        this.questions = questions;
        if (questions != null) {
            for (Question q : questions) {
                q.setQuiz(this);
            }
        }
    }
}