package com.skillforge.repository;

import com.skillforge.model.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {

    // Safely finds courses by the ID of the instructor object
    List<Course> findByInstructor_Id(Long instructorId);

    List<Course> findByDifficulty(String difficulty);

    List<Course> findByTitleContainingIgnoreCase(String keyword);

    // ✅ FIX: Match this to your Entity's type (Integer vs String)
    List<Course> findByDuration(Integer duration);

    List<Course> findTop5ByOrderByCreatedAtDesc();

    List<Course> findTop5ByInstructor_IdOrderByCreatedAtDesc(Long instructorId);
}