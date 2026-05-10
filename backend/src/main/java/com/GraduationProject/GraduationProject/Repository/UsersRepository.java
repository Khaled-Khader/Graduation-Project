package com.GraduationProject.GraduationProject.Repository;

import com.GraduationProject.GraduationProject.Entity.Users;
import com.GraduationProject.GraduationProject.Enum.EnumRole;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.Optional;

@Repository
public interface UsersRepository extends JpaRepository<Users, Long> {
    boolean existsByEmail(String email);
    Users findByEmail(String email);
    Optional<Users> findById(Long id);

    @Query("""
            SELECT u FROM Users u
            LEFT JOIN u.userInfo info
            WHERE u.role IN :roles
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
            @Param("query") String query,
            Pageable pageable
    );
}
