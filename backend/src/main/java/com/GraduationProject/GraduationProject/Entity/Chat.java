package com.GraduationProject.GraduationProject.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(
        name = "chats",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_chat_owner_provider",
                columnNames = {"owner_id", "provider_id"}
        ),
        indexes = {
                @Index(name = "idx_chat_owner", columnList = "owner_id"),
                @Index(name = "idx_chat_provider", columnList = "provider_id"),
                @Index(name = "idx_chat_last_message_at", columnList = "last_message_at")
        }
)
public class Chat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private Users owner; // Pet owner who initiated the chat

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "provider_id", nullable = false)
    private Users provider; // Veterinarian or Clinic who can reply

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "last_message_at")
    private LocalDateTime lastMessageAt;

    @OneToMany(
            mappedBy = "chat",
            cascade = CascadeType.ALL,
            orphanRemoval = true,
            fetch = FetchType.LAZY
    )
    private List<Message> messages = new ArrayList<>();

    @Column(name = "is_active")
    private Boolean isActive = true;

}
