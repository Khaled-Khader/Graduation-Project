package com.GraduationProject.GraduationProject.DTO.comment;

import lombok.Data;

import java.time.LocalDateTime;
@Data
public class CommentResponseDTO {
    Long id;
    String content;
    String userName;
    LocalDateTime createdAt;
}
