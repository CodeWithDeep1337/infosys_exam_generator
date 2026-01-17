package com.skillforge.repository;

import com.skillforge.model.Topic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TopicRepository extends JpaRepository<Topic, Long> {

    // ✅ Use findBySubject_Id to navigate the relationship
    // This tells JPA: Select * from topics where subject_id = ?
    List<Topic> findBySubject_Id(Long subjectId);

    // ✅ Find topics by Instructor ID (Topic -> Subject -> Course -> Instructor)
    List<Topic> findBySubject_Course_Instructor_Id(Long instructorId);
}