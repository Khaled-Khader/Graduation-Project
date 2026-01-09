package com.GraduationProject.GraduationProject.Mapper;

import com.GraduationProject.GraduationProject.DTO.PetDTO;
import com.GraduationProject.GraduationProject.DTO.post.AdoptionPostDTO;
import com.GraduationProject.GraduationProject.DTO.post.RegularPostDTO;
import com.GraduationProject.GraduationProject.Entity.*;

public class PostMapper {

    private PostMapper() {
        // utility class
    }

    // =================================================
    // Common helper (لتوحيد المنطق)
    // =================================================
    private static String resolveUserName(Users user) {
        UserInfo info = user.getUserInfo();
        return info != null
                ? info.getFirstName() + " " + info.getLastName()
                : user.getEmail();
    }

    private static PetDTO toPetDTO(Pet pet) {
        PetDTO dto =new PetDTO(
               pet.getId(),
                pet.getName(),
                pet.getSpecies(),
                pet.getAge(),
                pet.getPhotoUrl(),
                pet.getHealthStatus(),
                pet.getGender(),
                pet.isHasVaccineCert()
        );
        return dto;
    }

    // =================================================
    // Feed response (generic Post)
    // =================================================


    // =================================================
    // Regular Post DTO
    // =================================================
    public static RegularPostDTO toRegularPostDTO(RegularPost post) {

        RegularPostDTO dto = new RegularPostDTO();

        dto.setId(post.getId());
        dto.setContent(post.getContent());
        dto.setImageUrl(post.getImageUrl());
        dto.setCreatedAt(post.getCreatedAt());
        dto.setPostType("REGULAR");
        dto.setCommentCount(post.getComments().size());
        dto.setOwnerId(post.getUser().getId());
        dto.setOwnerName(resolveUserName(post.getUser()));
        dto.setUserImageUrl(post.getUser().getUserInfo().getPhotoUrl());
        return dto;
    }

    // =================================================
    // Adoption Post DTO
    // =================================================
    public static AdoptionPostDTO toAdoptionPostDTO(AdoptionPost post) {

        AdoptionPostDTO dto = new AdoptionPostDTO();

        dto.setId(post.getId());
        dto.setUserId(post.getUser().getId());
        dto.setContent(post.getContent());
        dto.setCreatedAt(post.getCreatedAt());
        dto.setPostType("ADOPTION");
        PetDTO petDTO = new PetDTO(
                post.getPet().getId(),
                post.getPet().getName(),
                post.getPet().getSpecies(),
                post.getPet().getAge(),
                post.getPet().getPhotoUrl(),
                post.getPet().getHealthStatus(),
                post.getPet().getGender(),
                post.getPet().isHasVaccineCert()
        );

        dto.setPetDTO(petDTO);
        dto.setCity(post.getCity());
        dto.setAdoptionStatus(post.getAdoptionStatus().name());

        return dto;
    }
}
