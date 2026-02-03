package com.management.service;

import com.management.entities.Bookings;
import com.management.repository.BookingRepository;
import com.management.custom_exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BookingServiceImpl implements BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    // ================= CREATE =================
    @Override
    public Bookings createBooking(Bookings booking) {
        // Customer books a real estate project
        return bookingRepository.save(booking);
    }

    // ================= READ =================
    @Override
    public List<Bookings> getAllBookings() {
        return bookingRepository.findAll();
    }

    @Override
    public Bookings getBookingById(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Booking not found with id: " + id));
    }

    // ================= UPDATE =================
    @Override
    public Bookings updateBooking(Long id, Bookings updatedBooking) {

        Bookings existingBooking = bookingRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Booking not found with id: " + id));

        // ✅ ONLY fields that exist in entity
        existingBooking.setBookingDate(updatedBooking.getBookingDate());
        existingBooking.setStatus(updatedBooking.getStatus());
        existingBooking.setTotalPrice(updatedBooking.getTotalPrice());

        /*
         * Important design choice:
         * We usually DO NOT change customer or project from admin side
         * Uncomment only if your business allows it
         */
        // existingBooking.setCustomer(updatedBooking.getCustomer());
        // existingBooking.setRealEstateProjects(updatedBooking.getRealEstateProjects());

        return bookingRepository.save(existingBooking);
    }

    // ================= DELETE =================
    @Override
    public void deleteBooking(Long id) {

        Bookings booking = bookingRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Booking not found with id: " + id));

        bookingRepository.delete(booking);
    }

    // ================= BUSINESS ACTION =================
    @Override
    public Bookings updateBookingStatus(Long id, String status) {

        Bookings booking = bookingRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Booking not found with id: " + id));

        booking.setStatus(status);
        return bookingRepository.save(booking);
    }
}
