package com.GraduationProject.GraduationProject.DTO;

public record AdminUserDTO(
        Long id,
        String email,
        String role,
        String accountStatus,
        String firstName,
        String lastName,
        String photoUrl,
        String verificationStatus,
        boolean verified
) {
}
