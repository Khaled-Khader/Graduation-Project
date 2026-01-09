package com.GraduationProject.GraduationProject.DTO;

public record PetDTO(
                    Long id,
                     String name,
                     String species,
                     Double age,
                     String photoUrl,
                     String healthStatus,
                     String gender,
                     boolean hasVaccineCert) {
}
