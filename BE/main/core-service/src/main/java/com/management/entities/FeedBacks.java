package com.management.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "feedbacks")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString(exclude = {"customer"})
public class FeedBacks extends BaseEntity {

    @Column(name = "rating")
    private Integer rating; // 1-5

    @Column(name = "comment", length = 1000)
    private String comment;

    @Column(name = "feedback_date")
    private LocalDate feedbackDate;

    // ========= RELATIONS =========

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "cust_id")
    private Customer customer;
}
