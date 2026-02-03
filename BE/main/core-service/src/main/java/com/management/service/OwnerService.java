package com.management.service;

import com.management.entities.Owner;

import java.util.List;

public interface OwnerService {

    // Not exposed in AdminController, but useful if you later add owner registration
    Owner createOwner(Owner owner);

    List<Owner> getAllOwners();

    Owner getOwnerById(Long id);

    Owner updateOwner(Long id, Owner owner);

    void deleteOwner(Long id);
}
