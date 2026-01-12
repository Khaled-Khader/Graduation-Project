package com.GraduationProject.GraduationProject.Service;

import com.GraduationProject.GraduationProject.DTO.ServiceDTO;
import com.GraduationProject.GraduationProject.Entity.Users;
import com.GraduationProject.GraduationProject.Enum.EnumRole;
import com.GraduationProject.GraduationProject.Repository.ServiceRepository;
import com.GraduationProject.GraduationProject.Repository.UsersRepository;
import com.GraduationProject.GraduationProject.Security.UserPrinciple;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Service class responsible for handling "services" offered by users in the Pet Nexus application.
 *
 * This class provides functionality to:
 * - Add a new service (only if the user is a VET or CLINIC)
 * - Get all services created by a specific user
 * - Delete a service owned by the authenticated user
 */
@Service
public class ServiceService {

    private final ServiceRepository serviceRepository;
    private final UsersRepository usersRepository;

    public ServiceService(ServiceRepository serviceRepository,
                          UsersRepository usersRepository) {
        this.serviceRepository = serviceRepository;
        this.usersRepository = usersRepository;
    }


    /**
     * Adds a new service for the currently authenticated user.
     *
     * Rules:
     * - Only users with role VET or CLINIC can add services.
     *
     * @param serviceDTO DTO containing service name and description
     * @return the same ServiceDTO that was saved
     * @throws RuntimeException if user not found or user role is not allowed
     */
    public ServiceDTO addService(ServiceDTO serviceDTO) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserPrinciple userPrinciple = (UserPrinciple) authentication.getPrincipal();


        Users user = usersRepository.findById(userPrinciple.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));


        if (user.getRole() != EnumRole.VET && user.getRole() != EnumRole.CLINIC) {
            throw new RuntimeException("Only vets or clinics can create services");
        }


        com.GraduationProject.GraduationProject.Entity.Service service =
                new com.GraduationProject.GraduationProject.Entity.Service(
                        user,
                        serviceDTO.name(),
                        serviceDTO.description()
                );


        user.addService(service);
        serviceRepository.save(service);

        return serviceDTO;
    }


    /**
     * Fetches all services created by a specific user.
     *
     * @param userId the ID of the user whose services we want to fetch
     * @return list of ServiceDTO
     */
    public List<ServiceDTO> getAllUserServices(Long userId) {
        return serviceRepository.findByUser_Id(userId)
                .stream()
                .map(service -> new ServiceDTO(
                        service.getId(),
                        service.getUser().getId(),
                        service.getName(),
                        service.getDescription()
                ))
                .toList();
    }


    /**
     * Deletes a service owned by the currently authenticated user.
     *
     * Checks:
     * - The service exists
     * - The authenticated user is the owner
     *
     * @param serviceId ID of the service to delete
     * @throws RuntimeException if service not found or user is not authorized
     */
    public void deleteUserService(Long serviceId) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserPrinciple userPrinciple = (UserPrinciple) authentication.getPrincipal();


        com.GraduationProject.GraduationProject.Entity.Service service =
                serviceRepository.findById(serviceId)
                        .orElseThrow(() -> new RuntimeException("Service not found"));


        if (!service.getUser().getId().equals(userPrinciple.getId())) {
            throw new RuntimeException("User not authorized to delete this service");
        }


        serviceRepository.delete(service);
    }
}
