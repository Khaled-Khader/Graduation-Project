package com.GraduationProject.GraduationProject.DTO;

public record ProviderSearchDTO(
        Long id,
        String role,
        String firstName,
        String lastName,
        String photoUrl,
        String specialty,
        String city,
        String address
) {
}
