package com.skillforge.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "topics")
@Data
@NoArgsConstructor
public class Topic {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(length = 50)
    private String type; // e.g., "VIDEO", "TEXT", "QUIZ"

    /**
     * ✅ RELATIONAL LINK: This connects the Topic to a specific Subject object.
     * JoinColumn 'subject_id' matches the foreign key column in your MySQL table.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_id", nullable = false)
    @JsonIgnoreProperties("topics") // Prevents infinite recursion back to the Subject
    private Subject subject;

    @org.hibernate.annotations.CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private java.time.LocalDateTime createdAt;
}