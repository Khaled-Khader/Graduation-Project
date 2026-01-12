package com.GraduationProject.GraduationProject.Service;

import com.GraduationProject.GraduationProject.DTO.AddPetDTO;
import com.GraduationProject.GraduationProject.DTO.PetDTO;
import com.GraduationProject.GraduationProject.Entity.AdoptionPost;
import com.GraduationProject.GraduationProject.Entity.Pet;
import com.GraduationProject.GraduationProject.Entity.Users;
import com.GraduationProject.GraduationProject.Repository.AdoptionPostRepository;
import com.GraduationProject.GraduationProject.Repository.PetRepository;
import com.GraduationProject.GraduationProject.Repository.UsersRepository;
import com.GraduationProject.GraduationProject.Security.UserPrinciple;
import jakarta.transaction.Transactional;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * Service class for managing Pets in the Pet Nexus application.
 *
 * Responsibilities:
 * 1. Add a new pet for the currently authenticated user.
 * 2. Retrieve all pets belonging to a user.
 * 3. Delete a pet (with checks to prevent deletion if pet is in an adoption post).
 */
@Service
public class PetService {

    private final PetRepository petRepository;
    private final UsersRepository userRepository;
    private final AdoptionPostRepository adoptionPostRepository;

    public PetService(PetRepository petRepository,
                      UsersRepository userRepository,
                      AdoptionPostRepository adoptionPostRepository) {
        this.petRepository = petRepository;
        this.userRepository = userRepository;
        this.adoptionPostRepository = adoptionPostRepository;
    }


    /**
     * Adds a new pet for the currently authenticated user.
     *
     * @param addPetDTO Data transfer object containing pet details
     * @return A confirmation message
     * @throws RuntimeException if the authenticated user does not exist
     */
    @Transactional
    public String addPet(AddPetDTO addPetDTO) {
        Pet pet = new Pet(
                addPetDTO.name(),
                addPetDTO.species(),
                addPetDTO.age(),
                addPetDTO.photoUrl(),
                addPetDTO.healthStatus(),
                addPetDTO.gender(),
                addPetDTO.hasVaccineCert()
        );


        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserPrinciple userPrinciple = (UserPrinciple) authentication.getPrincipal();
        Users user = userRepository.findById(userPrinciple.getId())
                .orElseThrow(() -> new RuntimeException("User does not exist"));


        pet.setUser(user);
        user.getPets().add(pet);


        petRepository.save(pet);

        return "Pet added successfully";
    }


    /**
     * Retrieves all pets belonging to a given user.
     * Converts each Pet entity to a PetDTO for frontend consumption.
     *
     * @param userId The ID of the user
     * @return List of PetDTO objects
     */
    public List<PetDTO> getPetsByUserId(Long userId) {
        List<Pet> pets = petRepository.findByUserId(userId);
        List<PetDTO> petDTOS = new ArrayList<>();

        for (Pet pet : pets) {
            PetDTO petDTO = new PetDTO(
                    pet.getId(),
                    pet.getName(),
                    pet.getSpecies(),
                    pet.getAge(),
                    pet.getPhotoUrl(),
                    pet.getHealthStatus(),
                    pet.getGender(),
                    pet.isHasVaccineCert()
            );
            petDTOS.add(petDTO);
        }

        return petDTOS;
    }


    /**
     * Deletes a pet by ID, ensuring:
     * 1. The authenticated user owns the pet.
     * 2. The pet is not currently part of an adoption post.
     *
     * @param id The ID of the pet to delete
     * @return A confirmation message
     * @throws RuntimeException if pet does not exist, user is not allowed, or pet is in adoption
     */
    public String deletePet(Long id) {

        Pet pet = petRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pet does not exist"));


        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserPrinciple userPrinciple = (UserPrinciple) authentication.getPrincipal();


        if (!userPrinciple.getId().equals(pet.getUser().getId())) {
            throw new RuntimeException("You are not allowed to remove this pet");
        }


        AdoptionPost adoptionPost = adoptionPostRepository.findAdoptionPostByPetId(pet.getId());
        if (adoptionPost != null) {
            throw new RuntimeException("You are not allowed to remove this pet because it is part of an adoption post");
        }


        Users user = userRepository.findById(userPrinciple.getId())
                .orElseThrow(() -> new RuntimeException("User does not exist"));

        user.getPets().remove(pet);
        pet.setUser(null);
        petRepository.delete(pet);

        return "Pet deleted successfully";
    }
}
