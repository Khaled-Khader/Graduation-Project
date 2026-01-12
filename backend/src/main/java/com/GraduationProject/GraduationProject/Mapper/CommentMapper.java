package com.GraduationProject.GraduationProject.Mapper;

import com.GraduationProject.GraduationProject.DTO.comment.CommentResponseDTO;
import com.GraduationProject.GraduationProject.Entity.Comment;
import com.GraduationProject.GraduationProject.Entity.UserInfo;

/**
 * Utility class for mapping Comment entities to CommentResponseDTOs.
 *
 * This class provides a static method to convert a Comment entity
 * with its associated user info into a DTO suitable for API responses.
 */
public class CommentMapper {


    private CommentMapper() {

    }

    /**
     * Maps a Comment entity to a CommentResponseDTO.
     *
     * The method extracts:
     * - Comment ID
     * - Content of the comment
     * - Creation timestamp
     * - User's full name (or email as fallback if name is not available)
     *
     * @param comment The Comment entity to map
     * @return A CommentResponseDTO representing the comment
     */
    public static CommentResponseDTO toDTO(Comment comment) {
        CommentResponseDTO dto = new CommentResponseDTO();


        dto.setId(comment.getId());
        dto.setContent(comment.getContent());
        dto.setCreatedAt(comment.getCreatedAt());


        UserInfo info = comment.getUser().getUserInfo();
        if (info != null) {
            dto.setUserName(info.getFirstName() + " " + info.getLastName());
        } else {
            dto.setUserName(comment.getUser().getEmail());
        }

        return dto;
    }
}
