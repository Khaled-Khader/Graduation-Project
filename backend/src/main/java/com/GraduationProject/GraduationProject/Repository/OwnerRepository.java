package com.GraduationProject.GraduationProject.Repository;
import com.GraduationProject.GraduationProject.Entity.Owner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OwnerRepository extends JpaRepository<Owner,Long> {
}
