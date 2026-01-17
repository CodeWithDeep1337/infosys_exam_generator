package com.skillforge.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "courses")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, length = 20)
    private String difficulty;

    // ✅ FIXED TYPE (important)
    @Column(nullable = false)
    private Integer duration;

    // ===============================
    // INSTRUCTOR
    // ===============================
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "instructor_id", nullable = false)
    @JsonIgnoreProperties({
            "password",
            "courses",
            "subjects",
            "role",
            "email",
            "username"
    })
    private User instructor;

    // ===============================
    // SUBJECTS
    // ===============================
    @OneToMany(
            mappedBy = "course",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    @JsonIgnoreProperties("course") // 🔥 simpler & safer
    private List<Subject> subjects;

    // ===============================
    // CREATED AT
    // ===============================
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
