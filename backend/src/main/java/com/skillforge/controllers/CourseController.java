package com.skillforge.controllers;

import com.skillforge.dto.CourseDTO;
import com.skillforge.dto.CourseRequestDTO;
import com.skillforge.model.Course;
import com.skillforge.model.User;
import com.skillforge.service.CourseService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/courses")
@CrossOrigin(origins = { "http://localhost:3001" })
public class CourseController {

    private final CourseService courseService;

    public CourseController(CourseService courseService) {
        this.courseService = courseService;
    }

    // ===============================
    // GET ALL COURSES
    // ===============================
    @GetMapping
    public ResponseEntity<List<CourseDTO>> getAllCourses() {
        List<CourseDTO> dtos = courseService.listAll()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    // ===============================
    // GET COURSES BY INSTRUCTOR
    // ===============================
    @GetMapping("/instructor/{instructorId}")
    @PreAuthorize("hasAnyAuthority('INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<List<CourseDTO>> getByInstructor(@PathVariable Long instructorId) {

        List<CourseDTO> dtos = courseService
                .getCoursesByInstructor(instructorId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    // ===============================
    // ADD COURSE (FIXED 415 + AUTH)
    // ===============================
    @PostMapping(consumes = "application/json", produces = "application/json")
    @PreAuthorize("hasAnyAuthority('INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<?> addCourse(@RequestBody CourseRequestDTO dto) {
        try {
            Course course = new Course();
            course.setTitle(dto.getTitle());
            course.setDescription(dto.getDescription());
            course.setDifficulty(dto.getDifficulty());

            // ✅ FIX: Convert String to Integer to match Course model
            if (dto.getDuration() != null) {
                // Extracts only numbers from strings like "6 Months"
                String numericValue = dto.getDuration().replaceAll("[^0-9]", "");
                course.setDuration(numericValue.isEmpty() ? 0 : Integer.parseInt(numericValue));
            }

            if (dto.getInstructorId() != null) {
                User instructor = new User();
                instructor.setId(dto.getInstructorId());
                course.setInstructor(instructor);
            }

            Course savedCourse = courseService.add(course);
            return ResponseEntity.status(201).body(convertToDTO(savedCourse));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    // ===============================
    // DELETE COURSE
    // ===============================
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<?> deleteCourse(@PathVariable Long id) {
        try {
            courseService.delete(id);
            return ResponseEntity.ok(Map.of("message", "Deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    // ===============================
    // UPDATE COURSE
    // ===============================
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<?> updateCourse(@PathVariable Long id, @RequestBody CourseRequestDTO dto) {
        try {
            Course course = courseService.getById(id);
            if (course == null) return ResponseEntity.notFound().build();

            course.setTitle(dto.getTitle());
            course.setDescription(dto.getDescription());
            course.setDifficulty(dto.getDifficulty());

            if (dto.getDuration() != null) {
                String numericValue = dto.getDuration().replaceAll("[^0-9]", "");
                course.setDuration(numericValue.isEmpty() ? 0 : Integer.parseInt(numericValue));
            }

            Course updatedCourse = courseService.add(course);
            return ResponseEntity.ok(convertToDTO(updatedCourse));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    // ===============================
    // ENTITY → DTO
    // ===============================
    private CourseDTO convertToDTO(Course course) {
        CourseDTO dto = new CourseDTO();
        dto.setId(course.getId());
        dto.setTitle(course.getTitle());
        dto.setDescription(course.getDescription());
        dto.setDifficulty(course.getDifficulty());
        dto.setDuration(course.getDuration());
        dto.setCreatedAt(course.getCreatedAt());

        try {
            if (course.getInstructor() != null) {
                dto.setInstructorId(course.getInstructor().getId());
                dto.setInstructorName(course.getInstructor().getName());
            }
        } catch (Exception e) {
            // LazyInitializationException or similar
            System.err.println("Warning: Could not fetch instructor for course " + course.getId() + ": " + e.getMessage());
            dto.setInstructorId(null);
            dto.setInstructorName("Unknown");
        }
        return dto;
    }
}
