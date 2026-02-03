package com.management.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "documents")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString(callSuper = true, exclude = {"admin", "customer"})
public class Documents extends BaseEntity {

    @Column(name = "doc_name", nullable = false)
    private String docName;

    @Column(name = "doc_type")
    private String docType;

    @Column(name = "uploaded_date")
    private LocalDate uploadedDate;

    @Column(name = "verified_date")
    private LocalDate verifiedDate;

    @Column(name = "doc_status")
    private String docStatus;

    // ✅ which admin verified / manages this doc
    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_id")
    private Admin admin;
    
    @Column(name="file_path", length=500)
    private String filePath;


    // ✅ which customer uploaded / owns this doc
    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cust_id")
    private Customer customer;
}
