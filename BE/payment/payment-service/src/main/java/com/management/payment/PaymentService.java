package com.management.payment;

import java.util.List;

public interface PaymentService {
    Payment createPayment(Long customerId, Payment payment);
    List<Payment> getPaymentsByCustomerId(Long customerId);

    List<Payment> getAllPayments();

    // booking wise queries
    List<Payment> getPaymentsByBookingId(Long bookingId);
    List<Payment> getPaymentsByCustomerAndBooking(Long customerId, Long bookingId);
    Payment getPaymentById(Long id);
    Payment updatePayment(Long id, Payment updatedPayment);
    void deletePayment(Long id);
    CreateOrderResponse createOrder(Long customerId, CreateOrderRequest req);

    Payment verifyPayment(Long customerId, VerifyPaymentRequest req);
}
