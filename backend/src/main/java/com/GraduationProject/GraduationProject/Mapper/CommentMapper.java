package com.GraduationProject.GraduationProject.Mapper;

import com.GraduationProject.GraduationProject.DTO.comment.CommentResponseDTO;
import com.GraduationProject.GraduationProject.Entity.Comment;
import com.GraduationProject.GraduationProject.Entity.UserInfo;

public class CommentMapper {

    private CommentMapper() {
        // utility class
    }

    public static CommentResponseDTO toDTO(Comment comment) {

        CommentResponseDTO dto = new CommentResponseDTO();

        dto.setId(comment.getId());
        dto.setContent(comment.getContent());
        dto.setCreatedAt(comment.getCreatedAt());

        UserInfo info = comment.getUser().getUserInfo();

        if (info != null) {
            dto.setUserName(info.getFirstName() + " " + info.getLastName());
        } else {
            // fallback (احتياطي)
            dto.setUserName(comment.getUser().getEmail());
        }

        return dto;
    }
}
