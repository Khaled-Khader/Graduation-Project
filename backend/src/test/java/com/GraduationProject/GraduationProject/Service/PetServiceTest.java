package com.GraduationProject.GraduationProject.Service;

import com.GraduationProject.GraduationProject.DTO.AddPetDTO;
import com.GraduationProject.GraduationProject.Entity.Pet;
import com.GraduationProject.GraduationProject.Entity.Users;
import com.GraduationProject.GraduationProject.Enum.EnumRole;
import com.GraduationProject.GraduationProject.Repository.PetRepository;
import com.GraduationProject.GraduationProject.Repository.UsersRepository;
import com.GraduationProject.GraduationProject.Security.UserPrinciple;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PetServiceTest {

    // Mocks
    @Mock
    private PetRepository petRepository;

    @Mock
    private UsersRepository usersRepository;

    @Mock
    private Authentication authentication;

    @Mock
    private SecurityContext securityContext;

    // Service
    @InjectMocks
    private PetService petService;

    // Test Data
    private Users user;
    private UserPrinciple userPrinciple;

    // Setup
    @BeforeEach
    void setUp() {

        user = new Users();
        user.setId(1L);
        user.setEmail("test@email.com");
        user.setPasswordHash("password");
        user.setRole(EnumRole.VET);
        user.setPets(new ArrayList<>());

        userPrinciple = new UserPrinciple(user);

        lenient().when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);
        lenient().when(authentication.getPrincipal()).thenReturn(userPrinciple);
    }


    //  Test addPet
    @Test
    void addPet_shouldAddPetSuccessfully() {

        AddPetDTO dto = new AddPetDTO(
                "Max",
                "Dog",
                3.0,
                "url",
                "Healthy",
                "MALE",
                true
        );

        when(usersRepository.findById(1L)).thenReturn(Optional.of(user));

        String result = petService.addPet(dto);

        assertEquals("Pet added successfully", result);
        assertEquals(1, user.getPets().size());
        verify(petRepository).save(any(Pet.class));
    }

    // Test getPetsByUserId
    @Test
    void getPetsByUserId_shouldReturnPetDTOList() {

        Pet pet = new Pet(
                "Max",
                "Dog",
                2.0,
                "url",
                "Healthy",
                "MALE",
                true
        );
        pet.setId(10L);

        when(petRepository.findByUserId(1L)).thenReturn(List.of(pet));

        var result = petService.getPetsByUserId(1L);

        assertEquals(1, result.size());
        assertEquals("Max", result.get(0).name());
    }

    // Test deletePet (Success)
    @Test
    void deletePet_shouldDeletePetSuccessfully() {

        Pet pet = new Pet(
                "Max",
                "Dog",
                2.0,
                "url",
                "Healthy",
                "MALE",
                true
        );
        pet.setId(5L);
        pet.setUser(user);
        user.getPets().add(pet);

        when(petRepository.findById(5L)).thenReturn(Optional.of(pet));
        when(usersRepository.findById(1L)).thenReturn(Optional.of(user));

        String result = petService.deletePet(5L);

        assertEquals("Pet deleted successfully", result);
        verify(petRepository).delete(pet);
        assertTrue(user.getPets().isEmpty());
    }

    //  Test deletePet (Unauthorized)
    @Test
    void deletePet_shouldThrowException_whenUserIsNotOwner() {

        Users otherUser = new Users();
        otherUser.setId(2L);
        otherUser.setRole(EnumRole.VET);

        Pet pet = new Pet();
        pet.setUser(otherUser);

        when(petRepository.findById(5L)).thenReturn(Optional.of(pet));

        RuntimeException ex = assertThrows(
                RuntimeException.class,
                () -> petService.deletePet(5L)
        );

        assertEquals("You are not allow to remove this pet", ex.getMessage());
    }

    //  Cleanup
    @AfterEach
    void clearContext() {
        SecurityContextHolder.clearContext();
    }
}
