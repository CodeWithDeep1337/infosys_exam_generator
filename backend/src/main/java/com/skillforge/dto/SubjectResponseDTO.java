package com.skillforge.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class SubjectResponseDTO {
    private Long id;
    private String name;
    private String description;
    private Long courseId;
    private String courseTitle;
    private Long instructorId;
    private String instructorName;
    private LocalDateTime createdAt;
}