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

    // =========================================================
    // B) إرسال طلب تبنّي
    // =========================================================
    public void createRequest(
            Long postId,
            CreateAdoptionRequestDTO dto
    ) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserPrinciple userPrinciple = (UserPrinciple) authentication.getPrincipal();

        Users user = usersRepository.findById(userPrinciple.getId())
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        AdoptionPost post = adoptionPostRepository.findById(postId)
                .orElseThrow(() -> new EntityNotFoundException("Adoption post not found"));

        // البوست لازم يكون OPEN
        if (post.getAdoptionStatus() != AdoptionStatus.OPEN) {
            throw new IllegalStateException("Adoption post is not open");
        }

        // ممنوع صاحب البوست يقدّم طلب
        if (post.getUser().getId().equals(user.getId())) {

            throw new AccessDeniedException("Cannot request your own adoption post");
        }

        // ممنوع يقدّم طلب مرتين
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

    // =========================================================
    // C) صاحب البوست يشوف الطلبات (Pagination)
    // =========================================================
    public Page<AdoptionRequestResponseDTO> getRequests(
            Long postId,
            Pageable pageable
    ) {

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

    // =========================================================
    // C) Accept request → RESERVED
    // =========================================================
    public void acceptRequest(
            Long requestId
    ) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserPrinciple userPrinciple = (UserPrinciple) authentication.getPrincipal();

        AdoptionRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new EntityNotFoundException("Request not found"));

        AdoptionPost post = request.getAdoptionPost();

        // فقط صاحب البوست
        if (!post.getUser().getId().equals(userPrinciple.getId())) {
            throw new AccessDeniedException("Not allowed");
        }

        // لازم يكون البوست OPEN
        if (post.getAdoptionStatus() != AdoptionStatus.OPEN) {
            throw new IllegalStateException("Adoption post is not open");
        }

        // الطلب لازم يكون PENDING
        if (request.getStatus() != AdoptionRequestStatus.PENDING) {
            throw new IllegalStateException("Invalid request state");
        }

        // قبول الطلب
        request.setStatus(AdoptionRequestStatus.ACCEPTED);

        // البوست يصير RESERVED
        post.setAdoptionStatus(AdoptionStatus.RESERVED);

        // رفض باقي الطلبات
        requestRepository.rejectAllExcept(post.getId(), request.getId());
    }

    // =========================================================
    // D) Completing the adoption (RESERVED → COMPLETED)
    // =========================================================
    public void completeAdoption(
            Long postId
    ) {

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

        // نقل ملكية الحيوان
        requestRepository
                .findByAdoptionPost_IdAndStatus(
                        postId,
                        AdoptionRequestStatus.ACCEPTED
                )
                .ifPresent(req ->
                        post.getPet().setUser(req.getRequester())
                );

        adoptionPostRepository.delete(post);
    }

    // =========================================================
    // E) Cancel adoption post
    // =========================================================
    public void cancelAdoption(
            Long postId
    ) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserPrinciple userPrinciple = (UserPrinciple) authentication.getPrincipal();

        AdoptionPost post = adoptionPostRepository.findById(postId)
                .orElseThrow(() -> new EntityNotFoundException("Adoption post not found"));

        if (!post.getUser().getId().equals(userPrinciple.getId())) {
            throw new AccessDeniedException("Not allowed");
        }

        if(post.getAdoptionStatus() == AdoptionStatus.COMPLETED) {
            throw new IllegalStateException("Adoption has already been completed");
        }

        // رفض كل الطلبات المعلقة
        post.getRequests().forEach(req -> req.setStatus(AdoptionRequestStatus.REJECTED));
        adoptionPostRepository.delete(post);
    }
}
