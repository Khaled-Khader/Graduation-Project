package com.GraduationProject.GraduationProject.Repository;

import com.GraduationProject.GraduationProject.Entity.Notification;
import com.GraduationProject.GraduationProject.Entity.Users;
import com.GraduationProject.GraduationProject.Enum.NotificationType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    /**
     * Find all notifications for a user with pagination
     */
    Page<Notification> findByUserOrderByCreatedAtDesc(Users user, Pageable pageable);

    /**
     * Find unread notifications for a user
     */
    List<Notification> findByUserAndIsReadFalseOrderByCreatedAtDesc(Users user);

    /**
     * Count unread notifications for a user
     */
    Long countByUserAndIsReadFalse(Users user);

    /**
     * Find notifications by user and type
     */
    Page<Notification> findByUserAndTypeOrderByCreatedAtDesc(
            Users user,
            NotificationType type,
            Pageable pageable
    );

    /**
     * Find notifications related to a specific entity
     */
    List<Notification> findByUserAndRelatedIdOrderByCreatedAtDesc(Users user, Long relatedId);

    /**
     * Mark a notification as read
     */
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true, n.readAt = :readAt WHERE n.id = :notificationId")
    void markAsRead(@Param("notificationId") Long notificationId, @Param("readAt") LocalDateTime readAt);

    /**
     * Mark all unread notifications as read for a user
     */
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true, n.readAt = :readAt "
            + "WHERE n.user = :user AND n.isRead = false")
    void markAllAsRead(@Param("user") Users user, @Param("readAt") LocalDateTime readAt);

    /**
     * Delete old notifications (older than specified date)
     */
    @Modifying
    @Query("DELETE FROM Notification n WHERE n.user = :user AND n.createdAt < :date")
    void deleteOldNotifications(@Param("user") Users user, @Param("date") LocalDateTime date);

    /**
     * Find recent notifications for a user
     */
    List<Notification> findTop10ByUserOrderByCreatedAtDesc(Users user);
}
