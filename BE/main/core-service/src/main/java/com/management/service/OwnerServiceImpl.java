package com.management.service;

import com.management.entities.Owner;
import com.management.repository.OwnerRepository;
import com.management.custom_exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OwnerServiceImpl implements OwnerService {

    @Autowired
    private OwnerRepository ownerRepository;

    @Override
    public Owner createOwner(Owner owner) {
        return ownerRepository.save(owner);
    }

    @Override
    public List<Owner> getAllOwners() {
        return ownerRepository.findAll();
    }

    @Override
    public Owner getOwnerById(Long id) {
        return ownerRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Owner not found with id: " + id));
    }

    @Override
    public Owner updateOwner(Long id, Owner updatedOwner) {
        Owner existingOwner = ownerRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Owner not found with id: " + id));

        // ✅ Match your Owner entity fields exactly
        existingOwner.setOwnerName(updatedOwner.getOwnerName());
        existingOwner.setContactNo(updatedOwner.getContactNo());

        // NOTE: email/password are stored in AppUser (existingOwner.getUser()).

        // We do NOT touch projects here – they’re handled via RealEstateProjectsService
        return ownerRepository.save(existingOwner);
    }

    @Override
    public void deleteOwner(Long id) {
        Owner owner = ownerRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Owner not found with id: " + id));

        ownerRepository.delete(owner);
    }
}
