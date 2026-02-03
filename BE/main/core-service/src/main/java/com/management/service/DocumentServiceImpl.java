package com.management.service;

import com.management.custom_exception.ResourceNotFoundException;
import com.management.entities.Customer;
import com.management.entities.Documents;
import com.management.logging.ExternalLogClient;
import com.management.repository.DocumentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
public class DocumentServiceImpl implements DocumentService {

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private ExternalLogClient externalLogClient;

    // Folder where files will be stored
    private final Path uploadRoot = Paths.get("uploads", "documents");

    // =========================================================
    // OLD METHOD (JSON upload) - keeps backward compatibility
    // =========================================================
    @Override
    public Documents uploadDocument(Documents document) {

        if (document.getUploadedDate() == null) {
            document.setUploadedDate(LocalDate.now());
        }

        if (document.getDocStatus() == null || document.getDocStatus().isBlank()) {
            document.setDocStatus("PENDING");
        }

        // Customer should never set this
        document.setVerifiedDate(null);

        Documents saved = documentRepository.save(document);

        Long cid = saved.getCustomer() != null ? saved.getCustomer().getCustId() : null;
        externalLogClient.info(
                "CORE_SERVICE",
                "Document uploaded (JSON). DocName=" + saved.getDocName() + ", DocType=" + saved.getDocType(),
                cid
        );

        return saved;
    }

    // =========================================================
    // NEW PRACTICAL METHOD (multipart upload + metadata)
    // =========================================================
    @Override
    public Documents uploadDocument(Customer customer, String docName, String docType, MultipartFile file) {

        if (customer == null) throw new IllegalArgumentException("Customer is required");
        if (docName == null || docName.isBlank()) throw new IllegalArgumentException("docName is required");
        if (docType == null || docType.isBlank()) throw new IllegalArgumentException("docType is required");
        if (file == null || file.isEmpty()) throw new IllegalArgumentException("file is required");

        try {
            Files.createDirectories(uploadRoot);

            String original = (file.getOriginalFilename() == null) ? "document" : file.getOriginalFilename();

            String ext = "";
            int dot = original.lastIndexOf(".");
            if (dot >= 0) ext = original.substring(dot);

            String storedFileName = UUID.randomUUID() + ext;
            Path target = uploadRoot.resolve(storedFileName);

            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

            Documents doc = new Documents();
            doc.setCustomer(customer);
            doc.setDocName(docName);
            doc.setDocType(docType);

            // system-controlled fields
            doc.setDocStatus("PENDING");
            doc.setUploadedDate(LocalDate.now());
            doc.setVerifiedDate(null);

            // ✅ IMPORTANT: save file path in DB
            doc.setFilePath(target.toString().replace("\\", "/"));

            Documents saved = documentRepository.save(doc);

            externalLogClient.info(
                    "CORE_SERVICE",
                    "Customer " + customer.getCustId() + " uploaded document: " + saved.getDocName()
                            + " (" + saved.getDocType() + ") file=" + saved.getFilePath(),
                    customer.getCustId()
            );

            return saved;

        } catch (IOException e) {
            externalLogClient.error(
                    "CORE_SERVICE",
                    "Document upload FAILED for customer " + customer.getCustId()
                            + " docName=" + docName + " docType=" + docType + " error=" + e.getMessage(),
                    customer.getCustId()
            );
            throw new RuntimeException("Failed to upload document: " + e.getMessage(), e);
        }
    }

    // =========================================================
    // READ METHODS
    // =========================================================
    @Override
    public List<Documents> getAllDocuments() {
        return documentRepository.findAll();
    }

    @Override
    public Documents getDocumentById(Long id) {
        return documentRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Document not found with id: " + id));
    }

    @Override
    public List<Documents> getDocumentsByCustomerId(Long customerId) {
        return documentRepository.findByCustomerCustId(customerId);
    }

    // =========================================================
    // ADMIN VERIFY
    // =========================================================
    @Override
    public Documents verifyDocument(Long id, Documents inputDocument) {

        Documents existingDocument = documentRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Document not found with id: " + id));

        String status = inputDocument.getDocStatus();
        if (status == null || status.isBlank()) {
            throw new IllegalArgumentException("docStatus is required for verification");
        }

        existingDocument.setDocStatus(status.trim().toUpperCase());
        existingDocument.setVerifiedDate(LocalDate.now());

        Documents saved = documentRepository.save(existingDocument);

        Long cid = saved.getCustomer() != null ? saved.getCustomer().getCustId() : null;
        externalLogClient.info(
                "CORE_SERVICE",
                "Admin verified docId=" + id + " newStatus=" + saved.getDocStatus(),
                cid
        );

        return saved;
    }

    // =========================================================
    // DELETE
    // =========================================================
    @Override
    public void deleteDocument(Long id) {
        Documents document = documentRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Document not found with id: " + id));

        Long cid = document.getCustomer() != null ? document.getCustomer().getCustId() : null;

        documentRepository.delete(document);

        externalLogClient.warn(
                "CORE_SERVICE",
                "Document deleted. docId=" + id + " docName=" + document.getDocName(),
                cid
        );
    }
}
