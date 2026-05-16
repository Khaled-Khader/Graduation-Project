package com.GraduationProject.GraduationProject.Service;

import com.GraduationProject.GraduationProject.DTO.ClinicMapResponseDTO;
import com.GraduationProject.GraduationProject.Entity.Clinic;
import com.GraduationProject.GraduationProject.Entity.Users;
import com.GraduationProject.GraduationProject.Enum.EnumRole;
import com.GraduationProject.GraduationProject.Exception.ClinicNotFoundException;
import com.GraduationProject.GraduationProject.Repository.ClinicRepository;
import com.GraduationProject.GraduationProject.Repository.UsersRepository;
import com.GraduationProject.GraduationProject.Security.UserPrinciple;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ClinicService {

    private final ClinicRepository clinicRepository;
    private final UsersRepository usersRepository;
    private final ProviderVerificationService providerVerificationService;

    public ClinicService(
            ClinicRepository clinicRepository,
            UsersRepository usersRepository,
            ProviderVerificationService providerVerificationService
    ) {
        this.clinicRepository = clinicRepository;
        this.usersRepository = usersRepository;
        this.providerVerificationService = providerVerificationService;
    }


    public void updateLocation(Long clinicId, Double lat, Double lng) {
        Users currentUser = getCurrentUser();
        if (currentUser.getRole() != EnumRole.CLINIC || !currentUser.getId().equals(clinicId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only update your own clinic location");
        }

        providerVerificationService.requireVerifiedProvider(currentUser, "set clinic location");

        Clinic clinic = clinicRepository.findById(clinicId)
                .orElseThrow(() -> new ClinicNotFoundException("The clinic does not exist"));
        clinic.setLatitude(lat);
        clinic.setLongitude(lng);
        clinicRepository.save(clinic);
    }

    public List<ClinicMapResponseDTO> getNearbyClinics(Double lat, Double lng, Double radiusInKm) {
        List<Clinic> clinics = clinicRepository.findNearbyClinics(lat, lng, radiusInKm);

        return clinics.stream().map(clinic -> {
            String clinicName = "Veterinary clinic";


            if (clinic.getUsers() != null && clinic.getUsers().getUserInfo() != null) {
                String fName = clinic.getUsers().getUserInfo().getFirstName();
                String lName = clinic.getUsers().getUserInfo().getLastName();


                clinicName = (fName != null ? fName : "") + " " + (lName != null ? lName : "");
                clinicName = clinicName.trim();

                if (clinicName.isEmpty()) {
                    clinicName = "Veterinary clinic";
                }
            }

            return new ClinicMapResponseDTO(
                    clinic.getId(),
                    clinicName,
                    clinic.getLatitude(),
                    clinic.getLongitude(),
                    clinic.getAddress(),
                    true
            );
        }).collect(Collectors.toList());
    }

    private Users getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UserPrinciple userPrinciple)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication is required");
        }

        return usersRepository.findById(userPrinciple.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }
}
