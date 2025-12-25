package com.GraduationProject.GraduationProject.Service;

import com.GraduationProject.GraduationProject.DTO.AddPetDTO;
import com.GraduationProject.GraduationProject.DTO.PetDTO;
import com.GraduationProject.GraduationProject.Entity.Pet;
import com.GraduationProject.GraduationProject.Entity.Users;
import com.GraduationProject.GraduationProject.Repository.PetRepository;
import com.GraduationProject.GraduationProject.Repository.UsersRepository;
import com.GraduationProject.GraduationProject.Security.UserPrinciple;
import jakarta.transaction.Transactional;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.nio.file.attribute.UserPrincipal;
import java.util.ArrayList;
import java.util.List;

@Service
public class PetService {

    private final PetRepository petRepository;
    private final UsersRepository userRepository;
    public PetService(PetRepository petRepository,UsersRepository userRepository) {
        this.petRepository = petRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public String addPet(AddPetDTO addPetDTO) {
        Pet pet = new Pet(
                addPetDTO.name(),
                addPetDTO.species(),
                addPetDTO.age(),
                addPetDTO.photoUrl(),
                addPetDTO.healthStatus(),
                addPetDTO.hasVaccineCert()
        );

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        UserPrinciple userPrinciple = (UserPrinciple) authentication.getPrincipal();

        Users user= userRepository.findById(userPrinciple.getId()).orElseThrow(
                ()-> new RuntimeException("UserDOes not exist")
        );

        pet.setUser(user);
        user.getPets().add(pet);
        petRepository.save(pet);

        return "Pet added successfully";
    }

    public List<PetDTO> getPetsByUserId() {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserPrinciple userPrinciple = (UserPrinciple) authentication.getPrincipal();

        Users user= userRepository.findById(userPrinciple.getId()).orElseThrow(
                ()-> new RuntimeException("User does not exist")
        );

        List<Pet> pets = petRepository.findByUserId(user.getId());
        List<PetDTO>petDTOS = new ArrayList<>();

        for (Pet pet : pets) {
            PetDTO petDTO=new PetDTO(
                    pet.getId(),
                    pet.getName(),
                    pet.getSpecies(),
                    pet.getAge(),
                    pet.getPhotoUrl(),
                    pet.getHealthStatus(),
                    pet.isHasVaccineCert()
            );
            petDTOS.add(petDTO);
        }

        return petDTOS ;
    }

    public String deletePet(Long id){

        Pet pet=petRepository.findById(id).orElseThrow(
                ()-> new RuntimeException("Pet does not exist")
        );

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        UserPrinciple userPrinciple = (UserPrinciple) authentication.getPrincipal();

        if(!(userPrinciple.getId().equals(pet.getUser().getId()))){
            throw new RuntimeException("You are not allow to remove this pet");
        }

        Users  user= userRepository.findById(userPrinciple.getId()).orElseThrow(
                ()-> new RuntimeException("User does not exist")
        );

        user.getPets().remove(pet);
        pet.setUser(null);

        petRepository.delete(pet);

        return "Pet deleted successfully";
    }



}
