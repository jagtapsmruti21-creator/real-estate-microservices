package com.management.repository;

import com.management.entities.Referrals;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReferralRepository extends JpaRepository<Referrals, Long> {

    // Later if needed:
    // List<Referrals> findByReferrerUserId(Long referrerUserId);
    // List<Referrals> findByRefStatus(String refStatus);
}
