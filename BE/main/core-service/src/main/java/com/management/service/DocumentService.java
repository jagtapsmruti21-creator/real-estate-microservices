package com.management.service;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import com.management.entities.Customer;
import com.management.entities.Documents;

public interface DocumentService {

    // Customer uploads document
    Documents uploadDocument(Documents document);

    // Admin responsibilities
    List<Documents> getAllDocuments();

    Documents getDocumentById(Long id);

    // Admin verifies document (sets status, verified_date)
    Documents verifyDocument(Long id, Documents document);

    // Optional: delete document (if you ever need it)
    void deleteDocument(Long id);
    
    
    
    Documents uploadDocument(Customer customer, String docName, String docType, MultipartFile file);

    List<Documents> getDocumentsByCustomerId(Long customerId);
    
    


}
