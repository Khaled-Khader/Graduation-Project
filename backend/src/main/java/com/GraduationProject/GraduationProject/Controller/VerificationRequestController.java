package com.GraduationProject.GraduationProject.Controller;

import com.GraduationProject.GraduationProject.DTO.VerificationRequestResponseDTO;
import com.GraduationProject.GraduationProject.DTO.VerificationStatusResponseDTO;
import com.GraduationProject.GraduationProject.Security.UserPrinciple;
import com.GraduationProject.GraduationProject.Service.VerificationRequestService;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/verification-requests")
public class VerificationRequestController {

    private final VerificationRequestService verificationRequestService;

    public VerificationRequestController(VerificationRequestService verificationRequestService) {
        this.verificationRequestService = verificationRequestService;
    }

    @GetMapping("/me")
    public VerificationStatusResponseDTO currentProviderStatus(
            @AuthenticationPrincipal UserPrinciple currentUser
    ) {
        return verificationRequestService.getCurrentProviderStatus(currentUser);
    }

    @PostMapping(value = "/documents", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public List<VerificationRequestResponseDTO> uploadDocuments(
            @AuthenticationPrincipal UserPrinciple currentUser,
            @RequestParam("files") List<MultipartFile> files,
            @RequestParam(value = "documentType", required = false) String documentType
    ) {
        return verificationRequestService.submitDocuments(currentUser, files, documentType);
    }

    @PostMapping("/skip")
    public VerificationStatusResponseDTO skipVerification(
            @AuthenticationPrincipal UserPrinciple currentUser
    ) {
        return verificationRequestService.getCurrentProviderStatus(currentUser);
    }
}
