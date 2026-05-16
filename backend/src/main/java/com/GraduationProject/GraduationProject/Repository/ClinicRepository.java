package com.GraduationProject.GraduationProject.Repository;

import com.GraduationProject.GraduationProject.Entity.Clinic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClinicRepository extends JpaRepository<Clinic, Long> {
    @Query(value = "SELECT * FROM clinic c WHERE " +
            "c.latitude IS NOT NULL AND c.longitude IS NOT NULL AND " +
            "EXISTS (SELECT 1 FROM verification_requests vr " +
            "WHERE vr.provider_id = c.user_id AND vr.status = 'VERIFIED') AND " +
            "(6371 * acos(cos(radians(:userLat)) * cos(radians(c.latitude)) * " +
            "cos(radians(c.longitude) - radians(:userLng)) + " +
            "sin(radians(:userLat)) * sin(radians(c.latitude)))) <= :radius",
            nativeQuery = true)
    List<Clinic> findNearbyClinics(@Param("userLat") Double userLat,
                                   @Param("userLng") Double userLng,
                                   @Param("radius") Double radius);
}
