package com.management.payments;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class PaymentDto {

    private Long pid;
    private Long customerId;

    // old/manual fields (keep)
    private double advPayment;
    private double remainPayment;
    private double totalPaid;
    private String modeOfPayment;

    // new/gateway fields (so you can show in UI)
    private double amount;
    private String currency;
    private String paymentStatus;
    private String gateway;
    private String gatewayOrderId;
    private String gatewayPaymentId;
    private Long bookingId;

    public PaymentDto() {}

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

    public Long getBookingId() { return bookingId; }
    public void setBookingId(Long bookingId) { this.bookingId = bookingId; }
}
