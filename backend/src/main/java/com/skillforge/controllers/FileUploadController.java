package com.skillforge.controllers;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@RestController
@RequestMapping("/api/files")
@CrossOrigin(origins = { "http://localhost:3001"})
public class FileUploadController {

    // ✅ Files will be saved in a folder named 'uploads' in your project root
    private final String UPLOAD_DIR = "uploads/";

    @PostMapping("/upload")
    public ResponseEntity<String> uploadFile(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("File is empty. Please select a valid file.");
        }

        try {
            // 1. Ensure the 'uploads' directory exists
            File directory = new File(UPLOAD_DIR);
            if (!directory.exists()) {
                directory.mkdirs();
            }

            // 2. Generate a unique filename to prevent overwriting (using UUID or Timestamp)
            String originalFileName = file.getOriginalFilename();
            String uniqueFileName = System.currentTimeMillis() + "_" + originalFileName;

            // 3. Define the path where the file will be saved
            Path filePath = Paths.get(UPLOAD_DIR + uniqueFileName);

            // 4. Copy the file to the target location
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // 5. Return the unique filename to React
            // React will then send THIS name to your MaterialController to save in the database
            return ResponseEntity.ok(uniqueFileName);

        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Could not upload the file: " + e.getMessage());
        }
    }
}