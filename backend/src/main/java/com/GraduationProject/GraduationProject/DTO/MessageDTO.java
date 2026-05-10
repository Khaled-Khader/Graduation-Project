package com.GraduationProject.GraduationProject.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MessageDTO {

    private Long id;

    private Long senderId;

    private String senderName;

    private String senderProfileImage;

    private String content;

    private String createdAt;

    private Boolean isRead;

}
