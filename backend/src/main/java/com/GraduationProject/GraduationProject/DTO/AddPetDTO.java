package com.GraduationProject.GraduationProject.DTO;

public record AddPetDTO(
        String name,
        String species,
        Double age,
        String photoUrl,
        String healthStatus,
        String gender,
        boolean hasVaccineCert
) {
}
