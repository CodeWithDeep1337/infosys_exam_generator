package com.skillforge.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data Transfer Object for User Registration.
 * Ensure this file is marked as a 'Source Root' in IntelliJ.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {

    // Unique identifier for the user
    private String username;

    // Maps to 'name' in your React form
    private String fullName;

    // User's email address (also unique in DB)
    private String email;

    /**
     * This annotation allows your React frontend to send "password"
     * while the backend maps it to "rawPassword".
     */
    @JsonProperty("password")
    private String rawPassword;

    private String phoneNumber;

    private String college;

    // Role should be "STUDENT", "INSTRUCTOR", or "ADMIN"
    private String role;
}