package com.GraduationProject.GraduationProject.Repository;

import com.GraduationProject.GraduationProject.Entity.Users;
import com.GraduationProject.GraduationProject.Enum.EnumRole;
import com.GraduationProject.GraduationProject.Enum.UserAccountStatus;
import com.GraduationProject.GraduationProject.Enum.VerificationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface UsersRepository extends JpaRepository<Users, Long> {
    boolean existsByEmail(String email);
    Users findByEmail(String email);
    Optional<Users> findById(Long id);
    List<Users> findByRoleNotAndAccountStatus(EnumRole role, UserAccountStatus accountStatus);

    @Query("""
            SELECT u FROM Users u
            LEFT JOIN u.userInfo info
            WHERE (:role IS NULL OR u.role = :role)
              AND (:accountStatus IS NULL OR u.accountStatus = :accountStatus)
              AND (
                    :query = ''
                    OR LOWER(COALESCE(info.firstName, '')) LIKE CONCAT('%', :query, '%')
                    OR LOWER(COALESCE(info.lastName, '')) LIKE CONCAT('%', :query, '%')
                    OR LOWER(CONCAT(COALESCE(info.firstName, ''), ' ', COALESCE(info.lastName, ''))) LIKE CONCAT('%', :query, '%')
                    OR LOWER(COALESCE(u.email, '')) LIKE CONCAT('%', :query, '%')
                  )
            ORDER BY u.id DESC
            """)
    Page<Users> searchUsers(
            @Param("query") String query,
            @Param("role") EnumRole role,
            @Param("accountStatus") UserAccountStatus accountStatus,
            Pageable pageable
    );

    @Query("""
            SELECT u FROM Users u
            LEFT JOIN u.userInfo info
            WHERE u.role IN :roles
              AND (
                    EXISTS (
                        SELECT vr.id FROM VerificationRequest vr
                        WHERE vr.provider = u
                          AND vr.status = :verifiedStatus
                    )
                  )
              AND (
                    :query = ''
                    OR LOWER(COALESCE(info.firstName, '')) LIKE CONCAT('%', :query, '%')
                    OR LOWER(COALESCE(info.lastName, '')) LIKE CONCAT('%', :query, '%')
                    OR LOWER(CONCAT(COALESCE(info.firstName, ''), ' ', COALESCE(info.lastName, ''))) LIKE CONCAT('%', :query, '%')
                    OR LOWER(COALESCE(u.email, '')) LIKE CONCAT('%', :query, '%')
                  )
            ORDER BY info.firstName ASC, info.lastName ASC
            """)
    Page<Users> searchProviders(
            @Param("roles") Collection<EnumRole> roles,
            @Param("verifiedStatus") VerificationStatus verifiedStatus,
            @Param("query") String query,
            Pageable pageable
    );
}
