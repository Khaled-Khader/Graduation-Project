package com.GraduationProject.GraduationProject.Service;

import com.GraduationProject.GraduationProject.DTO.adoption.AdoptionRequestResponseDTO;
import com.GraduationProject.GraduationProject.DTO.adoption.CreateAdoptionRequestDTO;
import com.GraduationProject.GraduationProject.Entity.AdoptionPost;
import com.GraduationProject.GraduationProject.Entity.AdoptionRequest;
import com.GraduationProject.GraduationProject.Entity.Users;
import com.GraduationProject.GraduationProject.Enum.AdoptionRequestStatus;
import com.GraduationProject.GraduationProject.Enum.AdoptionStatus;
import com.GraduationProject.GraduationProject.Mapper.AdoptionRequestMapper;
import com.GraduationProject.GraduationProject.Repository.AdoptionPostRepository;
import com.GraduationProject.GraduationProject.Repository.AdoptionRequestRepository;
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
 * Service class for handling adoption requests in the Pet Nexus project.
 *
 * This class handles the main operations related to adoption posts:
 * 1. Creating adoption requests
 * 2. Viewing requests for a specific post (with pagination)
 * 3. Accepting requests and updating post status
 * 4. Completing adoptions
 * 5. Canceling adoption posts
 *
 * All methods use the currently authenticated user for authorization checks.
 */
@Service
@Transactional
public class AdoptionRequestService {

    private final AdoptionRequestRepository requestRepository;
    private final UsersRepository usersRepository;
    private final AdoptionPostRepository adoptionPostRepository;

    public AdoptionRequestService(
            AdoptionRequestRepository requestRepository,
            AdoptionPostRepository adoptionPostRepository,
            UsersRepository usersRepository
    ) {
        this.requestRepository = requestRepository;
        this.adoptionPostRepository = adoptionPostRepository;
        this.usersRepository = usersRepository;
    }


    /**
     * Submits a new adoption request for a specific adoption post.
     *
     * Rules enforced:
     * 1. Only authenticated users can submit requests.
     * 2. Post must be OPEN.
     * 3. Users cannot submit requests for their own posts.
     * 4. Duplicate requests by the same user for the same post are not allowed.
     *
     * @param postId The ID of the adoption post.
     * @param dto    The request details (phone, city, message).
     */
    public void createRequest(Long postId, CreateAdoptionRequestDTO dto) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserPrinciple userPrinciple = (UserPrinciple) authentication.getPrincipal();

        Users user = usersRepository.findById(userPrinciple.getId())
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        AdoptionPost post = adoptionPostRepository.findById(postId)
                .orElseThrow(() -> new EntityNotFoundException("Adoption post not found"));

        if (post.getAdoptionStatus() != AdoptionStatus.OPEN) {
            throw new IllegalStateException("Adoption post is not open");
        }

        if (post.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("Cannot request your own adoption post");
        }

        if (requestRepository.existsByAdoptionPost_IdAndRequester_Id(postId, user.getId())) {
            throw new IllegalStateException("You already submitted a request");
        }


        AdoptionRequest request = new AdoptionRequest();
        request.setAdoptionPost(post);
        request.setRequester(user);
        request.setPhoneNumber(dto.getPhoneNumber());
        request.setCity(dto.getCity());
        request.setMessage(dto.getMessage());
        request.setStatus(AdoptionRequestStatus.PENDING);

        requestRepository.save(request);
    }


    /**
     * Returns a paginated list of adoption requests for a given adoption post.
     * Only the owner of the post can access the requests.
     *
     * @param postId   The adoption post ID.
     * @param pageable Pagination settings.
     * @return Page of AdoptionRequestResponseDTO objects.
     */
    public Page<AdoptionRequestResponseDTO> getRequests(Long postId, Pageable pageable) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserPrinciple userPrinciple = (UserPrinciple) authentication.getPrincipal();

        AdoptionPost post = adoptionPostRepository.findById(postId)
                .orElseThrow(() -> new EntityNotFoundException("Adoption post not found"));

        if (!post.getUser().getId().equals(userPrinciple.getId())) {
            throw new AccessDeniedException("Not allowed to view requests");
        }

        return requestRepository
                .findByAdoptionPost_Id(postId, pageable)
                .map(AdoptionRequestMapper::toDTO);
    }


    /**
     * Accepts a pending adoption request. Only the post owner can accept requests.
     *
     * Effects:
     * 1. The accepted request status becomes ACCEPTED.
     * 2. The adoption post status becomes RESERVED.
     * 3. All other requests for this post are rejected.
     *
     * @param requestId The ID of the adoption request to accept.
     */
    public void acceptRequest(Long requestId) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserPrinciple userPrinciple = (UserPrinciple) authentication.getPrincipal();

        AdoptionRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new EntityNotFoundException("Request not found"));

        AdoptionPost post = request.getAdoptionPost();

        if (!post.getUser().getId().equals(userPrinciple.getId())) {
            throw new AccessDeniedException("Not allowed");
        }

        if (post.getAdoptionStatus() != AdoptionStatus.OPEN) {
            throw new IllegalStateException("Adoption post is not open");
        }

        if (request.getStatus() != AdoptionRequestStatus.PENDING) {
            throw new IllegalStateException("Invalid request state");
        }


        request.setStatus(AdoptionRequestStatus.ACCEPTED);


        post.setAdoptionStatus(AdoptionStatus.RESERVED);


        requestRepository.rejectAllExcept(post.getId(), request.getId());
    }


    /**
     * Marks an adoption post as completed and transfers ownership of the pet.
     * Only the post owner can complete the adoption.
     *
     * @param postId The adoption post ID.
     */
    public void completeAdoption(Long postId) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserPrinciple userPrinciple = (UserPrinciple) authentication.getPrincipal();

        AdoptionPost post = adoptionPostRepository.findById(postId)
                .orElseThrow(() -> new EntityNotFoundException("Adoption post not found"));

        if (!post.getUser().getId().equals(userPrinciple.getId())) {
            throw new AccessDeniedException("Not allowed");
        }

        if (post.getAdoptionStatus() != AdoptionStatus.RESERVED) {
            throw new IllegalStateException("Adoption is not reserved");
        }

        post.setAdoptionStatus(AdoptionStatus.COMPLETED);


        requestRepository
                .findByAdoptionPost_IdAndStatus(postId, AdoptionRequestStatus.ACCEPTED)
                .ifPresent(req -> post.getPet().setUser(req.getRequester()));


        adoptionPostRepository.delete(post);
    }


    /**
     * Cancels an adoption post and rejects all pending requests.
     * Only the post owner can cancel.
     * Cannot cancel a completed adoption.
     *
     * @param postId The ID of the adoption post to cancel.
     */
    public void cancelAdoption(Long postId) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserPrinciple userPrinciple = (UserPrinciple) authentication.getPrincipal();

        AdoptionPost post = adoptionPostRepository.findById(postId)
                .orElseThrow(() -> new EntityNotFoundException("Adoption post not found"));

        if (!post.getUser().getId().equals(userPrinciple.getId())) {
            throw new AccessDeniedException("Not allowed");
        }

        if (post.getAdoptionStatus() == AdoptionStatus.COMPLETED) {
            throw new IllegalStateException("Adoption has already been completed");
        }


        post.getRequests().forEach(req -> req.setStatus(AdoptionRequestStatus.REJECTED));


        adoptionPostRepository.delete(post);
    }
}
