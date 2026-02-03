package com.management.payment;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long pid;

    @Column(name = "cust_id", nullable = false)
    private Long customerId;

    // -------------------------
    // OLD FIELDS (keep for now)
    // -------------------------
    @Column(name = "adv_payment")
    private double advPayment;

    @Column(name = "remain_payment")
    private double remainPayment;

    @Column(name = "total_paid")
    private double totalPaid;

    @Column(name = "mode_of_payment")
    private String modeOfPayment;

    // -------------------------
    // NEW GATEWAY FIELDS
    // -------------------------

    // Amount for THIS payment transaction (what customer pays now)
    @Column(name = "amount", nullable = false)
    private double amount;

    @Column(name = "currency", nullable = false)
    private String currency = "INR";

    // CREATED / SUCCESS / FAILED
    @Column(name = "payment_status", nullable = false)
    private String paymentStatus = "CREATED";

    // Which gateway used: RAZORPAY, CASHFREE, etc.
    @Column(name = "gateway")
    private String gateway = "RAZORPAY";

    // Razorpay order_id
    @Column(name = "gateway_order_id")
    private String gatewayOrderId;

    // Razorpay payment_id
    @Column(name = "gateway_payment_id")
    private String gatewayPaymentId;

    // Razorpay signature
    @Column(name = "gateway_signature")
    private String gatewaySignature;

    // Optional (recommended): which booking/project this payment is for
    @Column(name = "booking_id")
    private Long bookingId;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    public Payment() {}

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // -------------------------
    // Getters & Setters
    // -------------------------

    public Long getPid() { return pid; }
    public void setPid(Long pid) { this.pid = pid; }

    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }

    public double getAdvPayment() { return advPayment; }
    public void setAdvPayment(double advPayment) { this.advPayment = advPayment; }

    public double getRemainPayment() { return remainPayment; }
    public void setRemainPayment(double remainPayment) { this.remainPayment = remainPayment; }

    public double getTotalPaid() { return totalPaid; }
    public void setTotalPaid(double totalPaid) { this.totalPaid = totalPaid; }

    public String getModeOfPayment() { return modeOfPayment; }
    public void setModeOfPayment(String modeOfPayment) { this.modeOfPayment = modeOfPayment; }

    public double getAmount() { return amount; }
    public void setAmount(double amount) { this.amount = amount; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }

    public String getGateway() { return gateway; }
    public void setGateway(String gateway) { this.gateway = gateway; }

    public String getGatewayOrderId() { return gatewayOrderId; }
    public void setGatewayOrderId(String gatewayOrderId) { this.gatewayOrderId = gatewayOrderId; }

    public String getGatewayPaymentId() { return gatewayPaymentId; }
    public void setGatewayPaymentId(String gatewayPaymentId) { this.gatewayPaymentId = gatewayPaymentId; }

    public String getGatewaySignature() { return gatewaySignature; }
    public void setGatewaySignature(String gatewaySignature) { this.gatewaySignature = gatewaySignature; }

    public Long getBookingId() { return bookingId; }
    public void setBookingId(Long bookingId) { this.bookingId = bookingId; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
