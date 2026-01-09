package com.GraduationProject.GraduationProject.Service;

import com.GraduationProject.GraduationProject.DTO.comment.CommentResponseDTO;
import com.GraduationProject.GraduationProject.Entity.Comment;
import com.GraduationProject.GraduationProject.Entity.Post;
import com.GraduationProject.GraduationProject.Entity.RegularPost;
import com.GraduationProject.GraduationProject.Entity.Users;
import com.GraduationProject.GraduationProject.Mapper.CommentMapper;
import com.GraduationProject.GraduationProject.Repository.CommentRepository;
import com.GraduationProject.GraduationProject.Repository.PostRepository;
import com.GraduationProject.GraduationProject.Repository.UsersRepository;
import com.GraduationProject.GraduationProject.Security.UserPrinciple;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@Transactional
public class CommentService {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final UsersRepository usersRepository;

    public CommentService(
            CommentRepository commentRepository,
            PostRepository postRepository,
            UsersRepository usersRepository
    ) {
        this.commentRepository = commentRepository;
        this.postRepository = postRepository;
        this.usersRepository = usersRepository;
    }

    // =========================================
    // Add comment (ONLY Regular Post)
    // =========================================
    public void addComment(
            Long postId,
            String content
    ) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserPrinciple userPrinciple = (UserPrinciple) authentication.getPrincipal();
        Users user = usersRepository.findById(userPrinciple.getId())
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new EntityNotFoundException("Post not found"));

        if (!(post instanceof RegularPost)) {
            throw new AccessDeniedException("Comments allowed only on regular posts");
        }

        Comment comment = new Comment(post, user, content);
        commentRepository.save(comment);
    }

    // =========================================
    // Get comments (Pagination)
    // =========================================
    public Page<CommentResponseDTO> getComments(
            Long postId,
            Pageable pageable
    ) {
        return commentRepository
                .findByPost_IdOrderByCreatedAtAsc(postId, pageable)
                .map(CommentMapper::toDTO);
    }
}
