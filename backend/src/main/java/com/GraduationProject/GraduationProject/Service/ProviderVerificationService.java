package com.GraduationProject.GraduationProject.Service;

import com.GraduationProject.GraduationProject.Entity.Users;
import com.GraduationProject.GraduationProject.Entity.VerificationRequest;
import com.GraduationProject.GraduationProject.Enum.EnumRole;
import com.GraduationProject.GraduationProject.Enum.VerificationStatus;
import com.GraduationProject.GraduationProject.Repository.VerificationRequestRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Comparator;
import java.util.List;

@Service
public class ProviderVerificationService {

    private final VerificationRequestRepository verificationRequestRepository;

    public ProviderVerificationService(VerificationRequestRepository verificationRequestRepository) {
        this.verificationRequestRepository = verificationRequestRepository;
    }

    public VerificationStatus getProviderStatus(Users provider) {
        if (!isProvider(provider)) {
            return VerificationStatus.UNVERIFIED;
        }

        List<VerificationRequest> requests = verificationRequestRepository.findByProviderOrderByCreatedAtDesc(provider);
        return resolveProviderStatus(requests);
    }

    public boolean isVerifiedProvider(Users provider) {
        return getProviderStatus(provider) == VerificationStatus.VERIFIED;
    }

    public void requireVerifiedProvider(Users provider, String featureName) {
        if (!isProvider(provider)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only veterinarians and clinics can use this feature");
        }

        if (!isVerifiedProvider(provider)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Provider verification is required to " + featureName
            );
        }
    }

    public boolean isProvider(Users user) {
        return user != null && (user.getRole() == EnumRole.VET || user.getRole() == EnumRole.CLINIC);
    }

    public VerificationStatus resolveProviderStatus(List<VerificationRequest> requests) {
        if (requests == null || requests.isEmpty()) {
            return VerificationStatus.UNVERIFIED;
        }

        if (requests.stream().anyMatch(request -> request.getStatus() == VerificationStatus.VERIFIED)) {
            return VerificationStatus.VERIFIED;
        }

        return requests.stream()
                .max(Comparator.comparing(VerificationRequest::getCreatedAt, Comparator.nullsLast(Comparator.naturalOrder())))
                .map(VerificationRequest::getStatus)
                .orElse(VerificationStatus.UNVERIFIED);
    }
}
