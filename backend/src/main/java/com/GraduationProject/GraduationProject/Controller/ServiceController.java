package com.GraduationProject.GraduationProject.Controller;

import com.GraduationProject.GraduationProject.DTO.ServiceDTO;
import com.GraduationProject.GraduationProject.Entity.Service;
import com.GraduationProject.GraduationProject.Repository.ServiceRepository;
import com.GraduationProject.GraduationProject.Service.ServiceService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/service")
public class ServiceController {

    private final ServiceService serviceService;

    public ServiceController(ServiceService serviceService) {
        this.serviceService = serviceService;
    }

    @GetMapping("/{id}")
    public List<ServiceDTO> findById(@PathVariable Long id){
        return serviceService.getAllUserServices(id);
    }

    @PostMapping
    public ServiceDTO save(@RequestBody ServiceDTO serviceDTO){
        return serviceService.addService(serviceDTO);
    }

    @DeleteMapping("/{serviceId}")
    public void delete(@PathVariable Long serviceId){
        serviceService.deleteUserService(serviceId);
    }

}
