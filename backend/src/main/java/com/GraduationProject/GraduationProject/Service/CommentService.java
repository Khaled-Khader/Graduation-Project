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

/**
 * Service class for managing comments on posts in the Pet Nexus project.
 *
 * This service handles adding comments to posts (only RegularPosts)
 * and retrieving comments with pagination support.
 *
 * All actions are performed using the currently authenticated user.
 */
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


    /**
     * Adds a new comment to a given post.
     *
     * Rules enforced:
     * 1. Only authenticated users can comment.
     * 2. Comments are only allowed on RegularPost instances.
     *
     * @param postId  The ID of the post to comment on.
     * @param content The content of the comment.
     * @throws EntityNotFoundException if the user or post cannot be found.
     * @throws AccessDeniedException   if the post is not a RegularPost.
     */
    public void addComment(Long postId, String content) {


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


    /**
     * Retrieves a paginated list of comments for a specific post.
     * Comments are sorted in ascending order by creation time.
     *
     * @param postId   The ID of the post.
     * @param pageable Pagination parameters.
     * @return A Page of CommentResponseDTO objects.
     */
    public Page<CommentResponseDTO> getComments(Long postId, Pageable pageable) {

        return commentRepository
                .findByPost_IdOrderByCreatedAtAsc(postId, pageable)
                .map(CommentMapper::toDTO);
    }
}
