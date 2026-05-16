package com.GraduationProject.GraduationProject.Controller;

import com.GraduationProject.GraduationProject.DTO.AdminBroadcastNotificationDTO;
import com.GraduationProject.GraduationProject.DTO.AdminBroadcastNotificationResponseDTO;
import com.GraduationProject.GraduationProject.Service.NotificationService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/notifications")
public class AdminNotificationController {

    private final NotificationService notificationService;

    public AdminNotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @PostMapping("/broadcast")
    public AdminBroadcastNotificationResponseDTO broadcastAnnouncement(
            @RequestBody AdminBroadcastNotificationDTO dto
    ) {
        int deliveredCount = notificationService.broadcastAdminAnnouncement(
                dto.title(),
                dto.message()
        );

        return new AdminBroadcastNotificationResponseDTO(deliveredCount);
    }
}
