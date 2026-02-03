package com.management.controller;

import com.management.dto.OwnerBookingDto;
import com.management.dto.StatusUpdateRequest;
import com.management.entities.Bookings;
import com.management.entities.Customer;
import com.management.entities.Documents;
import com.management.entities.Owner;
import com.management.entities.RealEstateProjects;
import com.management.payments.PaymentClient;
import com.management.payments.PaymentDto;
import com.management.repository.BookingRepository;
import com.management.service.DocumentService;
import com.management.service.OwnerService;
import com.management.service.RealEstateProjectsService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/owner")
public class OwnerController {

    @Autowired
    private OwnerService ownerService;

    @Autowired
    private RealEstateProjectsService realEstateProjectsService;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private DocumentService documentService;

    @Autowired
    private PaymentClient paymentClient;

    @GetMapping("/test")
    public String ownerOnly() {
        return "OWNER API working";
    }

    // ========== Owner self-management ==========

    // Register new owner (Owner side, not Admin)
    @PostMapping("/register")
    public ResponseEntity<Owner> registerOwner(@RequestBody Owner owner) {
        Owner saved = ownerService.createOwner(owner);
        return ResponseEntity.ok(saved);
    }

    // Get owner profile
    @GetMapping("/{ownerId}")
    public ResponseEntity<Owner> getOwnerProfile(@PathVariable Long ownerId) {
        return ResponseEntity.ok(ownerService.getOwnerById(ownerId));
    }

    // Update owner profile
    @PutMapping("/{ownerId}")
    public ResponseEntity<Owner> updateOwnerProfile(
            @PathVariable Long ownerId,
            @RequestBody Owner owner
    ) {
        return ResponseEntity.ok(ownerService.updateOwner(ownerId, owner));
    }

    // ========== Owner -> Projects ==========

    // Owner creates a project
    @PostMapping("/{ownerId}/projects")
    public ResponseEntity<RealEstateProjects> createProjectForOwner(
            @PathVariable Long ownerId,
            @RequestBody RealEstateProjects project
    ) {
        RealEstateProjects saved = realEstateProjectsService.createProjectForOwner(ownerId, project);
        return ResponseEntity.ok(saved);
    }

    // Get all projects for this owner
    @GetMapping("/{ownerId}/projects")
    public ResponseEntity<List<RealEstateProjects>> getProjectsForOwner(@PathVariable Long ownerId) {
        return ResponseEntity.ok(realEstateProjectsService.getProjectsByOwner(ownerId));
    }

    // Update a specific project of this owner
    @PutMapping("/{ownerId}/projects/{projectId}")
    public ResponseEntity<RealEstateProjects> updateOwnerProject(
            @PathVariable Long ownerId,
            @PathVariable Long projectId,
            @RequestBody RealEstateProjects project
    ) {
        RealEstateProjects updated =
                realEstateProjectsService.updateProjectOfOwner(ownerId, projectId, project);
        return ResponseEntity.ok(updated);
    }

    // Delete a specific project of this owner
    @DeleteMapping("/{ownerId}/projects/{projectId}")
    public ResponseEntity<String> deleteOwnerProject(
            @PathVariable Long ownerId,
            @PathVariable Long projectId
    ) {
        realEstateProjectsService.deleteProjectOfOwner(ownerId, projectId);
        return ResponseEntity.ok("Project deleted successfully");
    }

    // ======================================
    // Owner -> Bookings (for owner's projects)
    // ======================================

    @GetMapping("/{ownerId}/bookings")
    public ResponseEntity<List<OwnerBookingDto>> getBookingsForOwner(
            @RequestHeader("Authorization") String authorization,
            @PathVariable Long ownerId
    ) {
        // ✅ FIX: don't modify 'authorization' (lambda needs effectively-final)
        final String authHeader = normalizeBearer(authorization);

        List<Bookings> bookings = bookingRepository.findByRealEstateProjects_Owner_Id(ownerId);

        List<OwnerBookingDto> dto = bookings.stream().map(b -> {
            OwnerBookingDto d = new OwnerBookingDto();

            d.setBookingId(b.getId());
            d.setBookingDate(b.getBookingDate());
            d.setStatus(b.getStatus());
            d.setTotalPrice(b.getTotalPrice());

            if (b.getRealEstateProjects() != null) {
                d.setProjectId(b.getRealEstateProjects().getId());
                d.setProjName(b.getRealEstateProjects().getProjName());
                d.setProjectPrice(b.getRealEstateProjects().getPrice());
            }

            if (b.getCustomer() != null) {
                d.setCustomerId(b.getCustomer().getCustId());
                d.setCustomerName(b.getCustomer().getCustName());
                d.setCustomerPhone(b.getCustomer().getPhoneNo());
            }

            // payment summary from payment-service (SUCCESS only)
            double paid = 0.0;
            try {
                List<PaymentDto> payments = paymentClient.getPaymentsByBookingId(authHeader, b.getId());
                if (payments != null) {
                    paid = payments.stream()
                            .filter(p -> p != null
                                    && p.getPaymentStatus() != null
                                    && "SUCCESS".equalsIgnoreCase(p.getPaymentStatus()))
                            .mapToDouble(p -> {
                                // prefer amount if present, else advPayment
                                double amt = p.getAmount();
                                if (amt > 0) return amt;
                                return p.getAdvPayment();
                            })
                            .sum();
                }
            } catch (Exception ex) {
                // ignore payment-service errors; owner can still see bookings
            }

            d.setTotalPaid(paid);

            double total = (b.getTotalPrice() != null ? b.getTotalPrice() : 0.0);
            d.setRemaining(Math.max(0.0, total - paid));

            return d;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(dto);
    }

    // ======================================
    // Owner -> Customer Documents (for a booking)
    // ======================================

    @GetMapping("/{ownerId}/bookings/{bookingId}/documents")
    public ResponseEntity<List<Documents>> getDocumentsForBookingCustomer(
            @PathVariable Long ownerId,
            @PathVariable Long bookingId
    ) {
        Bookings booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found: " + bookingId));

        // owner can view docs only for bookings under their projects
        if (booking.getRealEstateProjects() == null
                || booking.getRealEstateProjects().getOwner() == null
                || booking.getRealEstateProjects().getOwner().getId() == null
                || !booking.getRealEstateProjects().getOwner().getId().equals(ownerId)) {
            throw new RuntimeException("You are not allowed to view documents for this booking");
        }

        Customer customer = booking.getCustomer();
        if (customer == null || customer.getCustId() == null) {
            return ResponseEntity.ok(List.of());
        }

        return ResponseEntity.ok(documentService.getDocumentsByCustomerId(customer.getCustId()));
    }

    @PutMapping("/{ownerId}/documents/{docId}/verify")
    public ResponseEntity<Documents> ownerVerifyCustomerDocument(
            @PathVariable Long ownerId,
            @PathVariable Long docId,
            @RequestBody StatusUpdateRequest req
    ) {
        Documents doc = documentService.getDocumentById(docId);

        if (doc.getCustomer() == null || doc.getCustomer().getCustId() == null) {
            throw new RuntimeException("Document has no customer attached");
        }

        // owner can verify only if this customer has at least one booking under owner's projects
        List<Bookings> ownerBookings = bookingRepository.findByRealEstateProjects_Owner_Id(ownerId);

        boolean allowed = ownerBookings.stream()
                .anyMatch(b -> b.getCustomer() != null
                        && b.getCustomer().getCustId() != null
                        && b.getCustomer().getCustId().equals(doc.getCustomer().getCustId()));

        if (!allowed) {
            throw new RuntimeException("You are not allowed to verify this customer's documents");
        }

        Documents input = new Documents();
        input.setDocStatus(req.getStatus());

        return ResponseEntity.ok(documentService.verifyDocument(docId, input));
    }

    // ================= Helpers =================

    private String normalizeBearer(String authorization) {
        if (authorization == null) return null;
        String trimmed = authorization.trim();
        if (!trimmed.regionMatches(true, 0, "Bearer ", 0, 7)) {
            return "Bearer " + trimmed;
        }
        return trimmed;
    }
}
