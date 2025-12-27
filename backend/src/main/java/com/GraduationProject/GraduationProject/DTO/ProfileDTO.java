package com.GraduationProject.GraduationProject.DTO;

import com.GraduationProject.GraduationProject.Enum.EnumRole;

import java.util.List;

public record ProfileDTO(
        EnumRole role,
        UserInfoDTO userInfoDTO,
        String photoUrl,
        VetDTO vetDTO,
        ClinicDTO clinicDTO,
        List<PetDTO>pets,
        List<ServiceDTO> services
) {
}
