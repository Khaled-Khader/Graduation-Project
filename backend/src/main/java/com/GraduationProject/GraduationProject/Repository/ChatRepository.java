package com.GraduationProject.GraduationProject.Repository;

import com.GraduationProject.GraduationProject.Entity.Chat;
import com.GraduationProject.GraduationProject.Entity.Users;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatRepository extends JpaRepository<Chat, Long> {

    /**
     * Find a chat between owner and provider
     */
    @Query("SELECT c FROM Chat c WHERE "
            + "(c.owner = :owner AND c.provider = :provider) OR "
            + "(c.owner = :provider AND c.provider = :owner)")
    Optional<Chat> findChatBetween(@Param("owner") Users owner, @Param("provider") Users provider);

    /**
     * Find all chats for a user (both as owner and provider)
     */
    @Query("SELECT c FROM Chat c WHERE c.owner = :user OR c.provider = :user "
            + "ORDER BY COALESCE(c.lastMessageAt, c.createdAt) DESC")
    Page<Chat> findUserChats(@Param("user") Users user, Pageable pageable);

    /**
     * Find all chats where user is the owner (pet owner)
     */
    List<Chat> findByOwnerOrderByLastMessageAtDesc(Users owner);

    /**
     * Find all chats where user is the provider (vet/clinic)
     */
    List<Chat> findByProviderOrderByLastMessageAtDesc(Users provider);

    /**
     * Find active chats only
     */
    @Query("SELECT c FROM Chat c WHERE (c.owner = :user OR c.provider = :user) AND c.isActive = true")
    List<Chat> findActiveChatsForUser(@Param("user") Users user);

}
