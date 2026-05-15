package com.GraduationProject.GraduationProject.Controller;

import com.GraduationProject.GraduationProject.DTO.post.AdoptionPostDTO;
import com.GraduationProject.GraduationProject.DTO.post.AllPosts;
import com.GraduationProject.GraduationProject.DTO.post.CreatePostDTO;
import com.GraduationProject.GraduationProject.DTO.post.RegularPostDTO;
import com.GraduationProject.GraduationProject.Service.PostService;
import org.springframework.http.HttpStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.*;

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

    @PutMapping("/{postId}")
    public AllPosts updatePost(
            @PathVariable Long postId,
            @RequestBody CreatePostDTO dto
    ) {
        return postService.updatePost(postId, dto);
    }

    @DeleteMapping("/{postId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletePost(@PathVariable Long postId) {
        postService.deletePost(postId);
    }

    /**
     * Retrieves a feed of regular posts (paginated and shuffled).
     *
     * @param pageable Pageable object to control page size and number
     * @return Page of RegularPostDTO objects
     */
    @GetMapping("/feed/regular")
    public Page<RegularPostDTO> getRegularPosts(
            @PageableDefault(size = 10) Pageable pageable,
            @RequestParam(defaultValue = "latest") String sortBy
    ) {
        return postService.getRegularPosts(pageable, sortBy);
    }

    /**
     * Retrieves a feed of adoption posts (paginated and shuffled).
     *
     * @param pageable Pageable object to control page size and number
     * @return Page of AdoptionPostDTO objects
     */
    @GetMapping("/feed/adoption")
    public Page<AdoptionPostDTO> getAdoptionPosts(
            @PageableDefault(size = 10) Pageable pageable,
            @RequestParam(defaultValue = "latest") String sortBy
    ) {
        return postService.getAdoptionPosts(pageable, sortBy);
    }

    /**
     * Retrieves a feed containing all posts (regular + adoption), paginated and shuffled.
     *
     * @param pageable Pageable object to control page size and number
     * @return Page of AllPosts objects (can be either RegularPostDTO or AdoptionPostDTO)
     */
    @GetMapping("/feed/all")
    public Page<AllPosts> getAllPosts(
            @PageableDefault(size = 10) Pageable pageable,
            @RequestParam(defaultValue = "latest") String sortBy
    ) {
        return postService.getAllPosts(pageable, sortBy);
    }
}
