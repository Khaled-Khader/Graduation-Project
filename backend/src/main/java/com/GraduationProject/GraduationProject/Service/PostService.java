package com.GraduationProject.GraduationProject.Service;

import com.GraduationProject.GraduationProject.DTO.PetDTO;
import com.GraduationProject.GraduationProject.DTO.post.AdoptionPostDTO;
import com.GraduationProject.GraduationProject.DTO.post.AllPosts;
import com.GraduationProject.GraduationProject.DTO.post.CreatePostDTO;
import com.GraduationProject.GraduationProject.DTO.post.RegularPostDTO;
import com.GraduationProject.GraduationProject.Entity.*;
import com.GraduationProject.GraduationProject.Factory.PostFactory;
import com.GraduationProject.GraduationProject.Mapper.PostMapper;
import com.GraduationProject.GraduationProject.Repository.*;
import com.GraduationProject.GraduationProject.Security.UserPrinciple;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * Service responsible for creating and fetching posts (both regular and adoption)
 * in the Pet Nexus application.
 *
 * Responsibilities include:
 * 1. Creating Regular Posts
 * 2. Creating Adoption Posts (with ownership and duplication checks)
 * 3. Retrieving feeds with pagination
 * 4. Retrieving adoption posts specific to the logged-in user
 */
@Service
@Transactional
public class PostService {

    private final PostRepository postRepository;
    private final RegularPostRepository regularPostRepository;
    private final AdoptionPostRepository adoptionPostRepository;
    private final AdoptionRequestRepository adoptionRequestRepository;
    private final UsersRepository usersRepository;
    private final PetRepository petRepository;
    private final CommentRepository commentRepository;

    public PostService(
            PostRepository postRepository,
            UsersRepository usersRepository,
            PetRepository petRepository,
            RegularPostRepository regularPostRepository,
            AdoptionPostRepository adoptionPostRepository,
            AdoptionRequestRepository adoptionRequestRepository,
            CommentRepository commentRepository
    ) {
        this.postRepository = postRepository;
        this.usersRepository = usersRepository;
        this.petRepository = petRepository;
        this.regularPostRepository = regularPostRepository;
        this.adoptionPostRepository = adoptionPostRepository;
        this.adoptionRequestRepository = adoptionRequestRepository;
        this.commentRepository = commentRepository;
    }


    /**
     * Creates a regular post for the currently authenticated user.
     *
     * @param dto Data transfer object containing post details (content, image, etc.)
     * @return RegularPostDTO containing saved post information
     * @throws EntityNotFoundException if the authenticated user is not found in the database
     */
    public RegularPostDTO createRegularPost(CreatePostDTO dto) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserPrinciple userPrinciple = (UserPrinciple) authentication.getPrincipal();

        Users user = usersRepository.findById(userPrinciple.getId())
                .orElseThrow(() -> new EntityNotFoundException(
                        "User with id " + userPrinciple.getId() + " not found"
                ));


        RegularPost post = PostFactory.createRegularPost(dto, user);


        return PostMapper.toRegularPostDTO(postRepository.save(post), user.getId());
    }


    /**
     * Creates an adoption post for a pet owned by the authenticated user.
     *
     * Validations:
     * 1. Pet must exist.
     * 2. Pet must be owned by the authenticated user.
     * 3. No duplicate adoption post allowed for the same pet.
     *
     * @param dto Data transfer object containing adoption post details
     * @return AdoptionPostDTO containing saved adoption post information
     * @throws EntityNotFoundException if the user or pet does not exist
     * @throws RuntimeException if an adoption post already exists for the pet
     * @throws AccessDeniedException if the authenticated user does not own the pet
     */
    public AdoptionPostDTO createAdoptionPost(CreatePostDTO dto) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserPrinciple userPrinciple = (UserPrinciple) authentication.getPrincipal();

        Users user = usersRepository.findById(userPrinciple.getId())
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        Pet pet = petRepository.findById(dto.getPetId())
                .orElseThrow(() -> new EntityNotFoundException("Pet not found"));


        if (postRepository.findAdoptionPostByPetId(pet.getId()) != null) {
            throw new RuntimeException("Adoption post already exists for this pet");
        }


        if (!pet.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("You do not own this pet");
        }

        AdoptionPost post = PostFactory.createAdoptionPost(dto, user, pet);

        postRepository.save(post);
        return PostMapper.toAdoptionPostDTO(post, false, user.getId());
    }


    /**
     * Retrieves a paginated list of regular posts for the feed.
     *
     * @param pageable Pageable object for pagination
     * @return Page of RegularPostDTO
     */
    public Page<RegularPostDTO> getRegularPosts(Pageable pageable) {
        return getRegularPosts(pageable, "latest");
    }

    public Page<RegularPostDTO> getRegularPosts(Pageable pageable, String sortBy) {
        Long currentUserId = getCurrentUserId();
        Page<RegularPost> posts = switch (normalizeSort(sortBy)) {
            case "oldest" -> regularPostRepository.findRegularPostOldest(pageable);
            case "comments" -> regularPostRepository.findRegularPostMostCommented(pageable);
            default -> regularPostRepository.findRegularPost(pageable);
        };

        return posts.map(post -> PostMapper.toRegularPostDTO(post, currentUserId));
    }

    /**
     * Retrieves a paginated list of adoption posts for the feed.
     *
     * @param pageable Pageable object for pagination
     * @return Page of AdoptionPostDTO
     */
    public Page<AdoptionPostDTO> getAdoptionPosts(Pageable pageable) {
        return getAdoptionPosts(pageable, "latest");
    }

    public Page<AdoptionPostDTO> getAdoptionPosts(Pageable pageable, String sortBy) {
        Long currentUserId = getCurrentUserId();
        Page<AdoptionPost> posts = "oldest".equals(normalizeSort(sortBy))
                ? adoptionPostRepository.findAdoptionPostOldest(pageable)
                : adoptionPostRepository.findAdoptionPost(pageable);

        return posts.map(post -> toAdoptionPostDTO(post, currentUserId));
    }

    public Page<AllPosts> getAllPosts(Pageable pageable, String sortBy) {
        Long currentUserId = getCurrentUserId();
        Page<Post> posts = switch (normalizeSort(sortBy)) {
            case "oldest" -> postRepository.findAllPostsOldest(pageable);
            case "comments" -> postRepository.findAllPostsMostCommented(pageable);
            default -> postRepository.findAllPosts(pageable);
        };

        return posts.map(post -> toPostDTO(post, currentUserId));
    }

    public AllPosts updatePost(Long postId, CreatePostDTO dto) {
        Long currentUserId = getCurrentUserId();
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new EntityNotFoundException("Post not found"));

        ensureOwner(post, currentUserId);
        updateEditableFields(post, dto);

        return toPostDTO(postRepository.save(post), currentUserId);
    }

    public void deletePost(Long postId) {
        Long currentUserId = getCurrentUserId();
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new EntityNotFoundException("Post not found"));

        ensureOwner(post, currentUserId);

        if (post instanceof RegularPost) {
            commentRepository.deleteByPost_Id(postId);
        }

        if (post instanceof AdoptionPost) {
            adoptionRequestRepository.deleteByAdoptionPost_Id(postId);
        }

        postRepository.delete(post);
    }

    /**
     * Retrieves all adoption posts created by the currently authenticated user.
     *
     * @return List of AdoptionPostDTO for the current user
     * @throws EntityNotFoundException if authenticated user does not exist
     */
    public List<AdoptionPostDTO> getAdoptionPostsByUserId() {
        List<AdoptionPostDTO> adoptionPostDTOs = new ArrayList<>();

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserPrinciple userPrinciple = (UserPrinciple) authentication.getPrincipal();

        Users user = usersRepository.findById(userPrinciple.getId())
                .orElseThrow(() -> new EntityNotFoundException(
                        "User with id " + userPrinciple.getId() + " not found"
                ));


        for (AdoptionPost adoptionPost : adoptionPostRepository.findPostsByUserId(user.getId())) {
            adoptionPostDTOs.add(toAdoptionPostDTO(adoptionPost, user.getId()));
        }

        return adoptionPostDTOs;
    }

    private AdoptionPostDTO toAdoptionPostDTO(AdoptionPost post, Long currentUserId) {
        boolean requestedByCurrentUser = currentUserId != null
                && !post.getUser().getId().equals(currentUserId)
                && adoptionRequestRepository.existsByAdoptionPost_IdAndRequester_Id(
                post.getId(),
                currentUserId
        );

        return PostMapper.toAdoptionPostDTO(post, requestedByCurrentUser, currentUserId);
    }

    private AllPosts toPostDTO(Post post, Long currentUserId) {
        if (post instanceof RegularPost regularPost) {
            return PostMapper.toRegularPostDTO(regularPost, currentUserId);
        }

        if (post instanceof AdoptionPost adoptionPost) {
            return toAdoptionPostDTO(adoptionPost, currentUserId);
        }

        throw new IllegalStateException("Unsupported post type");
    }

    private void updateEditableFields(Post post, CreatePostDTO dto) {
        if (dto.getContent() != null) {
            String content = dto.getContent().trim();
            if (content.isBlank()) {
                throw new IllegalArgumentException("Post content can not be empty");
            }
            post.setContent(content);
        }

        if (dto.getImageUrl() != null) {
            post.setImageUrl(dto.getImageUrl().trim().isBlank() ? null : dto.getImageUrl().trim());
        }

        if (post instanceof AdoptionPost adoptionPost && dto.getCity() != null) {
            String city = dto.getCity().trim();
            if (city.isBlank()) {
                throw new IllegalArgumentException("Adoption city can not be empty");
            }
            adoptionPost.setCity(city);
        }
    }

    private void ensureOwner(Post post, Long currentUserId) {
        if (currentUserId == null || !post.getUser().getId().equals(currentUserId)) {
            throw new AccessDeniedException("You are not allowed to change this post");
        }
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

    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null
                || !(authentication.getPrincipal() instanceof UserPrinciple userPrinciple)) {
            return null;
        }

        return userPrinciple.getId();
    }
}
