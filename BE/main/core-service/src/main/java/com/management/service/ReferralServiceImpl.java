package com.management.service;

import com.management.entities.Referrals;
import com.management.repository.ReferralRepository;
import com.management.custom_exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReferralServiceImpl implements ReferralService {

    @Autowired
    private ReferralRepository referralRepository;

    // ================= CREATE =================
    @Override
    public Referrals createReferral(Referrals referral) {
        // Customer creates a referral
        return referralRepository.save(referral);
    }

    // ================= READ =================
    @Override
    public List<Referrals> getAllReferrals() {
        return referralRepository.findAll();
    }

    @Override
    public Referrals getReferralById(Long id) {
        return referralRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Referral not found with id: " + id));
    }

    // ================= UPDATE =================
    @Override
    public Referrals updateReferralStatus(Long id, String status) {

        Referrals existingReferral = referralRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Referral not found with id: " + id));

        // ✅ Correct field name
        existingReferral.setReferralStatus(status);

        return referralRepository.save(existingReferral);
    }

    // ================= DELETE =================
    @Override
    public void deleteReferral(Long id) {

        Referrals referral = referralRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Referral not found with id: " + id));

        referralRepository.delete(referral);
    }
}
