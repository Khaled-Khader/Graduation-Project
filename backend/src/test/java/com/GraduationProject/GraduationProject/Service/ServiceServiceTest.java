package com.GraduationProject.GraduationProject.Service;

import com.GraduationProject.GraduationProject.DTO.ServiceDTO;
import com.GraduationProject.GraduationProject.Entity.Users;
import com.GraduationProject.GraduationProject.Enum.EnumRole;
import com.GraduationProject.GraduationProject.Repository.ServiceRepository;
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

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;


    @ExtendWith(MockitoExtension.class)
    class ServiceServiceTest {

        @Mock
        private ServiceRepository serviceRepository;

        @Mock
        private UsersRepository usersRepository;

        @Mock
        private Authentication authentication;

        @Mock
        private SecurityContext securityContext;

        @InjectMocks
        private ServiceService serviceService;

        private Users user;
        private UserPrinciple userPrinciple;

        @BeforeEach
        void setUp() {
            user = new Users();
            user.setId(1L);
            user.setEmail("vet@test.com");
            user.setRole(EnumRole.VET);

            userPrinciple = new UserPrinciple(user);

            lenient().when(securityContext.getAuthentication()).thenReturn(authentication);
            lenient().when(authentication.getPrincipal()).thenReturn(userPrinciple);
            SecurityContextHolder.setContext(securityContext);
        }

        // ✅ addService – success
        @Test
        void addService_shouldAddServiceSuccessfully() {

            ServiceDTO dto =
                    new ServiceDTO(null, null, "Vaccination", "Pet vaccination service");

            when(usersRepository.findById(1L)).thenReturn(Optional.of(user));

            ServiceDTO result = serviceService.addService(dto);

            assertEquals("Vaccination", result.name());
            verify(serviceRepository).save(any(
                    com.GraduationProject.GraduationProject.Entity.Service.class
            ));
        }

        // ❌ addService – unauthorized role
        @Test
        void addService_shouldThrowException_whenUserIsNotVetOrClinic() {

            user.setRole(EnumRole.OWNER);

            ServiceDTO dto =
                    new ServiceDTO(null, null, "Checkup", "General checkup");

            when(usersRepository.findById(1L)).thenReturn(Optional.of(user));

            RuntimeException ex = assertThrows(
                    RuntimeException.class,
                    () -> serviceService.addService(dto)
            );

            assertEquals("Only vets or clinics can create services", ex.getMessage());
            verify(serviceRepository, never()).save(any());
        }

        // ✅ getAllUserServices
        @Test
        void getAllUserServices_shouldReturnServiceList() {

            com.GraduationProject.GraduationProject.Entity.Service service =
                    new com.GraduationProject.GraduationProject.Entity.Service(
                            user,
                            "Grooming",
                            "Pet grooming service"
                    );

            when(serviceRepository.findByUser_Id(1L)).thenReturn(List.of(service));

            List<ServiceDTO> result = serviceService.getAllUserServices(1L);

            assertEquals(1, result.size());
            assertEquals("Grooming", result.get(0).name());
        }

        // ✅ deleteUserService – success
        @Test
        void deleteUserService_shouldDeleteServiceSuccessfully() {

            com.GraduationProject.GraduationProject.Entity.Service service =
                    new com.GraduationProject.GraduationProject.Entity.Service(
                            user,
                            "Training",
                            "Pet training"
                    );
            service.setId(10L);

            when(serviceRepository.findById(10L)).thenReturn(Optional.of(service));

            serviceService.deleteUserService(10L);

            verify(serviceRepository).delete(service);
        }

        // ❌ deleteUserService – not owner
        @Test
        void deleteUserService_shouldThrowException_whenUserNotOwner() {

            Users otherUser = new Users();
            otherUser.setId(2L);

            com.GraduationProject.GraduationProject.Entity.Service service =
                    new com.GraduationProject.GraduationProject.Entity.Service(
                            otherUser,
                            "Surgery",
                            "Surgery service"
                    );

            when(serviceRepository.findById(5L)).thenReturn(Optional.of(service));

            RuntimeException ex = assertThrows(
                    RuntimeException.class,
                    () -> serviceService.deleteUserService(5L)
            );

            assertEquals("User not authorized to delete this service", ex.getMessage());
            verify(serviceRepository, never()).delete(any());
        }

        @AfterEach
        void clearContext() {
            SecurityContextHolder.clearContext();
        }
    }


