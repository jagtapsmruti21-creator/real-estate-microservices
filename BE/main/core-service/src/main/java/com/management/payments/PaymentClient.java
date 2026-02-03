package com.management.payments;


import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@FeignClient(name = "payment-service", url = "${payment.service.url}")
public interface PaymentClient {

    // =====================
    // OLD (manual) endpoints - keep for backward compatibility
    // =====================

    @PostMapping("/api/customer/{customerId}/payments")
    PaymentDto createCustomerPayment(
            @RequestHeader("Authorization") String authorization,
            @PathVariable("customerId") Long customerId,
            @RequestBody PaymentDto payment
    );

    @GetMapping("/api/customer/{customerId}/payments")
    List<PaymentDto> getCustomerPayments(
            @RequestHeader("Authorization") String authorization,
            @PathVariable("customerId") Long customerId
    );

    // =====================
    // NEW (gateway) endpoints
    // =====================

    @PostMapping("/api/customer/{customerId}/payments/create-order")
    CreateOrderResponse createOrder(
            @RequestHeader("Authorization") String authorization,
            @PathVariable("customerId") Long customerId,
            @RequestBody CreateOrderRequest req
    );

    @PostMapping("/api/customer/{customerId}/payments/verify")
    PaymentDto verifyPayment(
            @RequestHeader("Authorization") String authorization,
            @PathVariable("customerId") Long customerId,
            @RequestBody VerifyPaymentRequest req
    );

    // =====================
    // ADMIN endpoints
    // =====================

    // =====================
    // BOOKING-based queries (used by Owner/Admin views)
    // =====================

    @GetMapping("/api/admin/payments/booking/{bookingId}")
    List<PaymentDto> getPaymentsByBookingId(
            @RequestHeader("Authorization") String authorization,
            @PathVariable("bookingId") Long bookingId
    );


    @GetMapping("/api/admin/payments")
    List<PaymentDto> getAllPayments(@RequestHeader("Authorization") String authorization);

    @GetMapping("/api/admin/payments/{id}")
    PaymentDto getPaymentById(
            @RequestHeader("Authorization") String authorization,
            @PathVariable("id") Long id
    );

    @PutMapping("/api/admin/payments/{id}")
    PaymentDto updatePayment(
            @RequestHeader("Authorization") String authorization,
            @PathVariable("id") Long id,
            @RequestBody PaymentDto payment
    );

    @DeleteMapping("/api/admin/payments/{id}")
    void deletePayment(
            @RequestHeader("Authorization") String authorization,
            @PathVariable("id") Long id
    );
}
