package com.management.repository;

import com.management.entities.RealEstateProjects;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RealEstateProjectsRepository extends JpaRepository<RealEstateProjects, Long> {

    // for owner side
    List<RealEstateProjects> findByOwner_Id(Long ownerId);

    // customer side (avoid lazy init): fetch owner in same query
    @Query("select p from RealEstateProjects p join fetch p.owner")
    List<RealEstateProjects> findAllWithOwner();

}