package com.GraduationProject.GraduationProject.Controller;

import com.GraduationProject.GraduationProject.DTO.AddPetDTO;
import com.GraduationProject.GraduationProject.DTO.PetDTO;
import com.GraduationProject.GraduationProject.Entity.Pet;
import com.GraduationProject.GraduationProject.Service.PetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/pet")
public class PetController {
    private PetService petService;

    public PetController(PetService petService) {
        this.petService = petService;
    }

    @PostMapping
    public String addPet(@RequestBody AddPetDTO addPetDTO){

        return petService.addPet(addPetDTO);
    }

    @DeleteMapping
    public String deletePet(@PathVariable Long id){
        return petService.deletePet(id);
    }


    @GetMapping
    public List<PetDTO> getPetByUserId(){
        return petService.getPetsByUserId();
    }
}
