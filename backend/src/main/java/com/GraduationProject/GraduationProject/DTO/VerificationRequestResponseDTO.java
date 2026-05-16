package com.GraduationProject.GraduationProject.DTO;

import java.time.LocalDateTime;

public record VerificationRequestResponseDTO(
        Long id,
        Long providerId,
        String providerEmail,
        String providerRole,
        String documentUrl,
        String documentPreviewUrl,
        String documentPublicId,
        String documentType,
        String status,
        String rejectionReason,
        LocalDateTime createdAt,
        LocalDateTime reviewedAt,
        Long reviewedById
) {
}
