package com.GraduationProject.GraduationProject.DTO.adoption;

import lombok.Data;

import java.time.LocalDateTime;
@Data
public class AdoptionRequestResponseDTO {
    private Long id;


    private Long requesterId;
    private String requesterName;

    private String phoneNumber;
    private String city;
    private String message;

    private String status; // PENDING / ACCEPTED / REJECTED

    private LocalDateTime createdAt;
}
