package com.management.service;

import com.management.entities.FeedBacks;

import java.time.LocalDate;
import java.util.List;

public interface FeedbackService {

    // Customer side: gives feedback
    FeedBacks createFeedback(FeedBacks feedback);

    // Admin side: views all / one / deletes / filters
    List<FeedBacks> getAllFeedbacks();

    FeedBacks getFeedbackById(Long id);

    void deleteFeedback(Long id);

    // For "Filters" requirement in ERD
    List<FeedBacks> getFeedbacksFiltered(LocalDate fromDate, LocalDate toDate);
}
