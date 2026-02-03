package com.management.service;

import com.management.entities.RealEstateProjects;

import java.util.List;

public interface RealEstateProjectsService {

    // ===== OWNER SIDE =====

    // Owner creates project
    RealEstateProjects createProjectForOwner(Long ownerId, RealEstateProjects project);

    // Owner views own projects
    List<RealEstateProjects> getProjectsByOwner(Long ownerId);

    // Owner updates own project
    RealEstateProjects updateProjectOfOwner(Long ownerId, Long projectId, RealEstateProjects project);

    // Owner deletes own project
    void deleteProjectOfOwner(Long ownerId, Long projectId);

    // ===== ADMIN SIDE =====

    // If you ever need generic create somewhere else
    RealEstateProjects createProject(RealEstateProjects project);

    List<RealEstateProjects> getAllProjects();

    RealEstateProjects getProjectById(Long id);

    RealEstateProjects updateProject(Long id, RealEstateProjects project);

    void deleteProject(Long id);
}
