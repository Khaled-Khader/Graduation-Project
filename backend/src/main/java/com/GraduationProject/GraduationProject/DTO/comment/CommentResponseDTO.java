package com.GraduationProject.GraduationProject.DTO.comment;

import lombok.Data;

import java.time.Instant;
@Data
public class CommentResponseDTO {
    Long id;
    String content;
    Long userId;
    String userName;
    String userImageUrl;
    Instant createdAt;
}
