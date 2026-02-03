package com.management.dto;

import com.management.user.Role;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class RegisterRequest {
    private String fullName;
    private String email;
    private String password;
    private Role role;

    // ✅ extra fields for CUSTOMER/OWNER
    private String phoneNo;     // for customer
    private String gender;      // for customer (store string)
    private LocalDate dob;      // for customer

    private String contactNo;   // for owner (optional)
}
