package com.GraduationProject.GraduationProject.DTO.post;

import com.GraduationProject.GraduationProject.DTO.PetDTO;
import lombok.Data;

import java.time.LocalDateTime;
@Data
public class AdoptionPostDTO implements AllPosts {
    Long id;
    Long userId;
    String content;
    LocalDateTime createdAt;
    String postType;
    PetDTO petDTO;
    String city;
    String adoptionStatus;
}
