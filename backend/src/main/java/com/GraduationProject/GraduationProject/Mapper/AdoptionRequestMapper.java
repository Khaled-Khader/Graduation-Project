package com.GraduationProject.GraduationProject.Mapper;

import com.GraduationProject.GraduationProject.DTO.adoption.AdoptionRequestResponseDTO;
import com.GraduationProject.GraduationProject.Entity.AdoptionRequest;
import com.GraduationProject.GraduationProject.Entity.UserInfo;

public class AdoptionRequestMapper {

    private AdoptionRequestMapper() {
        // utility class
    }

    public static AdoptionRequestResponseDTO toDTO(
            AdoptionRequest request
    ) {
        AdoptionRequestResponseDTO dto =
                new AdoptionRequestResponseDTO();

        dto.setId(request.getId());
        dto.setRequesterId(request.getRequester().getId());

        UserInfo info = request.getRequester().getUserInfo();
        if (info != null) {
            dto.setRequesterName(
                    info.getFirstName() + " " + info.getLastName()
            );
        } else {
            // fallback
            dto.setRequesterName(
                    request.getRequester().getEmail()
            );
        }

        dto.setPhoneNumber(request.getPhoneNumber());
        dto.setCity(request.getCity());
        dto.setMessage(request.getMessage());

        dto.setStatus(request.getStatus().name());
        dto.setCreatedAt(request.getCreatedAt());

        return dto;
    }
}
