package com.GraduationProject.GraduationProject.DTO.post;
import jakarta.validation.constraints.NotBlank;

import lombok.Data;

@Data
public class CreatePostDTO {

    @NotBlank
    private String content;

    private String imageUrl;

    // adoption only
    private Long petId;
    private String city;
}
