package com.management.repository;

import com.management.entities.FeedBacks;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface FeedbackRepository extends JpaRepository<FeedBacks, Long> {

    // ✅ Correct: field name is feedbackDate in FeedBacks entity
    List<FeedBacks> findByFeedbackDateBetween(LocalDate startDate, LocalDate endDate);
}
