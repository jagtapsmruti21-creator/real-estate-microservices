package com.management.repository;

import com.management.entities.Bookings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Bookings, Long> {

    List<Bookings> findByCustomer_CustId(Long customerId);

    // Owner side: bookings for all projects of owner
    List<Bookings> findByRealEstateProjects_Owner_Id(Long ownerId);

    // Project wise bookings
    List<Bookings> findByRealEstateProjects_Id(Long projectId);
}
