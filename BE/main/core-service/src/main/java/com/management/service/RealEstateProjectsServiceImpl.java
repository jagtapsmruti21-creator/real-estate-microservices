package com.management.service;

import com.management.entities.Owner;
import com.management.entities.RealEstateProjects;
import com.management.repository.OwnerRepository;
import com.management.repository.RealEstateProjectsRepository;
import com.management.custom_exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RealEstateProjectsServiceImpl implements RealEstateProjectsService {

    @Autowired
    private RealEstateProjectsRepository realEstateProjectsRepository;

    @Autowired
    private OwnerRepository ownerRepository;

    // ===== OWNER SIDE =====

    @Override
    public RealEstateProjects createProjectForOwner(Long ownerId, RealEstateProjects project) {
        Owner owner = ownerRepository.findById(ownerId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Owner not found with id: " + ownerId));

        project.setOwner(owner);
        return realEstateProjectsRepository.save(project);
    }

    @Override
    public List<RealEstateProjects> getProjectsByOwner(Long ownerId) {
        return realEstateProjectsRepository.findByOwner_Id(ownerId);
    }

    @Override
    public RealEstateProjects updateProjectOfOwner(Long ownerId, Long projectId, RealEstateProjects updatedProject) {
        RealEstateProjects existingProject = realEstateProjectsRepository.findById(projectId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Project not found with id: " + projectId));

        // ensure project actually belongs to this owner
        if (existingProject.getOwner() == null ||
                !existingProject.getOwner().getId().equals(ownerId)) {
            throw new ResourceNotFoundException(
                    "Project " + projectId + " does not belong to owner " + ownerId);
        }

        existingProject.setProjName(updatedProject.getProjName());
        existingProject.setAddress(updatedProject.getAddress());
        existingProject.setDescription(updatedProject.getDescription());
        existingProject.setPrice(updatedProject.getPrice());

        return realEstateProjectsRepository.save(existingProject);
    }

    @Override
    public void deleteProjectOfOwner(Long ownerId, Long projectId) {
        RealEstateProjects existingProject = realEstateProjectsRepository.findById(projectId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Project not found with id: " + projectId));

        if (existingProject.getOwner() == null ||
                !existingProject.getOwner().getId().equals(ownerId)) {
            throw new ResourceNotFoundException(
                    "Project " + projectId + " does not belong to owner " + ownerId);
        }

        realEstateProjectsRepository.delete(existingProject);
    }

    // ===== ADMIN SIDE =====

    @Override
    public RealEstateProjects createProject(RealEstateProjects project) {
        // Normally not used by Admin (Owner creates), but available if needed
        return realEstateProjectsRepository.save(project);
    }

    @Override
    public List<RealEstateProjects> getAllProjects() {
        return realEstateProjectsRepository.findAll();
    }

    @Override
    public RealEstateProjects getProjectById(Long id) {
        return realEstateProjectsRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Project not found with id: " + id));
    }

    @Override
    public RealEstateProjects updateProject(Long id, RealEstateProjects updatedProject) {
        RealEstateProjects existingProject = realEstateProjectsRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Project not found with id: " + id));

        existingProject.setProjName(updatedProject.getProjName());
        existingProject.setAddress(updatedProject.getAddress());
        existingProject.setDescription(updatedProject.getDescription());
        existingProject.setPrice(updatedProject.getPrice());

        return realEstateProjectsRepository.save(existingProject);
    }

    @Override
    public void deleteProject(Long id) {
        RealEstateProjects project = realEstateProjectsRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Project not found with id: " + id));

        realEstateProjectsRepository.delete(project);
    }
}
