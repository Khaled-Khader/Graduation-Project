package com.GraduationProject.GraduationProject.Repository;

import com.GraduationProject.GraduationProject.Entity.Users;
import com.GraduationProject.GraduationProject.Entity.VerificationRequest;
import com.GraduationProject.GraduationProject.Enum.VerificationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VerificationRequestRepository extends JpaRepository<VerificationRequest, Long> {
    List<VerificationRequest> findByProviderOrderByCreatedAtDesc(Users provider);

    List<VerificationRequest> findByStatusOrderByCreatedAtAsc(VerificationStatus status);

    List<VerificationRequest> findAllByOrderByCreatedAtDesc();
}
