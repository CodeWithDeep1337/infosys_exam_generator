package com.skillforge.auth;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;

import javax.sql.DataSource;
import java.sql.*;
import java.util.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    @Autowired
    private DataSource dataSource;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    private final String JWT_SECRET = System.getenv("JWT_SECRET") != null
            ? System.getenv("JWT_SECRET")
            : "skillforge_secret_key";

    // ================= REGISTER =================
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> body) {

        String name = body.get("name");
        String email = body.get("email");
        String password = body.get("password");
        String phone = body.get("phone");
        String college = body.get("college");
        String role = body.get("role");

        if (name == null || email == null || password == null || role == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Name, Email, Password, Role are required"));
        }

        try (Connection conn = dataSource.getConnection()) {

            PreparedStatement check = conn.prepareStatement(
                    "SELECT id FROM users WHERE email = ?");
            check.setString(1, email);
            ResultSet rs = check.executeQuery();

            if (rs.next()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Email already registered"));
            }

            String hashedPassword = passwordEncoder.encode(password);

            PreparedStatement insert = conn.prepareStatement(
                    "INSERT INTO users (name, email, password, phone, college, role) VALUES (?, ?, ?, ?, ?, ?)"
            );

            insert.setString(1, name);
            insert.setString(2, email);
            insert.setString(3, hashedPassword);
            insert.setString(4, phone);
            insert.setString(5, college);
            insert.setString(6, role);

            insert.executeUpdate();

            return ResponseEntity.status(201)
                    .body(Map.of("message", "User registered successfully"));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Registration failed"));
        }
    }

    // ================= LOGIN =================
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {

        String email = body.get("email");
        String password = body.get("password");

        if (email == null || password == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Email and Password required"));
        }

        try (Connection conn = dataSource.getConnection()) {

            PreparedStatement stmt = conn.prepareStatement(
                    "SELECT * FROM users WHERE email = ?");
            stmt.setString(1, email);
            ResultSet rs = stmt.executeQuery();

            if (!rs.next()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Invalid email or password"));
            }

            int id = rs.getInt("id");
            String dbPassword = rs.getString("password");
            String role = rs.getString("role");
            String name = rs.getString("name");

            if (!passwordEncoder.matches(password, dbPassword)) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Invalid email or password"));
            }

            String token = Jwts.builder()
                    .claim("id", id)
                    .claim("name", name)
                    .claim("email", email)
                    .claim("role", role)
                    .setExpiration(new java.util.Date(System.currentTimeMillis() + 3600000))
                    .signWith(SignatureAlgorithm.HS256, JWT_SECRET.getBytes())
                    .compact();

            return ResponseEntity.ok(Map.of(
                    "message", "Login successful",
                    "token", token,
                    "user", Map.of(
                            "id", id,
                            "name", name,
                            "email", email,
                            "role", role
                    )
            ));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Login failed"));
        }
    }

    // ================= DASHBOARD (TEMP PUBLIC) =================
    @GetMapping("/student/dashboard")
    public ResponseEntity<?> studentDashboard() {
        return ResponseEntity.ok(Map.of("message", "Welcome Student Dashboard"));
    }

    @GetMapping("/instructor/dashboard")
    public ResponseEntity<?> instructorDashboard() {
        return ResponseEntity.ok(Map.of("message", "Welcome Instructor Dashboard"));
    }

    @GetMapping("/admin/dashboard")
    public ResponseEntity<?> adminDashboard() {
        return ResponseEntity.ok(Map.of("message", "Welcome Admin Dashboard"));
    }
}
