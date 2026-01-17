package com.skillforge.dto;

public class SubjectDTO {
    private String name;
    private Long courseId;
    private Long instructorId;
    private String description;

    // Constructors
    public SubjectDTO() {}

    public SubjectDTO(String name, Long courseId, Long instructorId, String description) {
        this.name = name;
        this.courseId = courseId;
        this.instructorId = instructorId;
        this.description = description;
    }

    // Getters and Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Long getCourseId() { return courseId; }
    public void setCourseId(Long courseId) { this.courseId = courseId; }

    public Long getInstructorId() { return instructorId; }
    public void setInstructorId(Long instructorId) { this.instructorId = instructorId; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}