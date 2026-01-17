package com.skillforge.dto;

import lombok.Data;

@Data
public class SubjectRequestDTO {
    private String name;
    private Long courseId;
    private Long instructorId;
    private String description;
}