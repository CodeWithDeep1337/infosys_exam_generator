package com.skillforge.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "materials")
public class Material {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "topic_id", nullable = false)
    private Long topicId;

    @Column(nullable = false)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "VARCHAR(50)")
    private MaterialType type;

    @Column(name = "file_path")
    private String filePath;

    @Column
    private String link;

    @Column(name = "file_type")
    private String fileType;

    @Column(name = "uploaded_at", updatable = false)
    private LocalDateTime uploadedAt;

    public enum MaterialType {
        VIDEO, PDF, LINK, YOUTUBE
    }

    @PrePersist
    protected void onCreate() {
        this.uploadedAt = LocalDateTime.now();
    }

    // --- Getters and Setters ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getTopicId() { return topicId; }
    public void setTopicId(Long topicId) { this.topicId = topicId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public MaterialType getType() { return type; }
    public void setType(MaterialType type) { this.type = type; }

    public String getFilePath() { return filePath; }
    public void setFilePath(String filePath) { this.filePath = filePath; }

    public String getLink() { return link; }
    public void setLink(String link) { this.link = link; }

    public String getFileType() { return fileType; }
    public void setFileType(String fileType) { this.fileType = fileType; }

    public LocalDateTime getUploadedAt() { return uploadedAt; }
}