package com.GraduationProject.GraduationProject.Controller;

import com.GraduationProject.GraduationProject.DTO.AddPetDTO;
import com.GraduationProject.GraduationProject.DTO.PetDTO;
import com.GraduationProject.GraduationProject.Service.PetService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller for managing Pets.
 *
 * Responsibilities:
 *  - Adding a new pet
 *  - Deleting a pet
 *  - Retrieving all pets for a specific user
 *
 * Maps HTTP requests to the corresponding PetService methods.
 */
@RestController
@RequestMapping("/pet")
public class PetController {

    private final PetService petService;

    public PetController(PetService petService) {
        this.petService = petService;
    }


    /**
     * Adds a new pet for the currently authenticated user.
     *
     * @param addPetDTO DTO containing pet details (name, species, age, photo, health status, gender, vaccine certificate)
     * @return Success message confirming that the pet was added
     */
    @PostMapping
    public String addPet(@RequestBody AddPetDTO addPetDTO) {
        return petService.addPet(addPetDTO);
    }


    /**
     * Deletes a pet by its ID.
     *
     * Restrictions:
     *  - The pet must belong to the currently authenticated user
     *  - The pet must not be linked to any active adoption post
     *
     * @param id ID of the pet to delete
     * @return Success message confirming deletion
     */
    @DeleteMapping("{id}")
    public String deletePet(@PathVariable Long id) {
        return petService.deletePet(id);
    }


    /**
     * Retrieves all pets owned by a specific user.
     *
     * @param userId ID of the user
     * @return List of PetDTO objects representing the user's pets
     */
    @GetMapping("{userId}")
    public List<PetDTO> getPetByUserId(@PathVariable Long userId) {
        return petService.getPetsByUserId(userId);
    }
}
