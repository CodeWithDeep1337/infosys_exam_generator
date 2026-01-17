package com.skillforge.repository;

import com.skillforge.model.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface QuizRepository extends JpaRepository<Quiz, Long> {

    /** ✅ Finds quizzes by Topic ID (Used for instructor management) */
    List<Quiz> findByTopicId(Long topicId);

    /** ✅ Finds quizzes by Creator ID (Instructor) */
    List<Quiz> findByCreatedBy(Long createdBy);

    /** ✅ Finds a specific quiz by its public Display ID (Used for TakeQuiz.jsx) */
    Optional<Quiz> findByDisplayId(String displayId);

    /** ✅ Check if a Display ID already exists (Useful during generation) */
    boolean existsByDisplayId(String displayId);
}