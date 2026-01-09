package com.GraduationProject.GraduationProject.Controller;

import com.GraduationProject.GraduationProject.DTO.comment.CommentResponseDTO;
import com.GraduationProject.GraduationProject.DTO.comment.CreateCommentDTO;
import com.GraduationProject.GraduationProject.Service.CommentService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/comment")
public class CommentController {

    private final CommentService commentService;

    public CommentController(
            CommentService commentService
    ) {
        this.commentService = commentService;
    }

    // =========================================
    // Add comment
    // =========================================
    @PostMapping("/post/{postId}")
    public void addComment(
            @PathVariable Long postId,
            @RequestBody CreateCommentDTO dto
    ) {

        commentService.addComment( postId, dto.getContent());
    }

    // =========================================
    // Get comments (Pagination)
    // =========================================
    @GetMapping("/post/{postId}")
    public Page<CommentResponseDTO> getComments(
            @PathVariable Long postId,
            @PageableDefault(size = 10) Pageable pageable
    ) {
        return commentService.getComments(postId, pageable);
    }
}
