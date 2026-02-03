package com.management.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "referrals")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString(exclude = {"customer"})
public class Referrals extends BaseEntity {

    @Column(name = "referred_email")
    private String referredEmail;

    @Column(name = "referral_code")
    private String referralCode;

    @Column(name = "referral_status")
    private String referralStatus; // PENDING / COMPLETED

    @Column(name = "referral_date")
    private LocalDate referralDate;

    // ========= RELATIONS =========

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "cust_id")
    private Customer customer;
}
