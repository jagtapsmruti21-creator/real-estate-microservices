package com.management.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "real_estate_projects")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString(callSuper = true, exclude = {"owner", "admin"})
public class RealEstateProjects extends BaseEntity {

    @Column(name = "proj_name", nullable = false)
    private String projName;

    @Column(name = "address")
    private String address;

    @Column(name = "description")
    private String description;

    // ✅ Project price (in INR)
    @Column(name = "price")
    private Double price;

    // Many projects belong to one Owner
    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id")
    private Owner owner;

    // Many projects belong to one Admin (managed by)
    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_id")
    private Admin admin;
}
