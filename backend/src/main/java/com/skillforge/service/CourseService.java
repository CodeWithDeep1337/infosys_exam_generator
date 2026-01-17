package com.skillforge.service;

import com.skillforge.model.Course;
import com.skillforge.model.User;
import com.skillforge.repository.CourseRepository;
import com.skillforge.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CourseService {

    private final CourseRepository repo;
    private final UserRepository userRepository;

    public CourseService(CourseRepository repo, UserRepository userRepository) {
        this.repo = repo;
        this.userRepository = userRepository;
    }

    /**
     * ✅ UPDATED: Accepts a Course object to match the Controller.
     */
    @Transactional
    public Course add(Course course) {
        if (course.getInstructor() != null && course.getInstructor().getId() != null) {
            User instructor = userRepository.findById(course.getInstructor().getId())
                    .orElseThrow(() -> new RuntimeException("Instructor not found"));
            course.setInstructor(instructor);
        }
        return repo.save(course);
    }

    public List<Course> listAll() {
        return repo.findAll();
    }

    public List<Course> getCoursesByInstructor(Long instructorId) {
        return repo.findByInstructor_Id(instructorId);
    }

    @Transactional
    public void delete(Long id) {
        repo.deleteById(id);
    }

    public Course getById(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found"));
    }
}