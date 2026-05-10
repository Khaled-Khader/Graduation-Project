package com.GraduationProject.GraduationProject.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatDTO {

    private Long id;

    private Long ownerId;

    private String ownerName;

    private String ownerProfileImage;

    private Long providerId;

    private String providerName;

    private String providerProfileImage;

    private String providerRole; // VET or CLINIC

    private String createdAt;

    private String lastMessageAt;

    private Boolean isActive;

    private List<MessageDTO> messages;

}
