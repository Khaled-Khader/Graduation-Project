package com.GraduationProject.GraduationProject.Controller;

import com.GraduationProject.GraduationProject.DTO.adoption.AdoptionRequestResponseDTO;
import com.GraduationProject.GraduationProject.DTO.adoption.CreateAdoptionRequestDTO;
import com.GraduationProject.GraduationProject.Service.AdoptionRequestService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/adoption-requests")
public class AdoptionRequestController {

    private final AdoptionRequestService adoptionRequestService;

    public AdoptionRequestController(
            AdoptionRequestService adoptionRequestService
    ) {
        this.adoptionRequestService = adoptionRequestService;
    }

    // =========================================
    // B) Send Adoption Request
    // =========================================
    @PostMapping("/{postId}")
    public void createRequest(
            @PathVariable Long postId,
            @RequestBody CreateAdoptionRequestDTO dto
    ) {

        adoptionRequestService.createRequest(postId, dto);
    }

    // =========================================
    // C) Owner views requests (Pagination)
    // =========================================
    @GetMapping("/post/{postId}")
    public Page<AdoptionRequestResponseDTO> getRequests(
            @PathVariable Long postId,
            @PageableDefault(size = 10) Pageable pageable
    ) {

        return adoptionRequestService.getRequests( postId, pageable);
    }

    // =========================================
    // C) Accept request → RESERVED
    // =========================================
    @PutMapping("/{requestId}/accept")
    public void acceptRequest(
            @PathVariable Long requestId
    ) {

        adoptionRequestService.acceptRequest( requestId);
    }

    // =========================================
    // D) Complete Adoption → COMPLETED
    // =========================================
    @PutMapping("/post/{postId}/complete")
    public void completeAdoption(
            @PathVariable Long postId
    ) {

        adoptionRequestService.completeAdoption( postId);
    }

    // =========================================
    // E) Cancel Adoption Post
    // =========================================
    @PutMapping("/post/{postId}/cancel")
    public void cancelAdoption(
            @PathVariable Long postId
    ) {
        adoptionRequestService.cancelAdoption( postId);
    }
}
