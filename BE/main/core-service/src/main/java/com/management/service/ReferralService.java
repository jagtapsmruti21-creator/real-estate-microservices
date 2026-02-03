package com.management.service;

import com.management.entities.Referrals;

import java.util.List;

public interface ReferralService {

    // Customer side – creates a referral
    Referrals createReferral(Referrals referral);

    // Admin side – monitors referrals
    List<Referrals> getAllReferrals();

    Referrals getReferralById(Long id);

    // Optional: Admin can update referral status (e.g. APPROVED / REJECTED / USED)
    Referrals updateReferralStatus(Long id, String status);

    // Optional: delete referral record
    void deleteReferral(Long id);
}
