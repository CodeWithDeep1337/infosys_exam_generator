package com.skillforge.controllers;

import com.skillforge.dto.RegisterRequest;
import com.skillforge.dto.LoginRequest;
import com.skillforge.dto.AuthResponse;
import com.skillforge.model.User;
import com.skillforge.repository.UserRepository;
import com.skillforge.service.AuthService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = { "http://localhost:3001" })
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;

    public AuthController(AuthService authService, UserRepository userRepository) {
        this.authService = authService;
        this.userRepository = userRepository;
    }

    /* ===================== REGISTER ===================== */

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest registrationDto) {

        // 1. ✅ AUTO-GENERATE USERNAME IF MISSING
        // If frontend doesn't send 'username', we use the part of the email before '@'
        if (registrationDto.getUsername() == null || registrationDto.getUsername().isBlank()) {
            if (registrationDto.getEmail() != null && registrationDto.getEmail().contains("@")) {
                registrationDto.setUsername(registrationDto.getEmail().split("@")[0]);
            } else {
                return ResponseEntity.badRequest().body(Map.of("message", "Username or valid Email is required"));
            }
        }

        // 2. ✅ VALIDATE PASSWORD
        if (registrationDto.getRawPassword() == null || registrationDto.getRawPassword().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Password is required"));
        }

        try {
            // 3. ✅ MAP DTO TO ENTITY
            User user = new User();
            user.setUsername(registrationDto.getUsername().trim());
            user.setName(registrationDto.getFullName());
            user.setEmail(registrationDto.getEmail());
            user.setPassword(registrationDto.getRawPassword()); // Hashed inside authService.register
            user.setRole(registrationDto.getRole());
            user.setPhone(registrationDto.getPhoneNumber());
            user.setCollege(registrationDto.getCollege());

            authService.register(user);

            return ResponseEntity.status(HttpStatus.CREATED).body(
                    Map.of("message", "User registered successfully"));

        } catch (RuntimeException e) {
            // This catches "User already exists" or "Email already exists" from service
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                    Map.of("message", e.getMessage()));
        }
    }

    /* ===================== LOGIN ===================== */

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        try {
            String token = authService.login(
                    loginRequest.getEmail(),
                    loginRequest.getPassword()
            );

            User user = userRepository.findByEmail(loginRequest.getEmail())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            AuthResponse response = new AuthResponse(
                    user.getId(),
                    user.getUsername(),
                    token,
                    Optional.ofNullable(user.getRole()).orElse("STUDENT").toUpperCase(),
                    user.getEmail(),
                    Optional.ofNullable(user.getName()).orElse("User")
            );

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                    Map.of("message", "Invalid credentials"));
        }
    }
}