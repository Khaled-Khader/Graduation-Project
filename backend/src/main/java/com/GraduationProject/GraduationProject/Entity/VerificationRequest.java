package com.GraduationProject.GraduationProject.Entity;

import com.GraduationProject.GraduationProject.Enum.EnumRole;
import com.GraduationProject.GraduationProject.Enum.VerificationStatus;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@Entity
@Table(
        name = "verification_requests",
        indexes = {
                @Index(name = "idx_verification_provider", columnList = "provider_id"),
                @Index(name = "idx_verification_status", columnList = "status"),
                @Index(name = "idx_verification_created_at", columnList = "created_at")
        }
)
public class VerificationRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "provider_id", nullable = false)
    private Users provider;

    @Enumerated(EnumType.STRING)
    @Column(name = "provider_role", nullable = false, length = 30, columnDefinition = "varchar(30)")
    private EnumRole providerRole;

    @Column(name = "document_url", nullable = false, length = 1000)
    private String documentUrl;

    @Column(name = "document_public_id", nullable = false, length = 500)
    private String documentPublicId;

    @Column(name = "document_type", length = 80)
    private String documentType;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 40, columnDefinition = "varchar(40)")
    private VerificationStatus status = VerificationStatus.PENDING;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by")
    private Users reviewedBy;
}
