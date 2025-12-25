package com.GraduationProject.GraduationProject.Repository;

import com.GraduationProject.GraduationProject.Entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UsersRepository extends JpaRepository<Users, Long> {
    boolean existsByEmail(String email);
    Users findByEmail(String email);
    Optional<Users> findById(Long id);
}
