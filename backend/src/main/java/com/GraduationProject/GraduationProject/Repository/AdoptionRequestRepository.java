package com.GraduationProject.GraduationProject.Repository;

import com.GraduationProject.GraduationProject.Entity.AdoptionRequest;
import com.GraduationProject.GraduationProject.Enum.AdoptionRequestStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AdoptionRequestRepository
        extends JpaRepository<AdoptionRequest, Long> {

    // =================================================
    // هل المستخدم قدّم طلب مسبقًا؟
    // =================================================
    boolean existsByAdoptionPost_IdAndRequester_Id(
            Long adoptionPostId,
            Long requesterId
    );

    // =================================================
    // جلب طلبات بوست معيّن (Pagination)
    // =================================================
    Page<AdoptionRequest> findByAdoptionPost_Id(
            Long adoptionPostId,
            Pageable pageable
    );

    // =================================================
    // جلب الطلب المقبول (واحد فقط)
    // =================================================
    Optional<AdoptionRequest> findByAdoptionPost_IdAndStatus(
            Long adoptionPostId,
            AdoptionRequestStatus status
    );

    // =================================================
    // رفض كل الطلبات ما عدا الطلب المقبول
    // =================================================
    @Modifying
    @Query("""
        UPDATE AdoptionRequest ar
        SET ar.status = 'REJECTED'
        WHERE ar.adoptionPost.id = :postId
          AND ar.id <> :acceptedRequestId
    """)
    void rejectAllExcept(
            @Param("postId") Long postId,
            @Param("acceptedRequestId") Long acceptedRequestId
    );

    // =================================================
    // رفض كل الطلبات المعلّقة (عند الإلغاء)
    // =================================================
    @Modifying
    @Query("""
        UPDATE AdoptionRequest ar
        SET ar.status = 'REJECTED'
        WHERE ar.adoptionPost.id = :postId
          AND ar.status = 'PENDING'
    """)
    void rejectAllPending(
            @Param("postId") Long postId
    );
}
