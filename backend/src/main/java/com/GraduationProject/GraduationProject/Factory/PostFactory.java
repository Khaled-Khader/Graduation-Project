package com.GraduationProject.GraduationProject.Factory;

import com.GraduationProject.GraduationProject.DTO.post.CreatePostDTO;
import com.GraduationProject.GraduationProject.Entity.AdoptionPost;
import com.GraduationProject.GraduationProject.Entity.RegularPost;
import com.GraduationProject.GraduationProject.Entity.Users;
import com.GraduationProject.GraduationProject.Entity.Pet;

/**
 * Factory class for creating post entities.
 *
 *
 * This class provides static methods to create instances of
 * {@link RegularPost} and {@link AdoptionPost} from incoming
 * DTOs. It ensures consistent construction and initialization
 * of post entities across the application.
 *
 *
 *
 * Note: Text content from the DTO is stored as-is. Any
 * frontend rendering of this content should properly sanitize it
 * to prevent XSS attacks.
 *
 */
public class PostFactory {


    private PostFactory() { }


    /**
     * Creates a {@link RegularPost} entity from the provided DTO and owner.
     *
     * @param dto   The DTO containing post content and optional image URL
     * @param owner The user who owns the post
     * @return A fully initialized RegularPost ready for persistence
     *
     * Security Note: Content is stored as-is; sanitize before rendering in frontend.
     */
    public static RegularPost createRegularPost(CreatePostDTO dto, Users owner) {
        RegularPost post = new RegularPost();

        post.setUser(owner);
        post.setContent(dto.getContent());
        post.setImageUrl(dto.getImageUrl());

        return post;
    }


    /**
     * Creates an {@link AdoptionPost} entity from the provided DTO, owner, and associated pet.
     *
     * @param dto   The DTO containing post content, city, and optional image URL
     * @param owner The user who owns the post
     * @param pet   The pet associated with this adoption post
     * @return A fully initialized AdoptionPost ready for persistence
     *
     * Security Note: Content is stored as-is; sanitize before rendering in frontend.
     */
    public static AdoptionPost createAdoptionPost(CreatePostDTO dto, Users owner, Pet pet) {
        AdoptionPost post = new AdoptionPost();

        post.setUser(owner);
        post.setContent(dto.getContent());
        post.setImageUrl(dto.getImageUrl());

        post.setPet(pet);
        post.setCity(dto.getCity());

        return post;
    }
}
