package com.skillforge.repository;

import com.skillforge.model.QuizAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, Long> {

    // ✅ This name must match your Model field ('timestamp')
    // AND it must match what your QuizService is calling.
    List<QuizAttempt> findByUserIdOrderByTimestampDesc(Long userId);

    List<QuizAttempt> findByUserIdAndStatus(Long userId, String status);

    long countByUserIdAndStatus(Long userId, String status);
}