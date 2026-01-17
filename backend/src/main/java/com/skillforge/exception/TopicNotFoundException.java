package com.skillforge.exception;

public class TopicNotFoundException extends RuntimeException {
    public TopicNotFoundException(Long id) {
        super("Topic not found with id: " + id);
    }

    public TopicNotFoundException(String message) {
        super(message);
    }
}
