package com.GraduationProject.GraduationProject.Service;

import com.GraduationProject.GraduationProject.DTO.CreateNotificationDTO;
import com.GraduationProject.GraduationProject.DTO.NotificationDTO;
import com.GraduationProject.GraduationProject.Entity.Notification;
import com.GraduationProject.GraduationProject.Entity.Users;
import com.GraduationProject.GraduationProject.Enum.NotificationType;
import com.GraduationProject.GraduationProject.Repository.NotificationRepository;
import com.GraduationProject.GraduationProject.Repository.UsersRepository;
import com.GraduationProject.GraduationProject.Security.UserPrinciple;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UsersRepository usersRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public NotificationService(
            NotificationRepository notificationRepository,
            UsersRepository usersRepository,
            SimpMessagingTemplate messagingTemplate
    ) {
        this.notificationRepository = notificationRepository;
        this.usersRepository = usersRepository;
        this.messagingTemplate = messagingTemplate;
    }

    /**
     * Create a new notification
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public NotificationDTO createNotification(CreateNotificationDTO dto) {
        Users user = usersRepository.findById(dto.getUserId())
                .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "User not found"
        ));

        Notification notification = new Notification();
        notification.setUser(user);
        notification.setType(parseNotificationType(dto.getType()));
        notification.setTitle(dto.getTitle());
        notification.setMessage(dto.getMessage());
        notification.setRelatedId(dto.getRelatedId());

        if (dto.getRelatedEntityType() != null) {
            notification.setRelatedEntityType(
                    parseRelatedEntityType(dto.getRelatedEntityType())
            );
        }

        notification = notificationRepository.save(notification);

        // Send real-time notification via WebSocket
        broadcastNotification(user.getId(), NotificationDTO.fromEntity(notification));

        log.info("Notification created for user {}: {}", user.getId(), notification.getTitle());
        return NotificationDTO.fromEntity(notification);
    }

    /**
     * Get all notifications for current user (paginated)
     */
    @Transactional(readOnly = true)
    public Page<NotificationDTO> getUserNotifications(Pageable pageable) {
        Users currentUser = getCurrentUser();
        return notificationRepository.findByUserOrderByCreatedAtDesc(currentUser, pageable)
                .map(NotificationDTO::fromEntity);
    }

    /**
     * Get unread notifications for current user
     */
    @Transactional(readOnly = true)
    public List<NotificationDTO> getUnreadNotifications() {
        Users currentUser = getCurrentUser();
        return notificationRepository.findByUserAndIsReadFalseOrderByCreatedAtDesc(currentUser)
                .stream()
                .map(NotificationDTO::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Get unread notification count for current user
     */
    @Transactional(readOnly = true)
    public Long getUnreadNotificationCount() {
        Users currentUser = getCurrentUser();
        return notificationRepository.countByUserAndIsReadFalse(currentUser);
    }

    /**
     * Mark notification as read
     */
    @Transactional
    public NotificationDTO markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Notification not found"
        ));

        Users currentUser = getCurrentUser();
        if (!notification.getUser().getId().equals(currentUser.getId())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You cannot access this notification"
            );
        }

        notificationRepository.markAsRead(notificationId, LocalDateTime.now());
        notification.setIsRead(true);
        notification.setReadAt(LocalDateTime.now());

        return NotificationDTO.fromEntity(notification);
    }

    /**
     * Mark all unread notifications as read for current user
     */
    @Transactional
    public void markAllAsRead() {
        Users currentUser = getCurrentUser();
        notificationRepository.markAllAsRead(currentUser, LocalDateTime.now());
    }

    /**
     * Get notifications by type
     */
    @Transactional(readOnly = true)
    public Page<NotificationDTO> getNotificationsByType(String type, Pageable pageable) {
        Users currentUser = getCurrentUser();
        return notificationRepository.findByUserAndTypeOrderByCreatedAtDesc(
                currentUser,
                parseNotificationType(type),
                pageable
        ).map(NotificationDTO::fromEntity);
    }

    /**
     * Delete a notification
     */
    @Transactional
    public void deleteNotification(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Notification not found"
        ));

        Users currentUser = getCurrentUser();
        if (!notification.getUser().getId().equals(currentUser.getId())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You cannot delete this notification"
            );
        }

        notificationRepository.deleteById(notificationId);
    }

    /**
     * Clean up old notifications (older than 30 days)
     */
    @Transactional
    public void cleanupOldNotifications(Users user) {
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        notificationRepository.deleteOldNotifications(user, thirtyDaysAgo);
    }

    /**
     * Broadcast notification to user via WebSocket
     */
    private void broadcastNotification(Long userId, NotificationDTO notification) {
        try {
            messagingTemplate.convertAndSend(
                    "/topic/users/" + userId + "/notifications",
                    notification
            );
        } catch (Exception e) {
            log.error("Failed to broadcast notification to user {}: {}", userId, e.getMessage());
        }
    }

    private NotificationType parseNotificationType(String type) {
        try {
            return NotificationType.valueOf(type);
        } catch (IllegalArgumentException | NullPointerException e) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid notification type"
            );
        }
    }

    private Notification.RelatedEntityType parseRelatedEntityType(String relatedEntityType) {
        try {
            return Notification.RelatedEntityType.valueOf(relatedEntityType);
        } catch (IllegalArgumentException | NullPointerException e) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid related entity type"
            );
        }
    }

    /**
     * Get current authenticated user
     */
    private Users getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UserPrinciple)) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "User not authenticated"
            );
        }

        UserPrinciple userPrinciple = (UserPrinciple) authentication.getPrincipal();
        return usersRepository.findById(userPrinciple.getId())
                .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "User not found"
        ));
    }
}
