package com.GraduationProject.GraduationProject.DTO;

import com.GraduationProject.GraduationProject.Entity.Notification;
import com.GraduationProject.GraduationProject.Enum.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDTO {

    private Long id;
    private NotificationType type;
    private String title;
    private String message;
    private Long relatedId;
    private String relatedEntityType;
    private Boolean isRead;
    private LocalDateTime createdAt;
    private LocalDateTime readAt;

    public static NotificationDTO fromEntity(Notification notification) {
        return new NotificationDTO(
                notification.getId(),
                notification.getType(),
                notification.getTitle(),
                notification.getMessage(),
                notification.getRelatedId(),
                notification.getRelatedEntityType() != null
                ? notification.getRelatedEntityType().toString() : null,
                notification.getIsRead(),
                notification.getCreatedAt(),
                notification.getReadAt()
        );
    }
}
