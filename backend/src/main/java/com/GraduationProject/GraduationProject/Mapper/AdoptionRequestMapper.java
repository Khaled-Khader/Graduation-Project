package com.GraduationProject.GraduationProject.Mapper;

import com.GraduationProject.GraduationProject.DTO.adoption.AdoptionRequestResponseDTO;
import com.GraduationProject.GraduationProject.Entity.AdoptionRequest;
import com.GraduationProject.GraduationProject.Entity.UserInfo;

/**
 * Utility class for mapping AdoptionRequest entities to AdoptionRequestResponseDTOs
 *
 * This class provides a static method to convert a full AdoptionRequest object
 * (with relationships like requester UserInfo) into a clean DTO suitable for API responses
 */
public class AdoptionRequestMapper {


    private AdoptionRequestMapper() {

    }

    /**
     * Maps an AdoptionRequest entity to an AdoptionRequestResponseDTO.
     *
     * The method extracts:
     *
     *     Request ID
     *     Requester ID and full name (or email if name is not available)
     *     Phone number, city, and message
     *     Current status as a string
     *     Creation timestamp
     *
     *
     *
     * @param request The AdoptionRequest entity to map
     * @return An AdoptionRequestResponseDTO representing the request
     */
    public static AdoptionRequestResponseDTO toDTO(AdoptionRequest request) {
        AdoptionRequestResponseDTO dto = new AdoptionRequestResponseDTO();


        dto.setId(request.getId());
        dto.setRequesterId(request.getRequester().getId());


        UserInfo info = request.getRequester().getUserInfo();
        if (info != null) {
            dto.setRequesterName(info.getFirstName() + " " + info.getLastName());
        } else {
            dto.setRequesterName(request.getRequester().getEmail());
        }


        dto.setPhoneNumber(request.getPhoneNumber());
        dto.setCity(request.getCity());
        dto.setMessage(request.getMessage());


        dto.setStatus(request.getStatus().name());


        dto.setCreatedAt(request.getCreatedAt());

        return dto;
    }
}
