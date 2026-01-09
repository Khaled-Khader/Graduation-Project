package com.GraduationProject.GraduationProject.Factory;

import com.GraduationProject.GraduationProject.DTO.post.CreatePostDTO;
import com.GraduationProject.GraduationProject.Entity.AdoptionPost;
import com.GraduationProject.GraduationProject.Entity.RegularPost;
import com.GraduationProject.GraduationProject.Entity.Users;
import com.GraduationProject.GraduationProject.Entity.Pet;

public class PostFactory {

    private PostFactory() {
        // utility class
    }

    public static RegularPost createRegularPost(
            CreatePostDTO dto,
            Users owner
    ) {
        RegularPost post = new RegularPost();

        post.setUser(owner);
        post.setContent(dto.getContent());
        post.setImageUrl(dto.getImageUrl());

        return post;
    }


    public static AdoptionPost createAdoptionPost(
            CreatePostDTO dto,
            Users owner,
            Pet pet
    ) {
        AdoptionPost post = new AdoptionPost();

        post.setUser(owner);
        post.setContent(dto.getContent());
        post.setImageUrl(dto.getImageUrl());

        post.setPet(pet);
        post.setCity(dto.getCity());

        return post;
    }
}
