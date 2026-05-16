package com.GraduationProject.GraduationProject.Service;

import com.GraduationProject.GraduationProject.DTO.AdminUserDTO;
import com.GraduationProject.GraduationProject.DTO.post.AdoptionPostDTO;
import com.GraduationProject.GraduationProject.DTO.post.AllPosts;
import com.GraduationProject.GraduationProject.DTO.post.RegularPostDTO;
import com.GraduationProject.GraduationProject.Entity.AdoptionPost;
import com.GraduationProject.GraduationProject.Entity.Post;
import com.GraduationProject.GraduationProject.Entity.RegularPost;
import com.GraduationProject.GraduationProject.Entity.UserInfo;
import com.GraduationProject.GraduationProject.Entity.Users;
import com.GraduationProject.GraduationProject.Enum.EnumRole;
import com.GraduationProject.GraduationProject.Enum.UserAccountStatus;
import com.GraduationProject.GraduationProject.Enum.VerificationStatus;
import com.GraduationProject.GraduationProject.Mapper.PostMapper;
import com.GraduationProject.GraduationProject.Repository.AdoptionRequestRepository;
import com.GraduationProject.GraduationProject.Repository.CommentRepository;
import com.GraduationProject.GraduationProject.Repository.PostRepository;
import com.GraduationProject.GraduationProject.Repository.UsersRepository;
import com.GraduationProject.GraduationProject.Security.UserPrinciple;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional
public class AdminService {

    private final UsersRepository usersRepository;
    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final AdoptionRequestRepository adoptionRequestRepository;
    private final ProviderVerificationService providerVerificationService;

    public AdminService(
            UsersRepository usersRepository,
            PostRepository postRepository,
            CommentRepository commentRepository,
            AdoptionRequestRepository adoptionRequestRepository,
            ProviderVerificationService providerVerificationService
    ) {
        this.usersRepository = usersRepository;
        this.postRepository = postRepository;
        this.commentRepository = commentRepository;
        this.adoptionRequestRepository = adoptionRequestRepository;
        this.providerVerificationService = providerVerificationService;
    }

    public Page<AdminUserDTO> listUsers(
            String query,
            EnumRole role,
            UserAccountStatus accountStatus,
            Pageable pageable
    ) {
        return usersRepository.searchUsers(normalizeQuery(query), role, accountStatus, pageable)
                .map(this::toAdminUserDTO);
    }

    public AdminUserDTO suspendUser(Long userId, UserPrinciple adminUser) {
        return updateUserStatus(userId, UserAccountStatus.SUSPENDED, adminUser);
    }

    public AdminUserDTO banUser(Long userId, UserPrinciple adminUser) {
        return updateUserStatus(userId, UserAccountStatus.BANNED, adminUser);
    }

    public AdminUserDTO activateUser(Long userId, UserPrinciple adminUser) {
        return updateUserStatus(userId, UserAccountStatus.ACTIVE, adminUser);
    }

    public Page<AllPosts> listPosts(Pageable pageable, String sortBy) {
        Page<Post> posts = switch (normalizeSort(sortBy)) {
            case "oldest" -> postRepository.findAllPostsOldest(pageable);
            case "comments" -> postRepository.findAllPostsMostCommented(pageable);
            default -> postRepository.findAllPosts(pageable);
        };

        return posts.map(this::toPostDTO);
    }

    public void deletePost(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));

        commentRepository.deleteByPost_Id(postId);

        if (post instanceof AdoptionPost) {
            adoptionRequestRepository.deleteByAdoptionPost_Id(postId);
        }

        postRepository.delete(post);
    }

    private AdminUserDTO updateUserStatus(
            Long userId,
            UserAccountStatus accountStatus,
            UserPrinciple adminUser
    ) {
        Users targetUser = usersRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        ensureCanModerateUser(targetUser, adminUser);
        targetUser.setAccountStatus(accountStatus);

        return toAdminUserDTO(usersRepository.save(targetUser));
    }

    private void ensureCanModerateUser(Users targetUser, UserPrinciple adminUser) {
        if (adminUser == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication is required");
        }

        if (targetUser.getId().equals(adminUser.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Admins can not change their own account status");
        }

        if (targetUser.getRole() == EnumRole.ADMIN) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Admin accounts can not be suspended or banned here");
        }
    }

    private AllPosts toPostDTO(Post post) {
        if (post instanceof RegularPost regularPost) {
            RegularPostDTO dto = PostMapper.toRegularPostDTO(regularPost, null);
            dto.setOwnedByCurrentUser(false);
            return dto;
        }

        if (post instanceof AdoptionPost adoptionPost) {
            AdoptionPostDTO dto = PostMapper.toAdoptionPostDTO(adoptionPost, false, null);
            dto.setOwnedByCurrentUser(false);
            return dto;
        }

        throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Unsupported post type");
    }

    private AdminUserDTO toAdminUserDTO(Users user) {
        UserInfo info = user.getUserInfo();
        VerificationStatus verificationStatus = providerVerificationService.getProviderStatus(user);
        UserAccountStatus accountStatus = user.getAccountStatus() != null
                ? user.getAccountStatus()
                : UserAccountStatus.ACTIVE;

        return new AdminUserDTO(
                user.getId(),
                user.getEmail(),
                user.getRole() != null ? user.getRole().name() : null,
                accountStatus.name(),
                info != null ? info.getFirstName() : null,
                info != null ? info.getLastName() : null,
                info != null ? info.getPhotoUrl() : null,
                verificationStatus.name(),
                verificationStatus == VerificationStatus.VERIFIED
        );
    }

    private String normalizeQuery(String query) {
        return query == null ? "" : query.trim().toLowerCase();
    }

    private String normalizeSort(String sortBy) {
        if (sortBy == null || sortBy.isBlank()) {
            return "latest";
        }

        return switch (sortBy.trim().toLowerCase()) {
            case "oldest", "old" -> "oldest";
            case "comments", "commented", "most-comments", "most_comments", "mostcommented" -> "comments";
            default -> "latest";
        };
    }
}
