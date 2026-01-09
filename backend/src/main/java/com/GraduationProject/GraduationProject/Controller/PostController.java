package com.GraduationProject.GraduationProject.Controller;

import com.GraduationProject.GraduationProject.DTO.post.AdoptionPostDTO;
import com.GraduationProject.GraduationProject.DTO.post.AllPosts;
import com.GraduationProject.GraduationProject.DTO.post.CreatePostDTO;
import com.GraduationProject.GraduationProject.DTO.post.RegularPostDTO;
import com.GraduationProject.GraduationProject.Service.PostService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Iterator;
import java.util.List;
import java.util.function.Function;

@RestController
@RequestMapping("/post")
public class PostController {

    private final PostService postService;

    public PostController(PostService postService) {
        this.postService = postService;
    }

    // =========================================
    // Create Regular Post
    // =========================================
    @PostMapping("/regular")
    public RegularPostDTO createRegularPost(
            @RequestBody CreatePostDTO dto
    ) {
        return postService.createRegularPost(dto);
    }

    // =========================================
    // Create Adoption Post
    // =========================================
    @PostMapping("/adoption")
    public AdoptionPostDTO createAdoptionPost(
            @RequestBody CreatePostDTO dto
    ) {
        return postService.createAdoptionPost(dto);
    }

    @GetMapping("/user/adoption")
    public List<AdoptionPostDTO> getAdoptionPostsForUser() {
        return postService.getAdoptionPostsByUserId();
    }

    // =========================================
    // Feed (ALL / REGULAR / ADOPTION)
    // =========================================

    @GetMapping("/feed/regular")
    public Page<RegularPostDTO> getRegularPosts(
            @PageableDefault( size = 10) Pageable pageable
    ){
        List<RegularPostDTO>regularPostDTOS=new ArrayList<>();
        for(RegularPostDTO r:postService.getRegularPosts(pageable)){
            regularPostDTOS.add(r);
        }

        Collections.shuffle(regularPostDTOS);
        return new PageImpl<>(regularPostDTOS,pageable,regularPostDTOS.size());
    }

    @GetMapping("/feed/adoption")
    public Page<AdoptionPostDTO> getAdoptionPosts(
            @PageableDefault( size = 10) Pageable pageable
    ){
        List<AdoptionPostDTO>adoptionPostDTOS=new ArrayList<>();
        for(AdoptionPostDTO r:postService.getAdoptionPosts(pageable)){
            adoptionPostDTOS.add(r);
        }

        Collections.shuffle(adoptionPostDTOS);
        return new PageImpl<>(adoptionPostDTOS,pageable,adoptionPostDTOS.size());
    }

    @GetMapping("/feed/all")
    public Page<AllPosts> getAllPosts(
            @PageableDefault( size = 10) Pageable pageable
    ){


        List<AllPosts> allPosts = new ArrayList<>();

        for (RegularPostDTO r : postService.getRegularPosts(pageable)) {
            allPosts.add(r);
        }

        for (AdoptionPostDTO a : postService.getAdoptionPosts(pageable)) {
            allPosts.add(a);
        }

        Collections.shuffle(allPosts);
        return new PageImpl<>(allPosts, pageable, allPosts.size());
    }

}
