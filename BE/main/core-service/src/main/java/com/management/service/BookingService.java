package com.management.service;

import com.management.entities.Bookings;

import java.util.List;

public interface BookingService {

    // For Customer side (Books) – not used in AdminController right now
    Bookings createBooking(Bookings booking);

    // Admin side – Manages bookings
    List<Bookings> getAllBookings();

    Bookings getBookingById(Long id);

    Bookings updateBooking(Long id, Bookings booking);

    void deleteBooking(Long id);

    // Optional: admin-specific action to just update status
    Bookings updateBookingStatus(Long id, String status);
}
