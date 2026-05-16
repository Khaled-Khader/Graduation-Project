package com.GraduationProject.GraduationProject.Controller;

import com.GraduationProject.GraduationProject.DTO.ReviewVerificationRequestDTO;
import com.GraduationProject.GraduationProject.DTO.VerificationRequestResponseDTO;
import com.GraduationProject.GraduationProject.Enum.VerificationStatus;
import com.GraduationProject.GraduationProject.Security.UserPrinciple;
import com.GraduationProject.GraduationProject.Service.VerificationRequestService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping({"/api/admin/verifications", "/api/admin/verification-requests"})
public class AdminVerificationController {

    private final VerificationRequestService verificationRequestService;

    public AdminVerificationController(VerificationRequestService verificationRequestService) {
        this.verificationRequestService = verificationRequestService;
    }

    @GetMapping
    public List<VerificationRequestResponseDTO> listRequests(
            @RequestParam(value = "status", required = false) VerificationStatus status
    ) {
        return verificationRequestService.listRequests(status);
    }

    @GetMapping("/pending")
    public List<VerificationRequestResponseDTO> listPendingRequests() {
        return verificationRequestService.listRequests(VerificationStatus.PENDING);
    }

    @PutMapping("/{requestId}/under-review")
    public VerificationRequestResponseDTO markUnderReview(
            @PathVariable Long requestId,
            @AuthenticationPrincipal UserPrinciple currentUser
    ) {
        return verificationRequestService.markUnderReview(requestId, currentUser);
    }

    @PutMapping("/{requestId}/verify")
    public VerificationRequestResponseDTO verify(
            @PathVariable Long requestId,
            @AuthenticationPrincipal UserPrinciple currentUser
    ) {
        return verificationRequestService.verify(requestId, currentUser);
    }

    @PutMapping("/{requestId}/approve")
    public VerificationRequestResponseDTO approve(
            @PathVariable Long requestId,
            @AuthenticationPrincipal UserPrinciple currentUser
    ) {
        return verificationRequestService.verify(requestId, currentUser);
    }

    @PutMapping("/{requestId}/reject")
    public VerificationRequestResponseDTO reject(
            @PathVariable Long requestId,
            @RequestBody ReviewVerificationRequestDTO reviewDTO,
            @AuthenticationPrincipal UserPrinciple currentUser
    ) {
        return verificationRequestService.reject(requestId, reviewDTO.rejectionReason(), currentUser);
    }
}
