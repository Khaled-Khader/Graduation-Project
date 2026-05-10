package com.GraduationProject.GraduationProject.Repository;

import com.GraduationProject.GraduationProject.Entity.Message;
import com.GraduationProject.GraduationProject.Entity.Users;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    /**
     * Find all messages in a chat with pagination
     */
    Page<Message> findByChatIdOrderByCreatedAtAsc(Long chatId, Pageable pageable);

    /**
     * Count unread messages for a user in a specific chat
     */
    Long countByChat_IdAndIsReadFalseAndSender_IdNot(Long chatId, Long userId);

    @Query("""
            SELECT COUNT(m)
            FROM Message m
            WHERE m.isRead = false
              AND m.sender <> :user
              AND (m.chat.owner = :user OR m.chat.provider = :user)
            """)
    Long countUnreadMessagesForUser(@Param("user") Users user);

    @Modifying
    @Query("""
            UPDATE Message m
            SET m.isRead = true,
                m.readAt = :readAt
            WHERE m.chat.id = :chatId
              AND m.sender.id <> :userId
              AND m.isRead = false
            """)
    int markChatMessagesAsRead(
            @Param("chatId") Long chatId,
            @Param("userId") Long userId,
            @Param("readAt") LocalDateTime readAt
    );

}
