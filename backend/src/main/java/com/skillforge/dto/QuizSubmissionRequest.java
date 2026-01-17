package com.skillforge.dto;

import lombok.Data;
import java.util.List;

@Data
public class QuizSubmissionRequest {
    private Long userId;
    private Long quizId;
    private List<AnswerRequest> answers;

    @Data
    public static class AnswerRequest {
        private Long questionId;
        private String answer;
    }
}
