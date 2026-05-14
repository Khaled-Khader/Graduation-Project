package com.GraduationProject.GraduationProject.DTO;

import com.fasterxml.jackson.annotation.JsonProperty;

public record PetDTO(
                    Long id,
                     String name,
                     String species,
                     Double age,
                     String photoUrl,
                     String healthStatus,
                     String gender,
                     boolean hasVaccineCert,
                     @JsonProperty("isOnAdoptionPost") boolean onAdoptionPost) {
}
