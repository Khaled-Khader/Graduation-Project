package com.GraduationProject.GraduationProject.Service;

import com.GraduationProject.GraduationProject.DTO.*;
import com.GraduationProject.GraduationProject.Entity.Users;
import com.GraduationProject.GraduationProject.Enum.EnumRole;
import com.GraduationProject.GraduationProject.Repository.UsersRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserProfileService {

    private final UsersRepository usersRepository;

    public UserProfileService(UsersRepository usersRepository) {
        this.usersRepository = usersRepository;
    }

    public ProfileDTO getUserProfile(Long userId) {
        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // User info
        UserInfoDTO userInfoDTO = user.getUserInfo() != null
                ? new UserInfoDTO(
                user.getUserInfo().getFirstName(),
                user.getUserInfo().getLastName(),
                user.getUserInfo().getBio()
        )
                : null;

        // Vet info
        VetDTO vetDTO = null;
        if (user.getRole() == EnumRole.VET && user.getVet() != null) {
            vetDTO = new VetDTO(user.getVet().getSpecialty());
        }

        // Clinic info
        ClinicDTO clinicDTO = null;
        if (user.getRole() == EnumRole.CLINIC && user.getClinic() != null) {
            clinicDTO = new ClinicDTO(
                    user.getClinic().getLatitude(),
                    user.getClinic().getLongitude(),
                    user.getClinic().getCity(),
                    user.getClinic().getAddress()
            );
        }

        // Pets
        List<PetDTO> pets = user.getPets().stream()
                .map(p -> new PetDTO(
                        p.getId(),
                        p.getName(),
                        p.getSpecies(),
                        p.getAge(),
                        p.getPhotoUrl(),
                        p.getHealthStatus(),
                        p.isHasVaccineCert()
                ))
                .toList();

        // Services
        List<ServiceDTO> services = user.getServices().stream()
                .map(s -> new ServiceDTO(
                        s.getName(),
                        s.getDescription()
                ))
                .toList();

        String photoUrl = user.getUserInfo() != null ? user.getUserInfo().getPhotoUrl() : null;


        return new ProfileDTO(
                user.getRole(),
                userInfoDTO,
                photoUrl,
                vetDTO,
                clinicDTO,
                pets,
                services
        );
    }
}

