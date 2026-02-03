package com.management.service;

import com.management.entities.Admin;
import java.util.List;

public interface AdminService {

    Admin createAdmin(Admin admin);

    List<Admin> getAllAdmins();

    Admin getAdminById(Long id);

    Admin updateAdmin(Long id, Admin admin);

    void deleteAdmin(Long id);
}
