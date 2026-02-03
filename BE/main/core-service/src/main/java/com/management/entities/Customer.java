package com.management.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.management.user.AppUser;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "customer")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString(exclude = {"bookings", "feedbacks", "referrals", "user"})
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "cust_id")
    private Long custId;

    @Column(name = "cust_name", nullable = false)
    private String custName;

    @Column(name = "phone_no")
    private String phoneNo;

    private String gender;
    private LocalDate dob;

    // ✅ Login credentials are ONLY in AppUser
    @OneToOne(cascade = CascadeType.MERGE)
    @JoinColumn(name = "user_id", unique = true, nullable = false)
    private AppUser user;

    // ========= RELATIONS =========

    @JsonIgnore
    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Bookings> bookings = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<FeedBacks> feedbacks = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Referrals> referrals = new ArrayList<>();
}
