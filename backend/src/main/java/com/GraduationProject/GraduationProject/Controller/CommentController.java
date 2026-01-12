package com.GraduationProject.GraduationProject.Controller;

import com.GraduationProject.GraduationProject.DTO.comment.CommentResponseDTO;
import com.GraduationProject.GraduationProject.DTO.comment.CreateCommentDTO;
import com.GraduationProject.GraduationProject.Service.CommentService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;

/**
 * Controller for handling comments on posts.
 *
 * Responsibilities:
 *  - Adding a comment to a regular post
 *  - Fetching comments for a specific post (with pagination)
 *
 * Maps HTTP requests to the corresponding service layer methods.
 */
@RestController
@RequestMapping("/comment")
public class CommentController {

    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }


    /**
     * Adds a comment to a specific regular post.
     *
     * Only regular posts are allowed for commenting.
     *
     * @param postId ID of the post to comment on
     * @param dto    DTO containing the comment content
     */
    @PostMapping("/post/{postId}")
    public void addComment(
            @PathVariable Long postId,
            @RequestBody CreateCommentDTO dto
    ) {
        commentService.addComment(postId, dto.getContent());
    }


    /**
     * Retrieves all comments for a specific post, paginated.
     *
     * @param postId   ID of the post
     * @param pageable Pageable object specifying page number, size, and sorting
     * @return Page of CommentResponseDTO containing comment details
     */
    @GetMapping("/post/{postId}")
    public Page<CommentResponseDTO> getComments(
            @PathVariable Long postId,
            @PageableDefault(size = 10) Pageable pageable
    ) {
        return commentService.getComments(postId, pageable);
    }
}
