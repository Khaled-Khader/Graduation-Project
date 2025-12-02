package com.GraduationProject.GraduationProject.DTO;

import com.GraduationProject.GraduationProject.Enum.EnumRole;

public record UsersRegisterDTO(
        String email,
        String passwordHash,
        EnumRole role,
        UserInfoDTO userInfoDTO,
        ClinicDTO clinicDTO,
        VetDTO vetDTO
) {
}
