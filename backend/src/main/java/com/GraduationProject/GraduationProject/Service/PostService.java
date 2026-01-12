package com.GraduationProject.GraduationProject.Service;

import com.GraduationProject.GraduationProject.DTO.PetDTO;
import com.GraduationProject.GraduationProject.DTO.post.AdoptionPostDTO;
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
    private final UsersRepository usersRepository;
    private final PetRepository petRepository;

    public PostService(
            PostRepository postRepository,
            UsersRepository usersRepository,
            PetRepository petRepository,
            RegularPostRepository regularPostRepository,
            AdoptionPostRepository adoptionPostRepository
    ) {
        this.postRepository = postRepository;
        this.usersRepository = usersRepository;
        this.petRepository = petRepository;
        this.regularPostRepository = regularPostRepository;
        this.adoptionPostRepository = adoptionPostRepository;
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


        return PostMapper.toRegularPostDTO(postRepository.save(post));
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
        return PostMapper.toAdoptionPostDTO(post);
    }


    /**
     * Retrieves a paginated list of regular posts for the feed.
     *
     * @param pageable Pageable object for pagination
     * @return Page of RegularPostDTO
     */
    public Page<RegularPostDTO> getRegularPosts(Pageable pageable) {
        return regularPostRepository.findRegularPost(pageable)
                .map(PostMapper::toRegularPostDTO);
    }

    /**
     * Retrieves a paginated list of adoption posts for the feed.
     *
     * @param pageable Pageable object for pagination
     * @return Page of AdoptionPostDTO
     */
    public Page<AdoptionPostDTO> getAdoptionPosts(Pageable pageable) {
        return adoptionPostRepository.findAdoptionPost(pageable)
                .map(PostMapper::toAdoptionPostDTO);
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
            adoptionPostDTOs.add(PostMapper.toAdoptionPostDTO(adoptionPost));
        }

        return adoptionPostDTOs;
    }
}
