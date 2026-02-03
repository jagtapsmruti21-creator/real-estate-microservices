package com.management.repository;

import com.management.entities.Documents;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DocumentRepository extends JpaRepository<Documents, Long> {
    List<Documents> findByCustomerCustId(Long customerId);
    List<Documents> findByDocStatus(String docStatus); // optional, for pending queue
}
