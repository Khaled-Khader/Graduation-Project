package com.GraduationProject.GraduationProject.Service;

import com.GraduationProject.GraduationProject.DTO.*;
import com.GraduationProject.GraduationProject.Entity.Users;
import com.GraduationProject.GraduationProject.Enum.EnumRole;
import com.GraduationProject.GraduationProject.Repository.UsersRepository;
import com.GraduationProject.GraduationProject.Security.UserPrinciple;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import tools.jackson.databind.JsonNode;

import java.util.List;

/**
 * Service responsible for handling user profile-related operations.
 *
 * Responsibilities include:
 *  - Fetching user profile information (ProfileDTO)
 *  - Editing user profile information
 *  - Validating input for textual and numeric fields
 */
@Service
public class UserProfileService {

    private final UsersRepository usersRepository;

    public UserProfileService(UsersRepository usersRepository) {
        this.usersRepository = usersRepository;
    }


    /**
     * Retrieves the profile of a user by their ID.
     *
     * Profile includes:
     *  - Basic user info (name, bio, photo)
     *  - Role-specific info (Vet or Clinic)
     *  - Pets owned by the user
     *  - Services offered by the user (if any)
     *
     * @param userId the ID of the user
     * @return ProfileDTO containing user information
     * @throws RuntimeException if user not found
     */
    public ProfileDTO getUserProfile(Long userId) {
        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));


        UserInfoDTO userInfoDTO = user.getUserInfo() != null
                ? new UserInfoDTO(
                user.getUserInfo().getFirstName(),
                user.getUserInfo().getLastName(),
                user.getUserInfo().getBio(),
                user.getUserInfo().getPhotoUrl()
        ) : null;


        VetDTO vetDTO = null;
        if (user.getRole() == EnumRole.VET && user.getVet() != null) {
            vetDTO = new VetDTO(user.getVet().getSpecialty());
        }


        ClinicDTO clinicDTO = null;
        if (user.getRole() == EnumRole.CLINIC && user.getClinic() != null) {
            clinicDTO = new ClinicDTO(
                    user.getClinic().getLatitude(),
                    user.getClinic().getLongitude(),
                    user.getClinic().getCity(),
                    user.getClinic().getAddress()
            );
        }


        List<PetDTO> pets = user.getPets().stream()
                .map(p -> new PetDTO(
                        p.getId(),
                        p.getName(),
                        p.getSpecies(),
                        p.getAge(),
                        p.getPhotoUrl(),
                        p.getHealthStatus(),
                        p.getGender(),
                        p.isHasVaccineCert()
                ))
                .toList();


        List<ServiceDTO> services = user.getServices().stream()
                .map(s -> new ServiceDTO(
                        s.getId(),
                        s.getUser().getId(),
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


    private boolean isValidText(JsonNode node) {
        return node != null && !node.isNull() && node.isTextual() && !node.asText().isEmpty();
    }

    private boolean isValidNumber(JsonNode node) {
        return node != null
                && !node.isNull()
                && node.isNumber()
                && !Double.isNaN(node.asDouble());
    }


    /**
     * Updates the profile of the currently authenticated user.
     *
     * Editable fields include:
     *  - firstName, lastName, bio, photoUrl
     *  - Vet specialty (if role is VET)
     *  - Clinic info (latitude, longitude, city, address) if role is CLINIC
     *
     * @param node a JSON object containing the fields to update
     * @throws RuntimeException if user not found
     */
    public void editUserProfile(JsonNode node) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserPrinciple userPrinciple = (UserPrinciple) authentication.getPrincipal();

        Users user = usersRepository.findById(userPrinciple.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));


        if(node.has("firstName") && isValidText(node.get("firstName"))) {
            user.getUserInfo().setFirstName(node.get("firstName").asText());
        }

        if(node.has("lastName") && isValidText(node.get("lastName"))) {
            user.getUserInfo().setLastName(node.get("lastName").asText());
        }

        if(node.has("bio") && isValidText(node.get("bio"))) {
            user.getUserInfo().setBio(node.get("bio").asText());
        }

        if(node.has("photoUrl") && isValidText(node.get("photoUrl"))) {
            user.getUserInfo().setPhotoUrl(node.get("photoUrl").asText());
        }


        if(user.getRole() == EnumRole.VET && user.getVet() != null && node.has("specialty")) {
            JsonNode specialtyNode = node.get("specialty");
            if(isValidText(specialtyNode)) {
                user.getVet().setSpecialty(specialtyNode.asText());
            }
        }

        if(user.getRole() == EnumRole.CLINIC && user.getClinic() != null) {
            if(node.has("latitude") && isValidNumber(node.get("latitude"))) {
                user.getClinic().setLatitude(node.get("latitude").asDouble());
            }
            if(node.has("longitude") && isValidNumber(node.get("longitude"))) {
                user.getClinic().setLongitude(node.get("longitude").asDouble());
            }
            if(node.has("address") && isValidText(node.get("address"))) {
                user.getClinic().setAddress(node.get("address").asText());
            }
            if(node.has("city") && isValidText(node.get("city"))) {
                user.getClinic().setCity(node.get("city").asText());
            }
        }

        usersRepository.save(user);
    }
}
