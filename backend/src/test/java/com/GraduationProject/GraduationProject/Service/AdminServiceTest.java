package com.GraduationProject.GraduationProject.Service;

import com.GraduationProject.GraduationProject.DTO.AdminUserDTO;
import com.GraduationProject.GraduationProject.DTO.CreateNotificationDTO;
import com.GraduationProject.GraduationProject.Entity.AdoptionPost;
import com.GraduationProject.GraduationProject.Entity.Users;
import com.GraduationProject.GraduationProject.Enum.EnumRole;
import com.GraduationProject.GraduationProject.Enum.NotificationType;
import com.GraduationProject.GraduationProject.Enum.UserAccountStatus;
import com.GraduationProject.GraduationProject.Enum.VerificationStatus;
import com.GraduationProject.GraduationProject.Repository.AdoptionRequestRepository;
import com.GraduationProject.GraduationProject.Repository.CommentRepository;
import com.GraduationProject.GraduationProject.Repository.PostRepository;
import com.GraduationProject.GraduationProject.Repository.UsersRepository;
import com.GraduationProject.GraduationProject.Security.UserPrinciple;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminServiceTest {

    @Mock
    private UsersRepository usersRepository;

    @Mock
    private PostRepository postRepository;

    @Mock
    private CommentRepository commentRepository;

    @Mock
    private AdoptionRequestRepository adoptionRequestRepository;

    @Mock
    private ProviderVerificationService providerVerificationService;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private AdminService adminService;

    @Test
    void suspendUser_shouldSetTargetUserStatusToSuspended() {
        Users target = user(10L, EnumRole.OWNER);
        UserPrinciple admin = new UserPrinciple(user(1L, EnumRole.ADMIN));

        when(usersRepository.findById(target.getId())).thenReturn(Optional.of(target));
        when(usersRepository.save(target)).thenReturn(target);
        when(providerVerificationService.getProviderStatus(target)).thenReturn(VerificationStatus.UNVERIFIED);

        AdminUserDTO result = adminService.suspendUser(target.getId(), "Repeated policy violations", admin);

        assertEquals(UserAccountStatus.SUSPENDED, target.getAccountStatus());
        assertEquals("Repeated policy violations", target.getAccountStatusReason());
        assertEquals("SUSPENDED", result.accountStatus());
        assertEquals("Repeated policy violations", result.accountStatusReason());
        verify(usersRepository).save(target);
    }

    @Test
    void banUser_shouldRejectChangingOwnAdminAccount() {
        Users adminUser = user(1L, EnumRole.ADMIN);
        UserPrinciple admin = new UserPrinciple(adminUser);

        when(usersRepository.findById(adminUser.getId())).thenReturn(Optional.of(adminUser));

        ResponseStatusException ex = assertThrows(
                ResponseStatusException.class,
                () -> adminService.banUser(adminUser.getId(), "Security abuse", admin)
        );

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        verify(usersRepository, never()).save(any());
    }

    @Test
    void banUser_shouldRejectChangingAnotherAdminAccount() {
        Users targetAdmin = user(2L, EnumRole.ADMIN);
        UserPrinciple admin = new UserPrinciple(user(1L, EnumRole.ADMIN));

        when(usersRepository.findById(targetAdmin.getId())).thenReturn(Optional.of(targetAdmin));

        ResponseStatusException ex = assertThrows(
                ResponseStatusException.class,
                () -> adminService.banUser(targetAdmin.getId(), "Security abuse", admin)
        );

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        verify(usersRepository, never()).save(any());
    }

    @Test
    void deletePost_shouldDeleteAdoptionRequestsAndPost() {
        AdoptionPost post = new AdoptionPost();
        post.setUser(user(10L, EnumRole.OWNER));

        when(postRepository.findById(20L)).thenReturn(Optional.of(post));

        adminService.deletePost(20L, "Inappropriate content");

        verify(commentRepository).deleteByPost_Id(20L);
        verify(adoptionRequestRepository).deleteByAdoptionPost_Id(20L);
        verify(postRepository).delete(post);

        ArgumentCaptor<CreateNotificationDTO> notificationCaptor =
                ArgumentCaptor.forClass(CreateNotificationDTO.class);
        verify(notificationService).createNotification(notificationCaptor.capture());

        CreateNotificationDTO notification = notificationCaptor.getValue();
        assertEquals(10L, notification.getUserId());
        assertEquals(NotificationType.ADMIN_MODERATION.name(), notification.getType());
        assertEquals("Post removed by admin", notification.getTitle());
        assertEquals(true, notification.getMessage().contains("Inappropriate content"));
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
