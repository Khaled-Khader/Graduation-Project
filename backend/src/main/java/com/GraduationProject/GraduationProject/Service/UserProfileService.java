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
                user.getUserInfo().getBio(),
                user.getUserInfo().getPhotoUrl()
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
                        p.getGender(),
                        p.isHasVaccineCert()
                ))
                .toList();

        // Services
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



    public void editUserProfile(JsonNode  node) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserPrinciple userPrinciple = (UserPrinciple) authentication.getPrincipal();

        Users user =usersRepository.findById(userPrinciple.getId()).orElseThrow(
                () -> new RuntimeException("User not found")
        );

        if(node.has("firstName")){
            JsonNode firstNameNode = node.get("firstName");
            if(isValidText(firstNameNode)) {
                user.getUserInfo().setFirstName(firstNameNode.asText());
            }
        }

        if(node.has("lastName")){
            JsonNode lastNameNode = node.get("lastName");
            if(isValidText(lastNameNode)) {
                user.getUserInfo().setLastName(lastNameNode.asText());
            }
        }

        if(node.has("bio")){
            JsonNode bioNode = node.get("bio");
            if(isValidText(bioNode)) {
                user.getUserInfo().setBio(bioNode.asText());
            }
        }

        if(node.has("photoUrl")){
            JsonNode photoUrlNode = node.get("photoUrl");
            if(isValidText(photoUrlNode)) {
                user.getUserInfo().setPhotoUrl(photoUrlNode.asText());
            }
        }

        if(user.getRole().equals(EnumRole.VET) && user.getVet() != null) {
            if(node.has("specialty")) {
                JsonNode specialtyNode = node.get("specialty");
                if(isValidText(specialtyNode)) {
                    user.getVet().setSpecialty(specialtyNode.asText());
                }
            }
        }

        if(user.getRole().equals(EnumRole.CLINIC) && user.getClinic() != null) {
            if(node.has("latitude")){
                JsonNode latitudeNode = node.get("latitude");
                if(isValidNumber(latitudeNode)) {
                    user.getClinic().setLatitude(latitudeNode.asDouble());
                }
            }

            if(node.has("longitude")){
                JsonNode longitudeNode = node.get("longitude");
                if(isValidNumber(longitudeNode)) {
                    user.getClinic().setLongitude(longitudeNode.asDouble());
                }
            }

            if(node.has("address")){
                JsonNode addressNode = node.get("address");
                if(isValidText(addressNode)) {
                    user.getClinic().setAddress(addressNode.asText());
                }
            }

            if(node.has("city")){
                JsonNode cityNode = node.get("city");
                if(isValidText(cityNode)) {
                    user.getClinic().setCity(cityNode.asText());
                }
            }
        }

        usersRepository.save(user);
    }
}

