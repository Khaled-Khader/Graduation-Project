package com.GraduationProject.GraduationProject.DTO.post;

import lombok.Data;

import java.time.Instant;
@Data
public class RegularPostDTO implements AllPosts {

    Long id;
    String content;
    String imageUrl;
    String userImageUrl;
    Instant createdAt;
    Instant updatedAt;
    String postType;
    int commentCount;
    Long ownerId;
    String ownerName;
    boolean ownedByCurrentUser;
}
