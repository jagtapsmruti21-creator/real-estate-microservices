package com.management.payment;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    // CUSTOMER: /api/customer/{customerId}/payments
    @PostMapping("/api/customer/{customerId}/payments")
    public ResponseEntity<Payment> createPaymentForCustomer(
            @PathVariable Long customerId,
            @RequestBody Payment payment
    ) {
        return ResponseEntity.ok(paymentService.createPayment(customerId, payment));
    }

    @GetMapping("/api/customer/{customerId}/payments")
    public ResponseEntity<List<Payment>> getPaymentsForCustomer(
            @PathVariable Long customerId
    ) {
        return ResponseEntity.ok(paymentService.getPaymentsByCustomerId(customerId));
    }

    // ADMIN: /api/admin/payments
    @GetMapping("/api/admin/payments")
    public ResponseEntity<List<Payment>> getAllPayments() {
        return ResponseEntity.ok(paymentService.getAllPayments());
    }


    // ADMIN/OWNER: Payments for a booking (used by Owner/Core-service to compute paid/remaining)
    @GetMapping("/api/admin/payments/booking/{bookingId}")
    public ResponseEntity<List<Payment>> getPaymentsForBooking(@PathVariable Long bookingId) {
        return ResponseEntity.ok(paymentService.getPaymentsByBookingId(bookingId));
    }

    @GetMapping("/api/admin/payments/{id}")
    public ResponseEntity<Payment> getPaymentById(@PathVariable Long id) {
        return ResponseEntity.ok(paymentService.getPaymentById(id));
    }

    @PutMapping("/api/admin/payments/{id}")
    public ResponseEntity<Payment> updatePayment(
            @PathVariable Long id,
            @RequestBody Payment payment
    ) {
        return ResponseEntity.ok(paymentService.updatePayment(id, payment));
    }

    @DeleteMapping("/api/admin/payments/{id}")
    public ResponseEntity<String> deletePayment(@PathVariable Long id) {
        paymentService.deletePayment(id);
        return ResponseEntity.ok("Payment deleted successfully");
    }
    
    @PostMapping("/{customerId}/payments/create-order")
    public ResponseEntity<?> createOrder(
            @RequestHeader(value = "Authorization", required = false) String auth,
            @PathVariable Long customerId,
            @RequestBody CreateOrderRequest req
    ) {
        return ResponseEntity.ok(paymentService.createOrder(customerId, req));
    }


    @PostMapping("/api/customer/{customerId}/payments/verify")
    public ResponseEntity<Payment> verify(
            @PathVariable Long customerId,
            @RequestBody VerifyPaymentRequest req
    ) {
        return ResponseEntity.ok(paymentService.verifyPayment(customerId, req));
    }
}
