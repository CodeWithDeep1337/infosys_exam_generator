package com.skillforge.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CourseDTO {
    private Long id;
    private String title;
    private String description;
    private String difficulty;
    private Integer duration;
    private Long instructorId;
    private String instructorName;
    private LocalDateTime createdAt;
}