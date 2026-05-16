package com.GraduationProject.GraduationProject.Service;

import com.GraduationProject.GraduationProject.DTO.CloudinaryUploadResult;
import com.GraduationProject.GraduationProject.DTO.CreateNotificationDTO;
import com.GraduationProject.GraduationProject.DTO.VerificationRequestResponseDTO;
import com.GraduationProject.GraduationProject.DTO.VerificationStatusResponseDTO;
import com.GraduationProject.GraduationProject.Entity.Notification;
import com.GraduationProject.GraduationProject.Entity.Users;
import com.GraduationProject.GraduationProject.Entity.VerificationRequest;
import com.GraduationProject.GraduationProject.Enum.EnumRole;
import com.GraduationProject.GraduationProject.Enum.NotificationType;
import com.GraduationProject.GraduationProject.Enum.VerificationStatus;
import com.GraduationProject.GraduationProject.Repository.UsersRepository;
import com.GraduationProject.GraduationProject.Repository.VerificationRequestRepository;
import com.GraduationProject.GraduationProject.Security.UserPrinciple;
import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class VerificationRequestService {

    private final VerificationRequestRepository verificationRequestRepository;
    private final UsersRepository usersRepository;
    private final CloudinaryService cloudinaryService;
    private final ProviderVerificationService providerVerificationService;
    private final NotificationService notificationService;

    public VerificationRequestService(
            VerificationRequestRepository verificationRequestRepository,
            UsersRepository usersRepository,
            CloudinaryService cloudinaryService,
            ProviderVerificationService providerVerificationService,
            NotificationService notificationService
    ) {
        this.verificationRequestRepository = verificationRequestRepository;
        this.usersRepository = usersRepository;
        this.cloudinaryService = cloudinaryService;
        this.providerVerificationService = providerVerificationService;
        this.notificationService = notificationService;
    }

    public VerificationStatusResponseDTO getCurrentProviderStatus(UserPrinciple currentUser) {
        Users provider = getCurrentProvider(currentUser);
        List<VerificationRequest> requests = verificationRequestRepository.findByProviderOrderByCreatedAtDesc(provider);
        VerificationStatus status = providerVerificationService.resolveProviderStatus(requests);

        return new VerificationStatusResponseDTO(
                provider.getId(),
                provider.getRole().name(),
                status.name(),
                status == VerificationStatus.VERIFIED,
                status == VerificationStatus.UNVERIFIED || status == VerificationStatus.REJECTED,
                status != VerificationStatus.VERIFIED,
                requests.stream().map(this::toDTO).toList()
        );
    }

    public List<VerificationRequestResponseDTO> submitDocuments(
            UserPrinciple currentUser,
            List<MultipartFile> files,
            String documentType
    ) {
        Users provider = getCurrentProvider(currentUser);
        if (files == null || files.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "At least one verification document is required");
        }

        return files.stream()
                .map(file -> createRequest(provider, file, documentType))
                .map(this::toDTO)
                .toList();
    }

    public List<VerificationRequestResponseDTO> listRequests(VerificationStatus status) {
        List<VerificationRequest> requests = status == null
                ? verificationRequestRepository.findAllByOrderByCreatedAtDesc()
                : verificationRequestRepository.findByStatusOrderByCreatedAtAsc(status);

        return requests.stream().map(this::toDTO).toList();
    }

    public VerificationRequestResponseDTO markUnderReview(Long requestId, UserPrinciple adminUser) {
        VerificationRequest request = findRequest(requestId);
        request.setStatus(VerificationStatus.UNDER_REVIEW);
        request.setReviewedBy(getUser(adminUser));
        request.setReviewedAt(LocalDateTime.now());
        request.setRejectionReason(null);
        return toDTO(verificationRequestRepository.save(request));
    }

    public VerificationRequestResponseDTO verify(Long requestId, UserPrinciple adminUser) {
        VerificationRequest request = findRequest(requestId);
        request.setStatus(VerificationStatus.VERIFIED);
        request.setReviewedBy(getUser(adminUser));
        request.setReviewedAt(LocalDateTime.now());
        request.setRejectionReason(null);
        VerificationRequest savedRequest = verificationRequestRepository.save(request);
        notifyProviderVerificationStatus(savedRequest, true);
        return toDTO(savedRequest);
    }

    public VerificationRequestResponseDTO reject(Long requestId, String rejectionReason, UserPrinciple adminUser) {
        if (rejectionReason == null || rejectionReason.trim().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Rejection reason is required");
        }

        VerificationRequest request = findRequest(requestId);
        request.setStatus(VerificationStatus.REJECTED);
        request.setReviewedBy(getUser(adminUser));
        request.setReviewedAt(LocalDateTime.now());
        request.setRejectionReason(rejectionReason.trim());
        VerificationRequest savedRequest = verificationRequestRepository.save(request);
        notifyProviderVerificationStatus(savedRequest, false);
        return toDTO(savedRequest);
    }

    private VerificationRequest createRequest(Users provider, MultipartFile file, String documentType) {
        CloudinaryUploadResult uploadResult = cloudinaryService.uploadVerificationDocument(file, provider.getId());

        VerificationRequest request = new VerificationRequest();
        request.setProvider(provider);
        request.setProviderRole(provider.getRole());
        request.setDocumentUrl(uploadResult.secureUrl());
        request.setDocumentPublicId(uploadResult.publicId());
        request.setDocumentType(normalizeDocumentType(documentType));
        request.setStatus(VerificationStatus.PENDING);
        return verificationRequestRepository.save(request);
    }

    private Users getCurrentProvider(UserPrinciple currentUser) {
        Users user = getUser(currentUser);
        if (user.getRole() != EnumRole.VET && user.getRole() != EnumRole.CLINIC) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only veterinarians and clinics can submit verification documents");
        }

        return user;
    }

    private Users getUser(UserPrinciple currentUser) {
        if (currentUser == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication is required");
        }

        return usersRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authenticated user was not found"));
    }

    private VerificationRequest findRequest(Long requestId) {
        return verificationRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Verification request not found"));
    }

    private String normalizeDocumentType(String documentType) {
        if (documentType == null || documentType.trim().isBlank()) {
            return "GENERAL";
        }

        String normalized = documentType.trim()
                .toUpperCase()
                .replaceAll("[^A-Z0-9_ -]", "")
                .replace(' ', '_')
                .replace('-', '_');

        return normalized.isBlank() ? "GENERAL" : normalized;
    }

    private void notifyProviderVerificationStatus(VerificationRequest request, boolean approved) {
        Users provider = request.getProvider();
        if (provider == null) {
            return;
        }

        String title = approved ? "Verification approved" : "Verification rejected";
        String message = approved
                ? "Your provider verification was approved. You can now use provider features."
                : "Your provider verification was rejected. Reason: " + request.getRejectionReason();

        notificationService.createNotification(new CreateNotificationDTO(
                provider.getId(),
                NotificationType.VERIFICATION_STATUS.name(),
                title,
                message,
                request.getId(),
                Notification.RelatedEntityType.VERIFICATION_REQUEST.name()
        ));
    }

    private VerificationRequestResponseDTO toDTO(VerificationRequest request) {
        Users provider = request.getProvider();
        Users reviewedBy = request.getReviewedBy();

        return new VerificationRequestResponseDTO(
                request.getId(),
                provider != null ? provider.getId() : null,
                provider != null ? provider.getEmail() : null,
                request.getProviderRole() != null ? request.getProviderRole().name() : null,
                request.getDocumentUrl(),
                cloudinaryService.buildVerificationPreviewUrl(request.getDocumentUrl(), request.getDocumentPublicId()),
                request.getDocumentPublicId(),
                request.getDocumentType(),
                request.getStatus() != null ? request.getStatus().name() : null,
                request.getRejectionReason(),
                request.getCreatedAt(),
                request.getReviewedAt(),
                reviewedBy != null ? reviewedBy.getId() : null
        );
    }
}
