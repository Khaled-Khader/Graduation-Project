package com.GraduationProject.GraduationProject.Service;

import com.GraduationProject.GraduationProject.DTO.CreateNotificationDTO;
import com.GraduationProject.GraduationProject.Entity.Users;
import com.GraduationProject.GraduationProject.Entity.VerificationRequest;
import com.GraduationProject.GraduationProject.Enum.EnumRole;
import com.GraduationProject.GraduationProject.Enum.NotificationType;
import com.GraduationProject.GraduationProject.Enum.UserAccountStatus;
import com.GraduationProject.GraduationProject.Enum.VerificationStatus;
import com.GraduationProject.GraduationProject.Repository.UsersRepository;
import com.GraduationProject.GraduationProject.Repository.VerificationRequestRepository;
import com.GraduationProject.GraduationProject.Security.UserPrinciple;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class VerificationRequestServiceTest {

    @Mock
    private VerificationRequestRepository verificationRequestRepository;

    @Mock
    private UsersRepository usersRepository;

    @Mock
    private CloudinaryService cloudinaryService;

    @Mock
    private ProviderVerificationService providerVerificationService;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private VerificationRequestService verificationRequestService;

    @Test
    void verify_shouldNotifyProviderOnApproval() {
        Users provider = user(9L, EnumRole.CLINIC);
        Users admin = user(1L, EnumRole.ADMIN);
        VerificationRequest request = verificationRequest(5L, provider);

        when(verificationRequestRepository.findById(request.getId())).thenReturn(Optional.of(request));
        when(usersRepository.findById(admin.getId())).thenReturn(Optional.of(admin));
        when(verificationRequestRepository.save(request)).thenReturn(request);
        when(cloudinaryService.buildVerificationPreviewUrl(anyString(), anyString()))
                .thenReturn(request.getDocumentUrl());

        verificationRequestService.verify(request.getId(), new UserPrinciple(admin));

        ArgumentCaptor<CreateNotificationDTO> notificationCaptor =
                ArgumentCaptor.forClass(CreateNotificationDTO.class);
        verify(notificationService).createNotification(notificationCaptor.capture());

        CreateNotificationDTO notification = notificationCaptor.getValue();
        assertEquals(provider.getId(), notification.getUserId());
        assertEquals(NotificationType.VERIFICATION_STATUS.name(), notification.getType());
        assertEquals("Verification approved", notification.getTitle());
        assertEquals(request.getId(), notification.getRelatedId());
    }

    @Test
    void markUnderReview_shouldNotNotifyProvider() {
        Users provider = user(9L, EnumRole.CLINIC);
        Users admin = user(1L, EnumRole.ADMIN);
        VerificationRequest request = verificationRequest(5L, provider);

        when(verificationRequestRepository.findById(request.getId())).thenReturn(Optional.of(request));
        when(usersRepository.findById(admin.getId())).thenReturn(Optional.of(admin));
        when(verificationRequestRepository.save(request)).thenReturn(request);
        when(cloudinaryService.buildVerificationPreviewUrl(anyString(), anyString()))
                .thenReturn(request.getDocumentUrl());

        verificationRequestService.markUnderReview(request.getId(), new UserPrinciple(admin));

        verify(notificationService, never()).createNotification(any());
    }

    private VerificationRequest verificationRequest(Long id, Users provider) {
        VerificationRequest request = new VerificationRequest();
        request.setId(id);
        request.setProvider(provider);
        request.setProviderRole(provider.getRole());
        request.setDocumentUrl("https://example.com/document.jpg");
        request.setDocumentPublicId("petnexus/verification/document");
        request.setDocumentType("LICENSE");
        request.setStatus(VerificationStatus.PENDING);
        return request;
    }

    private Users user(Long id, EnumRole role) {
        Users user = new Users();
        user.setId(id);
        user.setEmail("user" + id + "@test.com");
        user.setPasswordHash("hash");
        user.setRole(role);
        user.setAccountStatus(UserAccountStatus.ACTIVE);
        return user;
    }
}
