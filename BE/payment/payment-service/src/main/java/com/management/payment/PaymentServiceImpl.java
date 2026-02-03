package com.management.payment;

import java.nio.charset.StandardCharsets;
import java.util.List;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.stereotype.Service;

import com.management.custom_exception.ResourceNotFoundException;

@Service
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final RazorpayGateway razorpayGateway;

    public PaymentServiceImpl(PaymentRepository paymentRepository, RazorpayGateway razorpayGateway) {
        this.paymentRepository = paymentRepository;
        this.razorpayGateway = razorpayGateway;
    }

    // =========================
    // OLD CRUD (keep for now)
    // =========================

    @Override
    public Payment createPayment(Long customerId, Payment payment) {
        payment.setPid(null);
        payment.setCustomerId(customerId);
        return paymentRepository.save(payment);
    }

    @Override
    public List<Payment> getPaymentsByCustomerId(Long customerId) {
        return paymentRepository.findByCustomerId(customerId);
    }


    @Override
    public List<Payment> getPaymentsByBookingId(Long bookingId) {
        return paymentRepository.findByBookingId(bookingId);
    }

    @Override
    public List<Payment> getPaymentsByCustomerAndBooking(Long customerId, Long bookingId) {
        return paymentRepository.findByCustomerIdAndBookingId(customerId, bookingId);
    }

    @Override
    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }

    @Override
    public Payment getPaymentById(Long id) {
        return paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with id: " + id));
    }

    @Override
    public Payment updatePayment(Long id, Payment updatedPayment) {
        Payment existing = getPaymentById(id);

        existing.setAdvPayment(updatedPayment.getAdvPayment());
        existing.setRemainPayment(updatedPayment.getRemainPayment());
        existing.setTotalPaid(updatedPayment.getTotalPaid());
        existing.setModeOfPayment(updatedPayment.getModeOfPayment());

        return paymentRepository.save(existing);
    }

    @Override
    public void deletePayment(Long id) {
        Payment existing = getPaymentById(id);
        paymentRepository.delete(existing);
    }

    // =========================
    // NEW: CREATE ORDER (Gateway)
    // =========================

    @Override
    public CreateOrderResponse createOrder(Long customerId, CreateOrderRequest req) {
        if (customerId == null) throw new IllegalArgumentException("customerId required");
        if (req == null) throw new IllegalArgumentException("request required");
        if (req.getAmount() <= 0) throw new IllegalArgumentException("amount must be > 0");

        String currency = (req.getCurrency() == null || req.getCurrency().isBlank())
                ? "INR"
                : req.getCurrency().trim().toUpperCase();

        try {
            String receipt = "cust_" + customerId + "_" + System.currentTimeMillis();

            com.razorpay.Order order = razorpayGateway.createOrder(req.getAmount(), currency, receipt);
            String orderId = order.get("id");

            Payment p = new Payment();
            p.setCustomerId(customerId);

            // old fields (optional)
            p.setAdvPayment(req.getAmount());
            p.setModeOfPayment("UPI");

            // new gateway fields
            p.setAmount(req.getAmount());
            p.setCurrency(currency);
            p.setPaymentStatus("CREATED");
            p.setGateway("RAZORPAY");
            p.setGatewayOrderId(orderId);
            p.setBookingId(req.getBookingId());

            paymentRepository.save(p);

            return new CreateOrderResponse(orderId, req.getAmount(), currency, razorpayGateway.getKeyId());

        } catch (Exception e) {
            throw new RuntimeException("Failed to create Razorpay order: " + e.getMessage(), e);
        }
    }

    // =========================
    // NEW: VERIFY PAYMENT (Gateway)
    // =========================

    @Override
    public Payment verifyPayment(Long customerId, VerifyPaymentRequest req) {
        if (customerId == null) throw new IllegalArgumentException("customerId required");
        if (req == null) throw new IllegalArgumentException("request required");

        String orderId = req.getOrderId();
        String paymentId = req.getPaymentId();
        String signature = req.getSignature();

        if (orderId == null || orderId.isBlank()) throw new IllegalArgumentException("orderId required");
        if (paymentId == null || paymentId.isBlank()) throw new IllegalArgumentException("paymentId required");
        if (signature == null || signature.isBlank()) throw new IllegalArgumentException("signature required");

        Payment p = paymentRepository.findByGatewayOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Payment record not found for orderId: " + orderId));

        if (!p.getCustomerId().equals(customerId)) {
            throw new RuntimeException("Order does not belong to this customer");
        }

        // ✅ Correct signature check uses KEY SECRET (NOT keyId)
        String payload = orderId + "|" + paymentId;
        String expectedSig = hmacSha256(payload, razorpayGateway.getKeySecret());

        if (!expectedSig.equals(signature)) {
            p.setPaymentStatus("FAILED");
            p.setGatewayPaymentId(paymentId);
            p.setGatewaySignature(signature);
            paymentRepository.save(p);
            throw new RuntimeException("Payment verification failed (signature mismatch)");
        }

        p.setPaymentStatus("SUCCESS");
        p.setGatewayPaymentId(paymentId);
        p.setGatewaySignature(signature);
        // Mode could be UPI/CARD etc – frontend can send later
        if (p.getModeOfPayment() == null || p.getModeOfPayment().isBlank()) {
            p.setModeOfPayment("UPI");
        }

        return paymentRepository.save(p);
    }

    private String hmacSha256(String data, String secret) {
        try {
            Mac sha256Hmac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKey = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            sha256Hmac.init(secretKey);
            byte[] hash = sha256Hmac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return bytesToHex(hash);
        } catch (Exception e) {
            throw new RuntimeException("HMAC error: " + e.getMessage(), e);
        }
    }

    private String bytesToHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder(bytes.length * 2);
        for (byte b : bytes) sb.append(String.format("%02x", b));
        return sb.toString();
    }
}
