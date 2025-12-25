package com.GraduationProject.GraduationProject.Repository;

import com.GraduationProject.GraduationProject.Entity.Pet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PetRepository extends JpaRepository<Pet, Integer> {

    List<Pet> findByUserId(Long userId);
    Optional<Pet> findById(Long petId);
}
