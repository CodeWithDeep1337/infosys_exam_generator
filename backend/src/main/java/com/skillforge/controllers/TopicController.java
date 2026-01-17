package com.skillforge.controllers;

import com.skillforge.dto.TopicResponseDTO;
import com.skillforge.model.Topic;
import com.skillforge.model.Subject;
import com.skillforge.service.TopicService;
import com.skillforge.repository.SubjectRepository; // ✅ Import SubjectRepository
import org.springframework.beans.factory.annotation.Value; // ✅ Import Value
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/topics")
@CrossOrigin(origins = {"http://localhost:3001"})
public class TopicController {

    private final TopicService service;
    private final SubjectRepository subjectRepository; // ✅ Inject SubjectRepository

    @Value("${file.upload-dir:uploads}") // ✅ Inject uploadDir
    private String uploadDir;

    public TopicController(TopicService service, SubjectRepository subjectRepository) {
        this.service = service;
        this.subjectRepository = subjectRepository;
    }

    @PostMapping(value = "/upload", consumes = {"multipart/form-data"})
    @PreAuthorize("hasAnyAuthority('INSTRUCTOR','ADMIN')")
    public ResponseEntity<?> uploadTopic(
            @RequestParam("name") String name,
            @RequestParam("type") String type,
            @RequestParam("subjectId") Long subjectId,
            @RequestParam(value = "content", required = false) String content,
            @RequestParam(value = "file", required = false) MultipartFile file) {

        if (name == null || subjectId == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Name and Subject ID are required"));
        }

        // ✅ FIX: Fetch Subject entity
        Subject subject = subjectRepository.findById(subjectId)
                .orElse(null);
        
        if (subject == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid Subject ID"));
        }

        Topic topic = new Topic();
        topic.setName(name);
        topic.setType(type);
        topic.setSubject(subject); // ✅ FIX: Set Subject

        try {
            if (file != null && !file.isEmpty()) {
                // ✅ FIX: Implement File Saving Logic
                Path uploadPath = Paths.get(uploadDir);
                if (!Files.exists(uploadPath)) {
                    Files.createDirectories(uploadPath);
                }

                String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
                Path targetPath = uploadPath.resolve(fileName);
                Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

                topic.setContent(fileName); // Save filename in content
            } else {
                topic.setContent(content);
            }
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "File upload failed"));
        }

        try {
            return ResponseEntity.status(201).body(service.add(topic));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Database error: " + e.getMessage()));
        }
    }
    
    // --- EXISTING ENDPOINTS ---

    @PreAuthorize("hasAnyAuthority('STUDENT','INSTRUCTOR','ADMIN')")
    @GetMapping
    public ResponseEntity<List<TopicResponseDTO>> getAllTopics() {
        List<TopicResponseDTO> dtos = service.listAll().stream()
                .map(this::convertToDTO)
                .toList();
        return ResponseEntity.ok(dtos);
    }

    @PreAuthorize("hasAnyAuthority('INSTRUCTOR','ADMIN')")
    @GetMapping("/instructor/{instructorId}")
    public ResponseEntity<List<TopicResponseDTO>> getByInstructor(@PathVariable Long instructorId) {
        List<TopicResponseDTO> dtos = service.getTopicsByInstructor(instructorId).stream()
                .map(this::convertToDTO)
                .toList();
        return ResponseEntity.ok(dtos);
    }

    @PreAuthorize("hasAnyAuthority('STUDENT','INSTRUCTOR','ADMIN')")
    @GetMapping("/subject/{subjectId}")
    public ResponseEntity<List<TopicResponseDTO>> getTopicsBySubject(@PathVariable Long subjectId) {
        List<TopicResponseDTO> dtos = service.listBySubject(subjectId).stream()
                .map(this::convertToDTO)
                .toList();
        return ResponseEntity.ok(dtos);
    }

    @PreAuthorize("hasAnyAuthority('STUDENT','INSTRUCTOR','ADMIN')")
    @GetMapping("/{id}")
    public ResponseEntity<TopicResponseDTO> getTopicById(@PathVariable Long id) {
        return ResponseEntity.ok(convertToDTO(service.getById(id)));
    }

    private TopicResponseDTO convertToDTO(Topic topic) {
        TopicResponseDTO dto = new TopicResponseDTO();
        dto.setId(topic.getId());
        dto.setName(topic.getName());
        dto.setType(topic.getType());
        dto.setContent(topic.getContent());
        dto.setCreatedAt(topic.getCreatedAt());

        try {
            if (topic.getSubject() != null) {
                dto.setSubjectId(topic.getSubject().getId());
                dto.setSubjectName(topic.getSubject().getName());
            }
        } catch (Exception e) { dto.setSubjectName("Unknown"); }
        
        return dto;
    }

    @PreAuthorize("hasAnyAuthority('INSTRUCTOR','ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTopic(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasAnyAuthority('INSTRUCTOR','ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<?> updateTopic(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        try {
            Topic topic = service.getById(id);
            if (topic == null) return ResponseEntity.notFound().build();

            if (payload.containsKey("name")) {
                topic.setName((String) payload.get("name"));
            }
            if (payload.containsKey("type")) {
                topic.setType((String) payload.get("type"));
            }
            if (payload.containsKey("subjectId")) {
                 Long subjectId = Long.valueOf(payload.get("subjectId").toString());
                 Subject subject = subjectRepository.findById(subjectId).orElse(null);
                 if (subject != null) topic.setSubject(subject);
            }
            // Updating content is harder via JSON if it was a file, so we skip that for simple edit

            Topic updated = service.add(topic);
            return ResponseEntity.ok(convertToDTO(updated));
        } catch (Exception e) {
             return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}