package com.GraduationProject.GraduationProject.Controller;

import com.GraduationProject.GraduationProject.DTO.ServiceDTO;
import com.GraduationProject.GraduationProject.Service.ServiceService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller for managing veterinary and clinic services in PetNexus.
 *
 * Responsibilities:
 *  - Retrieve services of a specific user
 *  - Add new services for the authenticated user
 *  - Delete services created by the authenticated user
 */
@RestController
@RequestMapping("/service")
public class ServiceController {

    private final ServiceService serviceService;

    public ServiceController(ServiceService serviceService) {
        this.serviceService = serviceService;
    }


    /**
     * Retrieves all services created by a specific user.
     *
     * @param id User ID
     * @return List of ServiceDTO objects representing the user's services
     */
    @GetMapping("/{id}")
    public List<ServiceDTO> findById(@PathVariable Long id) {
        return serviceService.getAllUserServices(id);
    }


    /**
     * Adds a new service for the authenticated user.
     * Only users with role VET or CLINIC are allowed to create services.
     *
     * @param serviceDTO DTO containing service information (name, description)
     * @return ServiceDTO of the newly created service
     */
    @PostMapping
    public ServiceDTO save(@RequestBody ServiceDTO serviceDTO) {
        return serviceService.addService(serviceDTO);
    }


    /**
     * Deletes a service created by the authenticated user.
     * Only the owner of the service can delete it.
     *
     * @param serviceId ID of the service to delete
     */
    @DeleteMapping("/{serviceId}")
    public void delete(@PathVariable Long serviceId) {
        serviceService.deleteUserService(serviceId);
    }
}
