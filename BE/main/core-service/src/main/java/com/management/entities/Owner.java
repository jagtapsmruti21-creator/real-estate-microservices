package com.management.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.management.user.AppUser;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "owner")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString(callSuper = true, exclude = {"projects", "user"})
public class Owner extends BaseEntity {

    @Column(name = "owner_name", nullable = false)
    private String ownerName;

    @Column(name = "contact_no")
    private String contactNo;

    // ✅ Login credentials are ONLY in AppUser
    @OneToOne(optional = false)
    @JoinColumn(name = "user_id", unique = true, nullable = false)
    private AppUser user;

    @JsonIgnore
    @OneToMany(mappedBy = "owner", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RealEstateProjects> projects = new ArrayList<>();
}
