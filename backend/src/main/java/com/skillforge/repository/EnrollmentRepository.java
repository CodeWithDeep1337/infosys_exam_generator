package com.skillforge.repository;

import com.skillforge.model.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {
    List<Enrollment> findByUserId(Long userId);
    List<Enrollment> findByCourseId(Long courseId);
    Optional<Enrollment> findByUserIdAndCourseId(Long userId, Long courseId);

    @Query("SELECT COUNT(DISTINCT e.user.id) FROM Enrollment e WHERE e.course.instructor.id = :instructorId")
    Long countByInstructorId(@Param("instructorId") Long instructorId);
}
