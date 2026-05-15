package com.GraduationProject.GraduationProject.Service;

import com.GraduationProject.GraduationProject.DTO.CreateNotificationDTO;
import com.GraduationProject.GraduationProject.DTO.comment.CommentResponseDTO;
import com.GraduationProject.GraduationProject.Entity.Comment;
import com.GraduationProject.GraduationProject.Entity.Notification;
import com.GraduationProject.GraduationProject.Entity.Post;
import com.GraduationProject.GraduationProject.Entity.RegularPost;
import com.GraduationProject.GraduationProject.Entity.Users;
import com.GraduationProject.GraduationProject.Enum.NotificationType;
import com.GraduationProject.GraduationProject.Mapper.CommentMapper;
import com.GraduationProject.GraduationProject.Repository.CommentRepository;
import com.GraduationProject.GraduationProject.Repository.PostRepository;
import com.GraduationProject.GraduationProject.Repository.UsersRepository;
import com.GraduationProject.GraduationProject.Security.UserPrinciple;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

/**
 * Service class for managing comments on posts in the Pet Nexus project.
 *
 * This service handles adding comments to posts (only RegularPosts) and
 * retrieving comments with pagination support.
 *
 * All actions are performed using the currently authenticated user.
 */
@Service
@Transactional
@Slf4j
public class CommentService {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final UsersRepository usersRepository;
    private final NotificationService notificationService;

    public CommentService(
            CommentRepository commentRepository,
            PostRepository postRepository,
            UsersRepository usersRepository,
            NotificationService notificationService
    ) {
        this.commentRepository = commentRepository;
        this.postRepository = postRepository;
        this.usersRepository = usersRepository;
        this.notificationService = notificationService;
    }

    /**
     * Adds a new comment to a given post.
     *
     * Rules enforced: 1. Only authenticated users can comment. 2. Comments are
     * only allowed on RegularPost instances.
     *
     * @param postId The ID of the post to comment on.
     * @param content The content of the comment.
     * @throws EntityNotFoundException if the user or post cannot be found.
     * @throws AccessDeniedException if the post is not a RegularPost.
     */
    public CommentResponseDTO addComment(Long postId, String content) {
        String trimmedContent = content == null ? "" : content.trim();
        if (trimmedContent.isBlank()) {
            throw new IllegalArgumentException("Comment can not be empty");
        }

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserPrinciple userPrinciple = (UserPrinciple) authentication.getPrincipal();

        Users user = usersRepository.findById(userPrinciple.getId())
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new EntityNotFoundException("Post not found"));

        if (!(post instanceof RegularPost)) {
            throw new AccessDeniedException("Comments allowed only on regular posts");
        }

        Comment comment = new Comment(post, user, trimmedContent);
        Comment savedComment = commentRepository.save(comment);
        notifyPostOwner(post, user);

        return CommentMapper.toDTO(savedComment);
    }

    /**
     * Retrieves a paginated list of comments for a specific post. Comments are
     * sorted in ascending order by creation time.
     *
     * @param postId The ID of the post.
     * @param pageable Pagination parameters.
     * @return A Page of CommentResponseDTO objects.
     */
    public Page<CommentResponseDTO> getComments(Long postId, Pageable pageable) {

        return commentRepository
                .findByPost_IdOrderByCreatedAtAsc(postId, pageable)
                .map(CommentMapper::toDTO);
    }

    private void notifyPostOwner(Post post, Users commenter) {
        Users owner = post.getUser();
        if (owner == null || owner.getId().equals(commenter.getId())) {
            return;
        }

        try {
            String commenterName = getDisplayName(commenter);
            notificationService.createNotification(new CreateNotificationDTO(
                    owner.getId(),
                    NotificationType.POST_COMMENT.name(),
                    "💬 تعليق جديد من " + commenterName,
                    "أضاف " + commenterName + " تعليق على منشورك 💭",
                    post.getId(),
                    Notification.RelatedEntityType.POST.name()
            ));
        } catch (Exception e) {
            log.warn("Failed to create comment notification for user {}: {}", owner.getId(), e.getMessage());
        }
    }

    private String getDisplayName(Users user) {
        if (user.getUserInfo() != null) {
            String firstName = user.getUserInfo().getFirstName() != null ? user.getUserInfo().getFirstName() : "";
            String lastName = user.getUserInfo().getLastName() != null ? user.getUserInfo().getLastName() : "";
            String name = (firstName + " " + lastName).trim();
            if (!name.isBlank()) {
                return name;
            }
        }

        return user.getEmail() != null ? user.getEmail() : "A user";
    }
}
