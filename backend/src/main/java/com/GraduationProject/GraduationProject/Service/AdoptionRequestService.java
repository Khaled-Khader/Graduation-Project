package com.GraduationProject.GraduationProject.Service;

import com.GraduationProject.GraduationProject.DTO.CreateNotificationDTO;
import com.GraduationProject.GraduationProject.DTO.adoption.AdoptionRequestResponseDTO;
import com.GraduationProject.GraduationProject.DTO.adoption.CreateAdoptionRequestDTO;
import com.GraduationProject.GraduationProject.Entity.Notification;
import com.GraduationProject.GraduationProject.Entity.AdoptionPost;
import com.GraduationProject.GraduationProject.Entity.AdoptionRequest;
import com.GraduationProject.GraduationProject.Entity.Users;
import com.GraduationProject.GraduationProject.Enum.AdoptionRequestStatus;
import com.GraduationProject.GraduationProject.Enum.AdoptionStatus;
import com.GraduationProject.GraduationProject.Enum.NotificationType;
import com.GraduationProject.GraduationProject.Mapper.AdoptionRequestMapper;
import com.GraduationProject.GraduationProject.Repository.AdoptionPostRepository;
import com.GraduationProject.GraduationProject.Repository.AdoptionRequestRepository;
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

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

/**
 * Service class for handling adoption requests in the Pet Nexus project.
 *
 * This class handles the main operations related to adoption posts: 1. Creating
 * adoption requests 2. Viewing requests for a specific post (with pagination)
 * 3. Accepting requests and updating post status 4. Completing adoptions 5.
 * Canceling adoption posts
 *
 * All methods use the currently authenticated user for authorization checks.
 */
@Service
@Transactional
@Slf4j
public class AdoptionRequestService {

    private final AdoptionRequestRepository requestRepository;
    private final UsersRepository usersRepository;
    private final AdoptionPostRepository adoptionPostRepository;
    private final NotificationService notificationService;

    public AdoptionRequestService(
            AdoptionRequestRepository requestRepository,
            AdoptionPostRepository adoptionPostRepository,
            UsersRepository usersRepository,
            NotificationService notificationService
    ) {
        this.requestRepository = requestRepository;
        this.adoptionPostRepository = adoptionPostRepository;
        this.usersRepository = usersRepository;
        this.notificationService = notificationService;
    }

    /**
     * Submits a new adoption request for a specific adoption post.
     *
     * Rules enforced: 1. Only authenticated users can submit requests. 2. Post
     * must be OPEN. 3. Users cannot submit requests for their own posts. 4.
     * Duplicate requests by the same user for the same post are not allowed.
     *
     * @param postId The ID of the adoption post.
     * @param dto The request details (phone, city, message).
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
        notifyAdoptionPostOwner(post, user);
    }

    /**
     * Returns a paginated list of adoption requests for a given adoption post.
     * Only the owner of the post can access the requests.
     *
     * @param postId The adoption post ID.
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
     * Accepts a pending adoption request. Only the post owner can accept
     * requests.
     *
     * Effects: 1. The accepted request status becomes ACCEPTED. 2. The adoption
     * post status becomes RESERVED. 3. All other requests for this post are
     * rejected.
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

        List<AdoptionRequest> rejectedRequests = post.getRequests()
                .stream()
                .filter(req -> !Objects.equals(req.getId(), request.getId()))
                .filter(req -> req.getStatus() == AdoptionRequestStatus.PENDING)
                .collect(Collectors.toList());

        request.setStatus(AdoptionRequestStatus.ACCEPTED);

        post.setAdoptionStatus(AdoptionStatus.RESERVED);

        String requesterName = getDisplayName(request.getRequester());
        notifyAdoptionStatus(request.getRequester(), post, "✅ تم قبول طلب التبني",
                "تم قبول طلبك لتبني " + getPetName(post) + " ✨");

        notifyUser(post.getUser(), NotificationType.ADOPTION_STATUS, "✅ تم قبول الطلب",
                requesterName + " وافق على تبني حيوانك الأليف ❤️", post.getId(), Notification.RelatedEntityType.ADOPTION_POST);

        rejectedRequests.forEach(rejectedRequest -> {
            rejectedRequest.setStatus(AdoptionRequestStatus.REJECTED);
            notifyAdoptionStatus(rejectedRequest.getRequester(), post, "❌ تم رفض طلب التبني",
                    "للأسف تم رفض طلبك لتبني " + getPetName(post));
        });
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
                .ifPresent(req -> {
                    post.getPet().setUser(req.getRequester());
                    notifyAdoptionStatus(req.getRequester(), post, "✅ اكتمل التبني بنجاح",
                            "تم نقل ملكية حيوانك الأليف " + getPetName(post) + " إليك رسمياً! 🎉");
                });

        adoptionPostRepository.delete(post);
    }

    /**
     * Cancels an adoption post and rejects all pending requests. Only the post
     * owner can cancel. Cannot cancel a completed adoption.
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

        post.getRequests().forEach(req -> {
            req.setStatus(AdoptionRequestStatus.REJECTED);
            notifyAdoptionStatus(req.getRequester(), post, "Adoption post cancelled",
                    "The adoption post for " + getPetName(post) + " was cancelled.");
        });

        adoptionPostRepository.delete(post);
    }

    private void notifyAdoptionPostOwner(AdoptionPost post, Users requester) {
        try {
            String requesterName = getDisplayName(requester);
            String petName = getPetName(post);
            notifyUser(
                    post.getUser(),
                    NotificationType.ADOPTION_REQUEST,
                    "🐾 طلب تبني جديد من " + requesterName,
                    "يريد " + requesterName + " تبني حيوانك " + petName + " 🐕",
                    post.getId(),
                    Notification.RelatedEntityType.ADOPTION_POST
            );
        } catch (Exception e) {
            log.warn("Failed to create adoption notification for user {}: {}", post.getUser().getId(), e.getMessage());
        }
    }

    private void notifyAdoptionStatus(Users user, AdoptionPost post, String title, String message) {
        notifyUser(
                user,
                NotificationType.ADOPTION_STATUS,
                title,
                message,
                post.getId(),
                Notification.RelatedEntityType.ADOPTION_POST
        );
    }

    private void notifyUser(
            Users user,
            NotificationType type,
            String title,
            String message,
            Long relatedId,
            Notification.RelatedEntityType relatedEntityType
    ) {
        try {
            notificationService.createNotification(new CreateNotificationDTO(
                    user.getId(),
                    type.name(),
                    title,
                    message,
                    relatedId,
                    relatedEntityType.name()
            ));
        } catch (Exception e) {
            log.warn("Failed to create adoption notification for user {}: {}", user.getId(), e.getMessage());
        }
    }

    private String getPetName(AdoptionPost post) {
        if (post.getPet() != null && post.getPet().getName() != null && !post.getPet().getName().isBlank()) {
            return post.getPet().getName();
        }
        return "this pet";
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
