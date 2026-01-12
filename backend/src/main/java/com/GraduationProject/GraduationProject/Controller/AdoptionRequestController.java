package com.GraduationProject.GraduationProject.Controller;

import com.GraduationProject.GraduationProject.DTO.adoption.AdoptionRequestResponseDTO;
import com.GraduationProject.GraduationProject.DTO.adoption.CreateAdoptionRequestDTO;
import com.GraduationProject.GraduationProject.Service.AdoptionRequestService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;

/**
 * Controller for handling Adoption Requests.
 *
 * Responsibilities:
 *  - Sending a new adoption request
 *  - Viewing all requests for a given adoption post (with pagination)
 *  - Accepting a request (which reserves the pet)
 *  - Completing the adoption (finalizing the adoption)
 *  - Canceling an adoption post (and rejecting pending requests)
 *
 * Maps HTTP requests to the corresponding service layer methods.
 */
@RestController
@RequestMapping("/adoption-requests")
public class AdoptionRequestController {

    private final AdoptionRequestService adoptionRequestService;

    public AdoptionRequestController(AdoptionRequestService adoptionRequestService) {
        this.adoptionRequestService = adoptionRequestService;
    }


    /**
     * Creates a new adoption request for a specific adoption post.
     *
     * @param postId ID of the adoption post
     * @param dto    DTO containing request details (phone number, city, message)
     */
    @PostMapping("/{postId}")
    public void createRequest(
            @PathVariable Long postId,
            @RequestBody CreateAdoptionRequestDTO dto
    ) {
        adoptionRequestService.createRequest(postId, dto);
    }


    /**
     * Retrieves all adoption requests for a given post, paginated.
     *
     * Only the owner of the adoption post can access this.
     *
     * @param postId   ID of the adoption post
     * @param pageable Pageable object (page size, page number, sorting)
     * @return Page of AdoptionRequestResponseDTO containing request info
     */
    @GetMapping("/post/{postId}")
    public Page<AdoptionRequestResponseDTO> getRequests(
            @PathVariable Long postId,
            @PageableDefault(size = 10) Pageable pageable
    ) {
        return adoptionRequestService.getRequests(postId, pageable);
    }


    /**
     * Accepts an adoption request and marks the pet as RESERVED.
     *
     * Only the owner of the adoption post can accept requests.
     *
     * @param requestId ID of the adoption request to accept
     */
    @PutMapping("/{requestId}/accept")
    public void acceptRequest(
            @PathVariable Long requestId
    ) {
        adoptionRequestService.acceptRequest(requestId);
    }

    /**
     * Completes an adoption process, finalizing the transfer of the pet.
     *
     * Only the owner of the adoption post can complete it.
     *
     * @param postId ID of the adoption post to complete
     */
    @PutMapping("/post/{postId}/complete")
    public void completeAdoption(
            @PathVariable Long postId
    ) {
        adoptionRequestService.completeAdoption(postId);
    }


    /**
     * Cancels an adoption post and rejects all pending requests.
     *
     * Only the owner of the adoption post can cancel it.
     *
     * @param postId ID of the adoption post to cancel
     */
    @PutMapping("/post/{postId}/cancel")
    public void cancelAdoption(
            @PathVariable Long postId
    ) {
        adoptionRequestService.cancelAdoption(postId);
    }
}
