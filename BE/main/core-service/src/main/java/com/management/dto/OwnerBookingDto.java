package com.management.dto;

import java.time.LocalDate;

public class OwnerBookingDto {
    private Long bookingId;
    private LocalDate bookingDate;
    private String status;
    private Double totalPrice;

    private Long projectId;
    private String projName;
    private Double projectPrice;

    private Long customerId;
    private String customerName;
    private String customerPhone;

    private Double totalPaid;
    private Double remaining;

    public OwnerBookingDto() {}

    public Long getBookingId() { return bookingId; }
    public void setBookingId(Long bookingId) { this.bookingId = bookingId; }

    public LocalDate getBookingDate() { return bookingDate; }
    public void setBookingDate(LocalDate bookingDate) { this.bookingDate = bookingDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Double getTotalPrice() { return totalPrice; }
    public void setTotalPrice(Double totalPrice) { this.totalPrice = totalPrice; }

    public Long getProjectId() { return projectId; }
    public void setProjectId(Long projectId) { this.projectId = projectId; }

    public String getProjName() { return projName; }
    public void setProjName(String projName) { this.projName = projName; }

    public Double getProjectPrice() { return projectPrice; }
    public void setProjectPrice(Double projectPrice) { this.projectPrice = projectPrice; }

    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getCustomerPhone() { return customerPhone; }
    public void setCustomerPhone(String customerPhone) { this.customerPhone = customerPhone; }

    public Double getTotalPaid() { return totalPaid; }
    public void setTotalPaid(Double totalPaid) { this.totalPaid = totalPaid; }

    public Double getRemaining() { return remaining; }
    public void setRemaining(Double remaining) { this.remaining = remaining; }
}
