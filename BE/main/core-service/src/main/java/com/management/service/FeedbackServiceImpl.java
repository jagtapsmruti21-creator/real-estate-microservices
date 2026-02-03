package com.management.service;

import com.management.custom_exception.ResourceNotFoundException;
import com.management.entities.FeedBacks;
import com.management.repository.FeedbackRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class FeedbackServiceImpl implements FeedbackService {

    @Autowired
    private FeedbackRepository feedbackRepository;

    // ================= CREATE =================
    @Override
    public FeedBacks createFeedback(FeedBacks feedback) {

        // Auto set feedback date if not provided
        if (feedback.getFeedbackDate() == null) {
            feedback.setFeedbackDate(LocalDate.now());
        }

        return feedbackRepository.save(feedback);
    }

    // ================= READ =================
    @Override
    public List<FeedBacks> getAllFeedbacks() {
        return feedbackRepository.findAll();
    }

    @Override
    public FeedBacks getFeedbackById(Long id) {
        return feedbackRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Feedback not found with id: " + id));
    }

    // ================= DELETE =================
    @Override
    public void deleteFeedback(Long id) {
        FeedBacks feedback = feedbackRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Feedback not found with id: " + id));

        feedbackRepository.delete(feedback);
    }

    // ================= FILTER =================
    @Override
    public List<FeedBacks> getFeedbacksFiltered(LocalDate fromDate, LocalDate toDate) {

        // If no filter provided, just return all
        if (fromDate == null || toDate == null) {
            return feedbackRepository.findAll();
        }

        return feedbackRepository.findByFeedbackDateBetween(fromDate, toDate);
    }
}
