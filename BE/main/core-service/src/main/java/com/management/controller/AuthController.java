package com.management.controller;

import com.management.dto.AuthRequest;
import com.management.dto.AuthResponse;
import com.management.dto.MeResponse;
import com.management.dto.RegisterRequest;
import com.management.entities.Admin;
import com.management.entities.Customer;
import com.management.entities.Owner;
import com.management.security.JwtUtil;
import com.management.user.AppUser;
import com.management.user.Role;
import com.management.user.UserRepository;
import com.management.repository.AdminRepository;
import com.management.repository.CustomerRepository;
import com.management.repository.OwnerRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    private final AdminRepository adminRepository;
    private final OwnerRepository ownerRepository;
    private final CustomerRepository customerRepository;

    public AuthController(AuthenticationManager authenticationManager,
                          JwtUtil jwtUtil,
                          UserRepository userRepository,
                          PasswordEncoder passwordEncoder,
                          AdminRepository adminRepository,
                          OwnerRepository ownerRepository,
                          CustomerRepository customerRepository) {
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.adminRepository = adminRepository;
        this.ownerRepository = ownerRepository;
        this.customerRepository = customerRepository;
    }

    // ========================= REGISTER =========================
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest req) {

        if (userRepository.existsByEmail(req.getEmail())) {
            return ResponseEntity.badRequest().body("Email already exists");
        }

        // ✅ Create AppUser (login identity)
        AppUser user = AppUser.builder()
                .fullName(req.getFullName())
                .email(req.getEmail())
                .password(passwordEncoder.encode(req.getPassword()))
                .role(req.getRole())
                .build();

        user = userRepository.save(user);

        // ✅ Create profile table row based on role and LINK user_id
        if (req.getRole() == Role.ADMIN) {

            Admin admin = new Admin();
            admin.setFullName(req.getFullName());
            admin.setUser(user);
            adminRepository.save(admin);

        } else if (req.getRole() == Role.OWNER) {

            Owner owner = new Owner();
            owner.setOwnerName(req.getFullName());

            // ✅ Save owner contact no if provided in RegisterRequest
            owner.setContactNo(req.getContactNo());

            owner.setUser(user);
            ownerRepository.save(owner);

        } else if (req.getRole() == Role.CUSTOMER) {

            Customer customer = new Customer();
            customer.setCustName(req.getFullName());

            // ✅ Save customer details if provided in RegisterRequest
            customer.setPhoneNo(req.getPhoneNo());
            customer.setGender(req.getGender());
            customer.setDob(req.getDob());

            customer.setUser(user);
            customerRepository.save(customer);

        } else {
            return ResponseEntity.badRequest().body("Invalid role");
        }

        return ResponseEntity.ok("Registered: " + user.getRole());
    }

    // ========================= LOGIN =========================
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest req) {

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword())
        );

        AppUser user = userRepository.findByEmail(req.getEmail()).orElseThrow();

        var userDetails = org.springframework.security.core.userdetails.User
                .withUsername(user.getEmail())
                .password(user.getPassword())
                .roles(user.getRole().name())
                .build();

        String token = jwtUtil.generateToken(userDetails);

        return ResponseEntity.ok(new AuthResponse(token, user.getRole().name(), user.getEmail()));
    }

    // ========================= ME =========================
    @GetMapping("/me")
    public ResponseEntity<MeResponse> me(org.springframework.security.core.Authentication authentication) {

        // email is stored as username in Spring Security
        String email = authentication.getName();

        AppUser user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));

        Role role = user.getRole();
        Long profileId;

        if (role == Role.CUSTOMER) {

            Customer customer = customerRepository.findByUserEmail(email)
                    .orElseThrow(() -> new RuntimeException("Customer profile not found for: " + email));
            profileId = customer.getCustId();

        } else if (role == Role.OWNER) {

            Owner owner = ownerRepository.findByUserEmail(email)
                    .orElseThrow(() -> new RuntimeException("Owner profile not found for: " + email));
            profileId = owner.getId(); // Owner extends BaseEntity

        } else { // ADMIN

            Admin admin = adminRepository.findByUserEmail(email)
                    .orElseThrow(() -> new RuntimeException("Admin profile not found for: " + email));
            profileId = admin.getId(); // Admin likely extends BaseEntity too
        }

        return ResponseEntity.ok(new MeResponse(email, role.name(), profileId));
    }
}
