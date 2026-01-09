package com.GraduationProject.GraduationProject.DTO.post;

import com.GraduationProject.GraduationProject.DTO.PetDTO;
import lombok.Data;

import java.time.LocalDateTime;
@Data
public class RegularPostDTO implements AllPosts {

    Long id;
    String content;
    String imageUrl;
    String userImageUrl;
    LocalDateTime createdAt;
    String postType;
    int commentCount;
    Long ownerId;
    String ownerName;
}
