package com.skillforge.dto;

/**
 * AuthResponse Record
 * Sent to frontend after successful login
 */
public record AuthResponse(
        Long id,           // Unique user ID
        String username,   // ✅ REQUIRED (DB aligned)
        String token,      // JWT Bearer token
        String role,       // Role-based routing
        String email,      // Profile display
        String name        // Dashboard greeting
) {}
