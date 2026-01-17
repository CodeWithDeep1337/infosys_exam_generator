package com.skillforge.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class TopicResponseDTO {
    private Long id;
    private String name;
    private String type;
    private String content; // file name or text
    private Long subjectId;
    private String subjectName;
    private LocalDateTime createdAt;
}
