package com.skillforge.dto;

import lombok.Data;

@Data
public class CourseRequestDTO {
    private String title;
    private String description;
    private String difficulty;
    private String duration; // React sends "3 Months" as a String
    private Long instructorId;
}