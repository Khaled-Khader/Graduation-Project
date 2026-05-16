package com.GraduationProject.GraduationProject.DTO;

public record ClinicMapResponseDTO(
        Long id,
        String clinicName,
        Double latitude,
        Double longitude,
        String address,
        boolean verified
) {
}
