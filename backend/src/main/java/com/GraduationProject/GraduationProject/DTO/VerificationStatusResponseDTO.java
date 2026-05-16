package com.GraduationProject.GraduationProject.DTO;

import java.util.List;

public record VerificationStatusResponseDTO(
        Long providerId,
        String providerRole,
        String status,
        boolean verified,
        boolean requiresVerification,
        boolean canSkip,
        List<VerificationRequestResponseDTO> requests
) {
}
