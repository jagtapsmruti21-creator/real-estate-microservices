package com.management.controller;

import com.management.entities.Admin;
import com.management.entities.Bookings;
import com.management.entities.Customer;
import com.management.entities.Documents;
import com.management.entities.FeedBacks;
import com.management.entities.Owner;
import com.management.entities.RealEstateProjects;
import com.management.entities.Referrals;
import com.management.payments.PaymentClient;
import com.management.payments.PaymentDto;
import com.management.service.AdminService;
import com.management.service.BookingService;
import com.management.service.CustomerService;
import com.management.service.DocumentService;
import com.management.service.FeedbackService;
import com.management.service.OwnerService;
import com.management.service.RealEstateProjectsService;
import com.management.service.ReferralService;
import com.management.user.AppUser;
import com.management.user.Role;
import com.management.user.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    // ===================== Services =====================

    @Autowired
    private AdminService adminService;

    @Autowired
    private CustomerService customerService;

    @Autowired
    private OwnerService ownerService;

    @Autowired
    private RealEstateProjectsService realEstateProjectsService;

    @Autowired
    private BookingService bookingService;

    @Autowired
    private DocumentService documentService;

    @Autowired
    private FeedbackService feedbackService;

    @Autowired
    private ReferralService referralService;

    @Autowired
    private PaymentClient paymentClient;

    // ✅ Added for linking Customer -> AppUser
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // ===================== Test =====================

    @GetMapping("/test")
    public String adminOnly() {
        return "ADMIN API working";
    }

    // ===================== Admin CRUD =====================

    @PostMapping("/admins")
    public ResponseEntity<Admin> createAdmin(@RequestBody Admin admin) {
        Admin saved = adminService.createAdmin(admin);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/admins")
    public ResponseEntity<List<Admin>> getAllAdmins() {
        return ResponseEntity.ok(adminService.getAllAdmins());
    }

    @GetMapping("/admins/{id}")
    public ResponseEntity<Admin> getAdminById(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.getAdminById(id));
    }

    @PutMapping("/admins/{id}")
    public ResponseEntity<Admin> updateAdmin(@PathVariable Long id, @RequestBody Admin admin) {
        return ResponseEntity.ok(adminService.updateAdmin(id, admin));
    }

    @DeleteMapping("/admins/{id}")
    public ResponseEntity<String> deleteAdmin(@PathVariable Long id) {
        adminService.deleteAdmin(id);
        return ResponseEntity.ok("Admin deleted successfully");
    }

    // ===================== Customer Management (CRUD) =====================

    /**
     * IMPORTANT FIX:
     * Your DB requires customer.user_id NOT NULL.
     * So when Admin creates a Customer, we must also create a users(AppUser) row and link it.
     */
    @PostMapping("/customers")
    public ResponseEntity<?> createCustomer(@RequestBody Customer customer) {

        // 1) basic validation
        if (customer.getCustName() == null || customer.getCustName().isBlank()) {
            return ResponseEntity.badRequest().body("custName is required");
        }
        if (customer.getUser().getEmail() == null || customer.getUser().getEmail().isBlank()) {
            return ResponseEntity.badRequest().body("email is required");
        }
        if (customer.getUser().getPassword() == null || customer.getUser().getPassword().isBlank()) {
            return ResponseEntity.badRequest().body("password is required");
        }

        // 2) ensure email is unique in users table
        if (userRepository.existsByEmail(customer.getUser().getEmail())) {
            return ResponseEntity.badRequest().body("Email already exists");
        }

        // 3) create AppUser for login (users table)
        AppUser user = AppUser.builder()
                .fullName(customer.getCustName())
                .email(customer.getUser().getEmail())
                .password(passwordEncoder.encode(customer.getUser().getPassword()))
                .role(Role.CUSTOMER)
                .build();

        user = userRepository.save(user);

        // 4) link customer -> user (sets customer.user_id)
        customer.setUser(user);

        // Optional: if you DON'T want duplicate password in customer table, uncomment this:
        // customer.setPassword(null);

        Customer saved = customerService.createCustomer(customer);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/customers")
    public ResponseEntity<List<Customer>> getAllCustomers() {
        return ResponseEntity.ok(customerService.getAllCustomers());
    }

    @GetMapping("/customers/{id}")
    public ResponseEntity<Customer> getCustomerById(@PathVariable Long id) {
        return ResponseEntity.ok(customerService.getCustomerById(id));
    }

    @PutMapping("/customers/{id}")
    public ResponseEntity<Customer> updateCustomer(@PathVariable Long id, @RequestBody Customer customer) {
        return ResponseEntity.ok(customerService.updateCustomer(id, customer));
    }

    @DeleteMapping("/customers/{id}")
    public ResponseEntity<String> deleteCustomer(@PathVariable Long id) {
        customerService.deleteCustomer(id);
        return ResponseEntity.ok("Customer deleted successfully");
    }

    // ===================== Owner Management (Read / Update / Delete) =====================

    @GetMapping("/owners")
    public ResponseEntity<List<Owner>> getAllOwners() {
        return ResponseEntity.ok(ownerService.getAllOwners());
    }

    @GetMapping("/owners/{id}")
    public ResponseEntity<Owner> getOwnerById(@PathVariable Long id) {
        return ResponseEntity.ok(ownerService.getOwnerById(id));
    }

    @PutMapping("/owners/{id}")
    public ResponseEntity<Owner> updateOwner(@PathVariable Long id, @RequestBody Owner owner) {
        return ResponseEntity.ok(ownerService.updateOwner(id, owner));
    }

    @DeleteMapping("/owners/{id}")
    public ResponseEntity<String> deleteOwner(@PathVariable Long id) {
        ownerService.deleteOwner(id);
        return ResponseEntity.ok("Owner deleted successfully");
    }

    // ===================== Real Estate Projects Management =====================

    @GetMapping("/projects")
    public ResponseEntity<List<RealEstateProjects>> getAllProjects() {
        return ResponseEntity.ok(realEstateProjectsService.getAllProjects());
    }

    @GetMapping("/projects/{id}")
    public ResponseEntity<RealEstateProjects> getProjectById(@PathVariable Long id) {
        return ResponseEntity.ok(realEstateProjectsService.getProjectById(id));
    }

    @PutMapping("/projects/{id}")
    public ResponseEntity<RealEstateProjects> updateProject(@PathVariable Long id,
                                                            @RequestBody RealEstateProjects project) {
        return ResponseEntity.ok(realEstateProjectsService.updateProject(id, project));
    }

    @DeleteMapping("/projects/{id}")
    public ResponseEntity<String> deleteProject(@PathVariable Long id) {
        realEstateProjectsService.deleteProject(id);
        return ResponseEntity.ok("Project deleted successfully");
    }

    // ===================== Booking Management =====================

    @GetMapping("/bookings")
    public ResponseEntity<List<Bookings>> getAllBookings() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    @GetMapping("/bookings/{id}")
    public ResponseEntity<Bookings> getBookingById(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.getBookingById(id));
    }

    @PutMapping("/bookings/{id}")
    public ResponseEntity<Bookings> updateBooking(@PathVariable Long id,
                                                  @RequestBody Bookings bookings) {
        return ResponseEntity.ok(bookingService.updateBooking(id, bookings));
    }

    @DeleteMapping("/bookings/{id}")
    public ResponseEntity<String> deleteBooking(@PathVariable Long id) {
        bookingService.deleteBooking(id);
        return ResponseEntity.ok("Booking deleted successfully");
    }

    // ===================== Document Management =====================

    @GetMapping("/documents")
    public ResponseEntity<List<Documents>> getAllDocuments() {
        return ResponseEntity.ok(documentService.getAllDocuments());
    }

    @GetMapping("/documents/{id}")
    public ResponseEntity<Documents> getDocumentById(@PathVariable Long id) {
        return ResponseEntity.ok(documentService.getDocumentById(id));
    }

    @PutMapping("/documents/{id}/verify")
    public ResponseEntity<Documents> verifyDocument(@PathVariable Long id,
                                                    @RequestBody Documents document) {
        return ResponseEntity.ok(documentService.verifyDocument(id, document));
    }

    // ===================== Feedback Management =====================

    @GetMapping("/feedbacks")
    public ResponseEntity<List<FeedBacks>> getAllFeedbacks() {
        return ResponseEntity.ok(feedbackService.getAllFeedbacks());
    }

    @GetMapping("/feedbacks/{id}")
    public ResponseEntity<FeedBacks> getFeedbackById(@PathVariable Long id) {
        return ResponseEntity.ok(feedbackService.getFeedbackById(id));
    }

    @DeleteMapping("/feedbacks/{id}")
    public ResponseEntity<String> deleteFeedback(@PathVariable Long id) {
        feedbackService.deleteFeedback(id);
        return ResponseEntity.ok("Feedback deleted successfully");
    }

    // ===================== Referral Management =====================

    @GetMapping("/referrals")
    public ResponseEntity<List<Referrals>> getAllReferrals() {
        return ResponseEntity.ok(referralService.getAllReferrals());
    }

    @GetMapping("/referrals/{id}")
    public ResponseEntity<Referrals> getReferralById(@PathVariable Long id) {
        return ResponseEntity.ok(referralService.getReferralById(id));
    }

    // ===================== Payment Management =====================

    @GetMapping("/payments")
    public ResponseEntity<List<PaymentDto>> getAllPayments(
            @RequestHeader("Authorization") String authorization
    ) {
        return ResponseEntity.ok(paymentClient.getAllPayments(authorization));
    }

    @GetMapping("/payments/{id}")
    public ResponseEntity<PaymentDto> getPaymentById(
            @RequestHeader("Authorization") String authorization,
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(paymentClient.getPaymentById(authorization, id));
    }

    @PutMapping("/payments/{id}")
    public ResponseEntity<PaymentDto> updatePayment(
            @RequestHeader("Authorization") String authorization,
            @PathVariable Long id,
            @RequestBody PaymentDto payment
    ) {
        return ResponseEntity.ok(paymentClient.updatePayment(authorization, id, payment));
    }

    @DeleteMapping("/payments/{id}")
    public ResponseEntity<String> deletePayment(
            @RequestHeader("Authorization") String authorization,
            @PathVariable Long id
    ) {
        paymentClient.deletePayment(authorization, id);
        return ResponseEntity.ok("Payment deleted successfully");
    }
}
