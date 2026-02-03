package com.management.payment;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByCustomerId(Long customerId);
    Optional<Payment> findByGatewayOrderId(String gatewayOrderId);

    List<Payment> findByBookingId(Long bookingId);

    List<Payment> findByCustomerIdAndBookingId(Long customerId, Long bookingId);
}
