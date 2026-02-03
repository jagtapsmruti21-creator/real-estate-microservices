package com.management.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.management.dto.CustomerProjectDto;
import com.management.entities.Bookings;
import com.management.entities.Customer;
import com.management.entities.Documents;
import com.management.entities.FeedBacks;
import com.management.entities.Referrals;
import com.management.entities.RealEstateProjects;
import com.management.logging.ExternalLogClient;
import com.management.payments.CreateOrderRequest;
import com.management.payments.CreateOrderResponse;
import com.management.payments.PaymentClient;
import com.management.payments.PaymentDto;
import com.management.payments.VerifyPaymentRequest;
import com.management.repository.RealEstateProjectsRepository;
import com.management.service.BookingService;
import com.management.service.CustomerService;
import com.management.service.DocumentService;
import com.management.service.FeedbackService;
import com.management.service.ReferralService;
import com.management.service.RealEstateProjectsService;

@RestController
@RequestMapping("/api/customer")
public class CustomerController {

    @Autowired
    private CustomerService customerService;

    @Autowired
    private BookingService bookingService;

    @Autowired
    private DocumentService documentService;

    @Autowired
    private FeedbackService feedbackService;

    @Autowired
    private ReferralService referralService;

    @Autowired
    private RealEstateProjectsService realEstateProjectsService;

    @Autowired
    private RealEstateProjectsRepository realEstateProjectsRepository;

    @Autowired
    private PaymentClient paymentClient;

    @Autowired
    private ExternalLogClient externalLogClient;

    @GetMapping("/test")
    public String customerOnly() {
        return "CUSTOMER API working";
    }

    // ======================================
    // Customer Profile
    // ======================================

    @GetMapping("/{customerId}")
    public ResponseEntity<Customer> getCustomerProfile(@PathVariable Long customerId) {
        return ResponseEntity.ok(customerService.getCustomerById(customerId));
    }

    @PutMapping("/{customerId}")
    public ResponseEntity<Customer> updateCustomerProfile(
            @PathVariable Long customerId,
            @RequestBody Customer customer) {

        Customer updated = customerService.updateCustomer(customerId, customer);
        return ResponseEntity.ok(updated);
    }

    // ======================================
    // Projects (Customer can view all owner projects)
    // ======================================

    @GetMapping("/projects")
    public ResponseEntity<List<CustomerProjectDto>> getAllProjectsForCustomer() {

        List<RealEstateProjects> projects = realEstateProjectsRepository.findAllWithOwner();

        List<CustomerProjectDto> dto = projects.stream().map(p ->
                new CustomerProjectDto(
                        p.getId(),
                        p.getProjName(),
                        p.getAddress(),
                        p.getDescription(),
                        p.getPrice(),
                        (p.getOwner() != null ? p.getOwner().getId() : null),
                        (p.getOwner() != null ? p.getOwner().getOwnerName() : null)
                )
        ).collect(Collectors.toList());

        return ResponseEntity.ok(dto);
    }

    // ======================================
    // Bookings
    // ======================================

    // Create booking for a customer (without project)
    @PostMapping("/{customerId}/bookings")
    public ResponseEntity<Bookings> createBookingForCustomer(
            @PathVariable Long customerId,
            @RequestBody Bookings booking) {

        Customer customer = customerService.getCustomerById(customerId);
        booking.setCustomer(customer);

        Bookings saved = bookingService.createBooking(booking);
        return ResponseEntity.ok(saved);
    }

    // ✅ Create booking for a specific project (property)  (ONLY ONCE!)
    @PostMapping("/{customerId}/projects/{projectId}/bookings")
    public ResponseEntity<Bookings> bookProjectForCustomer(
            @PathVariable Long customerId,
            @PathVariable Long projectId,
            @RequestBody Bookings booking
    ) {
        Customer customer = customerService.getCustomerById(customerId);
        RealEstateProjects project = realEstateProjectsService.getProjectById(projectId);

        booking.setCustomer(customer);
        booking.setRealEstateProjects(project);

        // If totalPrice not provided, auto-fill from project price
        if (booking.getTotalPrice() == null) {
            booking.setTotalPrice(project.getPrice());
        }

        // Default status
        if (booking.getStatus() == null || booking.getStatus().isBlank()) {
            booking.setStatus("PENDING");
        }

        Bookings saved = bookingService.createBooking(booking);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/{customerId}/bookings")
    public ResponseEntity<List<Bookings>> getBookingsForCustomer(@PathVariable Long customerId) {

        List<Bookings> all = bookingService.getAllBookings();

        List<Bookings> customerBookings = all.stream()
                .filter(b -> b.getCustomer() != null
                        && b.getCustomer().getCustId() != null
                        && b.getCustomer().getCustId().equals(customerId))
                .collect(Collectors.toList());

        return ResponseEntity.ok(customerBookings);
    }

    // ======================================
    // Documents (✅ MULTIPART UPLOAD)
    // ======================================

    @PostMapping(
            value = "/{customerId}/documents",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<Documents> uploadDocumentForCustomer(
            @PathVariable Long customerId,
            @RequestParam("docName") String docName,
            @RequestParam("docType") String docType,
            @RequestParam("file") MultipartFile file
    ) {
        Customer customer = customerService.getCustomerById(customerId);
        Documents saved = documentService.uploadDocument(customer, docName, docType, file);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/{customerId}/documents")
    public ResponseEntity<List<Documents>> getDocumentsForCustomer(@PathVariable Long customerId) {
        customerService.getCustomerById(customerId); // validation
        return ResponseEntity.ok(documentService.getDocumentsByCustomerId(customerId));
    }

    // ======================================
    // Feedbacks
    // ======================================

    @PostMapping("/{customerId}/feedbacks")
    public ResponseEntity<FeedBacks> createFeedbackForCustomer(
            @PathVariable Long customerId,
            @RequestBody FeedBacks feedback) {

        Customer customer = customerService.getCustomerById(customerId);
        feedback.setCustomer(customer);

        FeedBacks saved = feedbackService.createFeedback(feedback);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/{customerId}/feedbacks")
    public ResponseEntity<List<FeedBacks>> getFeedbacksForCustomer(@PathVariable Long customerId) {

        List<FeedBacks> all = feedbackService.getAllFeedbacks();

        List<FeedBacks> customerFeedbacks = all.stream()
                .filter(f -> f.getCustomer() != null
                        && f.getCustomer().getCustId() != null
                        && f.getCustomer().getCustId().equals(customerId))
                .collect(Collectors.toList());

        return ResponseEntity.ok(customerFeedbacks);
    }

    // ======================================
    // Referrals
    // ======================================

    @PostMapping("/{customerId}/referrals")
    public ResponseEntity<Referrals> createReferralForCustomer(
            @PathVariable Long customerId,
            @RequestBody Referrals referral) {

        Customer customer = customerService.getCustomerById(customerId);
        referral.setCustomer(customer);

        Referrals saved = referralService.createReferral(referral);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/{customerId}/referrals")
    public ResponseEntity<List<Referrals>> getReferralsForCustomer(@PathVariable Long customerId) {

        List<Referrals> all = referralService.getAllReferrals();

        List<Referrals> customerReferrals = all.stream()
                .filter(r -> r.getCustomer() != null
                        && r.getCustomer().getCustId() != null
                        && r.getCustomer().getCustId().equals(customerId))
                .collect(Collectors.toList());

        return ResponseEntity.ok(customerReferrals);
    }

    // ======================================
    // Payments
    // ======================================

    // OLD (manual) payment create - keep for now so nothing breaks
    @PostMapping("/{customerId}/payments")
    public ResponseEntity<PaymentDto> createPaymentForCustomer(
            @RequestHeader("Authorization") String authorization,
            @PathVariable Long customerId,
            @RequestBody PaymentDto payment) {

        return ResponseEntity.ok(paymentClient.createCustomerPayment(authorization, customerId, payment));
    }

    // Customer payment history
    @GetMapping("/{customerId}/payments")
    public ResponseEntity<List<PaymentDto>> getPaymentsForCustomer(
            @RequestHeader("Authorization") String authorization,
            @PathVariable Long customerId) {

        return ResponseEntity.ok(paymentClient.getCustomerPayments(authorization, customerId));
    }

    // ✅ NEW: Gateway create-order
    @PostMapping("/{customerId}/payments/create-order")
    public ResponseEntity<CreateOrderResponse> createOrder(
            @RequestHeader("Authorization") String authorization,
            @PathVariable Long customerId,
            @RequestBody CreateOrderRequest req
    ) {
        if (authorization != null && !authorization.regionMatches(true, 0, "Bearer ", 0, 7)) {
            authorization = "Bearer " + authorization.trim();
        }
        return ResponseEntity.ok(paymentClient.createOrder(authorization, customerId, req));
    }

    @PostMapping("/{customerId}/payments/verify")
    public ResponseEntity<PaymentDto> verify(
            @RequestHeader("Authorization") String authorization,
            @PathVariable Long customerId,
            @RequestBody VerifyPaymentRequest req
    ) {
        if (authorization != null && !authorization.regionMatches(true, 0, "Bearer ", 0, 7)) {
            authorization = "Bearer " + authorization.trim();
        }
        return ResponseEntity.ok(paymentClient.verifyPayment(authorization, customerId, req));
    }
}
