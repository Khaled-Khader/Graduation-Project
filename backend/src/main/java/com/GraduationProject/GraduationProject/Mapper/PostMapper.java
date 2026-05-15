package com.GraduationProject.GraduationProject.Mapper;

import com.GraduationProject.GraduationProject.DTO.PetDTO;
import com.GraduationProject.GraduationProject.DTO.post.AdoptionPostDTO;
import com.GraduationProject.GraduationProject.DTO.post.RegularPostDTO;
import com.GraduationProject.GraduationProject.Entity.*;

/**
 * Utility class for mapping Post entities to their respective DTOs.
 *
 * This class provides static methods to convert RegularPost and AdoptionPost
 * entities (with their associated user and pet info) into clean DTOs for API responses.
 */
public class PostMapper {


    private PostMapper() {

    }

    /**
     * Resolves a user's display name.
     * If the user has a UserInfo object, combines first and last name.
     * Otherwise, falls back to the user's email.
     *
     * @param user The user entity
     * @return The resolved name as a String
     */
    private static String resolveUserName(Users user) {
        UserInfo info = user.getUserInfo();
        if (info != null) {
            String firstName = info.getFirstName() != null ? info.getFirstName() : "";
            String lastName = info.getLastName() != null ? info.getLastName() : "";
            String name = (firstName + " " + lastName).trim();
            if (!name.isBlank()) {
                return name;
            }
        }

        return user.getEmail();
    }

    private static String resolveUserImageUrl(Users user) {
        UserInfo info = user.getUserInfo();
        return info != null ? info.getPhotoUrl() : null;
    }

    /**
     * Maps a Pet entity to a PetDTO.
     *
     * @param pet The Pet entity
     * @return PetDTO representing the pet
     */
    private static PetDTO toPetDTO(Pet pet) {
        return new PetDTO(
                pet.getId(),
                pet.getName(),
                pet.getSpecies(),
                pet.getAge(),
                pet.getPhotoUrl(),
                pet.getHealthStatus(),
                pet.getGender(),
                pet.isHasVaccineCert(),
                true
        );
    }

    /**
     * Maps a RegularPost entity to a RegularPostDTO.
     *
     * @param post The RegularPost entity
     * @return RegularPostDTO representing the post
     */
    public static RegularPostDTO toRegularPostDTO(RegularPost post) {
        return toRegularPostDTO(post, null);
    }

    public static RegularPostDTO toRegularPostDTO(RegularPost post, Long currentUserId) {
        RegularPostDTO dto = new RegularPostDTO();

        dto.setId(post.getId());
        dto.setContent(post.getContent());
        dto.setImageUrl(post.getImageUrl());
        dto.setCreatedAt(post.getCreatedAt());
        dto.setUpdatedAt(post.getUpdatedAt());
        dto.setPostType("REGULAR");
        dto.setCommentCount(post.getComments().size());
        dto.setOwnerId(post.getUser().getId());
        dto.setOwnerName(resolveUserName(post.getUser()));
        dto.setUserImageUrl(resolveUserImageUrl(post.getUser()));
        dto.setOwnedByCurrentUser(currentUserId != null && post.getUser().getId().equals(currentUserId));

        return dto;
    }

    /**
     * Maps an AdoptionPost entity to an AdoptionPostDTO.
     *
     * @param post The AdoptionPost entity
     * @return AdoptionPostDTO representing the post
     */
    public static AdoptionPostDTO toAdoptionPostDTO(AdoptionPost post) {
        return toAdoptionPostDTO(post, false, null);
    }

    public static AdoptionPostDTO toAdoptionPostDTO(AdoptionPost post, boolean requestedByCurrentUser) {
        return toAdoptionPostDTO(post, requestedByCurrentUser, null);
    }

    public static AdoptionPostDTO toAdoptionPostDTO(
            AdoptionPost post,
            boolean requestedByCurrentUser,
            Long currentUserId
    ) {
        AdoptionPostDTO dto = new AdoptionPostDTO();

        dto.setId(post.getId());
        dto.setUserId(post.getUser().getId());
        dto.setOwnerId(post.getUser().getId());
        dto.setOwnerName(resolveUserName(post.getUser()));
        dto.setUserImageUrl(resolveUserImageUrl(post.getUser()));
        dto.setContent(post.getContent());
        dto.setImageUrl(post.getImageUrl());
        dto.setCreatedAt(post.getCreatedAt());
        dto.setUpdatedAt(post.getUpdatedAt());
        dto.setPostType("ADOPTION");
        dto.setPetDTO(toPetDTO(post.getPet()));
        dto.setCity(post.getCity());
        dto.setAdoptionStatus(post.getAdoptionStatus().name());
        dto.setRequestedByCurrentUser(requestedByCurrentUser);
        dto.setOwnedByCurrentUser(currentUserId != null && post.getUser().getId().equals(currentUserId));

        return dto;
    }
}
