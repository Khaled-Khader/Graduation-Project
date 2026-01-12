package com.GraduationProject.GraduationProject.Controller;

import com.GraduationProject.GraduationProject.DTO.post.AdoptionPostDTO;
import com.GraduationProject.GraduationProject.DTO.post.AllPosts;
import com.GraduationProject.GraduationProject.DTO.post.CreatePostDTO;
import com.GraduationProject.GraduationProject.DTO.post.RegularPostDTO;
import com.GraduationProject.GraduationProject.Service.PostService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Controller for managing posts in PetNexus.
 *
 * Responsibilities:
 *  - Creating regular and adoption posts
 *  - Retrieving posts for feeds (regular, adoption, all)
 *  - Retrieving adoption posts of the authenticated user
 *
 * Pagination is supported using Spring's Pageable.
 */
@RestController
@RequestMapping("/post")
public class PostController {

    private final PostService postService;

    public PostController(PostService postService) {
        this.postService = postService;
    }


    /**
     * Adds a new regular post for the authenticated user.
     *
     * @param dto DTO containing post details (title, content, image, etc.)
     * @return DTO representing the created regular post
     */
    @PostMapping("/regular")
    public RegularPostDTO createRegularPost(@RequestBody CreatePostDTO dto) {
        return postService.createRegularPost(dto);
    }


    /**
     * Adds a new adoption post for the authenticated user.
     * The pet must belong to the user and not already have an adoption post.
     *
     * @param dto DTO containing adoption post details
     * @return DTO representing the created adoption post
     */
    @PostMapping("/adoption")
    public AdoptionPostDTO createAdoptionPost(@RequestBody CreatePostDTO dto) {
        return postService.createAdoptionPost(dto);
    }

    @GetMapping("/user/adoption")
    public List<AdoptionPostDTO> getAdoptionPostsForUser() {
        return postService.getAdoptionPostsByUserId();
    }



    /**
     * Retrieves a feed of regular posts (paginated and shuffled).
     *
     * @param pageable Pageable object to control page size and number
     * @return Page of RegularPostDTO objects
     */
    @GetMapping("/feed/regular")
    public Page<RegularPostDTO> getRegularPosts(@PageableDefault(size = 10) Pageable pageable) {
        List<RegularPostDTO> regularPostDTOS = new ArrayList<>();
        postService.getRegularPosts(pageable).forEach(regularPostDTOS::add);

        Collections.shuffle(regularPostDTOS); // Shuffle feed for randomness
        return new PageImpl<>(regularPostDTOS, pageable, regularPostDTOS.size());
    }

    /**
     * Retrieves a feed of adoption posts (paginated and shuffled).
     *
     * @param pageable Pageable object to control page size and number
     * @return Page of AdoptionPostDTO objects
     */
    @GetMapping("/feed/adoption")
    public Page<AdoptionPostDTO> getAdoptionPosts(@PageableDefault(size = 10) Pageable pageable) {
        List<AdoptionPostDTO> adoptionPostDTOS = new ArrayList<>();
        postService.getAdoptionPosts(pageable).forEach(adoptionPostDTOS::add);

        Collections.shuffle(adoptionPostDTOS);
        return new PageImpl<>(adoptionPostDTOS, pageable, adoptionPostDTOS.size());
    }

    /**
     * Retrieves a feed containing all posts (regular + adoption), paginated and shuffled.
     *
     * @param pageable Pageable object to control page size and number
     * @return Page of AllPosts objects (can be either RegularPostDTO or AdoptionPostDTO)
     */
    @GetMapping("/feed/all")
    public Page<AllPosts> getAllPosts(@PageableDefault(size = 10) Pageable pageable) {
        List<AllPosts> allPosts = new ArrayList<>();

        postService.getRegularPosts(pageable).forEach(allPosts::add);
        postService.getAdoptionPosts(pageable).forEach(allPosts::add);

        Collections.shuffle(allPosts);
        return new PageImpl<>(allPosts, pageable, allPosts.size());
    }
}
