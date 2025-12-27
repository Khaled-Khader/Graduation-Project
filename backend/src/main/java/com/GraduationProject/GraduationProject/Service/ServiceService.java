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

import java.util.ArrayList;
import java.util.List;


@Service
public class ServiceService {
    private final ServiceRepository serviceRepository;
    private final UsersRepository usersRepository;

    public ServiceService(ServiceRepository serviceRepository,
                          UsersRepository usersRepository) {
        this.serviceRepository = serviceRepository;
        this.usersRepository = usersRepository;
    }

    public ServiceDTO addService(ServiceDTO serviceDTO) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        UserPrinciple userPrinciple = (UserPrinciple) authentication.getPrincipal();

        Users user=usersRepository.findById(userPrinciple.getId()).orElseThrow(
                () -> new RuntimeException("User not found")
        );

        if (user.getRole() != EnumRole.VET && user.getRole() != EnumRole.CLINIC) {
            throw new RuntimeException("Only vets or clinics can create services");
        }

        com.GraduationProject.GraduationProject.Entity.Service service=new
                com.GraduationProject.GraduationProject.Entity.Service(
                        user,
                serviceDTO.name(),
                serviceDTO.description()
        );

        user.addService(service);
        serviceRepository.save(service);

            return serviceDTO;
    }

    public List<ServiceDTO> getAllUserServices(Long userId) {
        return serviceRepository.findByUser_Id(userId)
                .stream()
                .map(service -> new ServiceDTO(
                        service.getName(),
                        service.getDescription()
                ))
                .toList();
    }

    public void deleteUserService(Long serviceId) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserPrinciple userPrinciple = (UserPrinciple) authentication.getPrincipal();

        com.GraduationProject.GraduationProject.Entity.Service service = serviceRepository.findById(serviceId)
                .orElseThrow(() -> new RuntimeException("Service not found"));


        if (!service.getUser().getId().equals(userPrinciple.getId())) {
            throw new RuntimeException("User not authorized to delete this service");
        }

        serviceRepository.delete(service);
    }


}
