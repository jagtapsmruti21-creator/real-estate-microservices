package com.management.entities;

import com.management.user.AppUser;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "admin")
@NoArgsConstructor
@Getter
@Setter
@ToString(callSuper = true, exclude = { "managedProjects", "documents", "user" })
public class Admin extends BaseEntity {

    @Column(name = "full_name", nullable = false)
    private String fullName;

    // ✅ Login credentials are ONLY in AppUser, NOT here.
    @OneToOne(optional = false)
    @JoinColumn(name = "user_id", unique = true, nullable = false)
    private AppUser user;

    // Admin 1----*> RealEstateProjects
    @OneToMany(mappedBy = "admin", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RealEstateProjects> managedProjects = new ArrayList<>();

    // Admin 1----*> Documents
    @OneToMany(mappedBy = "admin", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Documents> documents = new ArrayList<>();

    public Admin(String fullName, AppUser user) {
        this.fullName = fullName;
        this.user = user;
    }
}
