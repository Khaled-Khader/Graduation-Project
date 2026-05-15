package com.GraduationProject.GraduationProject.DTO.post;

import com.GraduationProject.GraduationProject.DTO.PetDTO;
import lombok.Data;

import java.time.Instant;
@Data
public class AdoptionPostDTO implements AllPosts {
    Long id;
    Long userId;
    Long ownerId;
    String ownerName;
    String userImageUrl;
    String content;
    String imageUrl;
    Instant createdAt;
    Instant updatedAt;
    String postType;
    PetDTO petDTO;
    String city;
    String adoptionStatus;
    boolean requestedByCurrentUser;
    boolean ownedByCurrentUser;
}
