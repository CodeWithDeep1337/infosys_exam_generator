package com.skillforge.repository;

import com.skillforge.model.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubjectRepository extends JpaRepository<Subject, Long> {

    @Query("SELECT s FROM Subject s WHERE s.course.id = :courseId")
    List<Subject> findByCourseId(@Param("courseId") Long courseId);

    // FIXED: Now uses s.instructor.id instead of s.instructorId
    @Query("SELECT s FROM Subject s WHERE s.instructor.id = :instructorId")
    List<Subject> findByInstructorId(@Param("instructorId") Long instructorId);
}