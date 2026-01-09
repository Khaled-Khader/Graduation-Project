package com.GraduationProject.GraduationProject.DTO.adoption;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateAdoptionRequestDTO {
    @NotBlank
    private String phoneNumber;

    @NotBlank
    private String city;

    // message (optional)
    private String message;
}
