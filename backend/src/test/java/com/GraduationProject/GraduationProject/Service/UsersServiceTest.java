package com.GraduationProject.GraduationProject.Service;

import com.GraduationProject.GraduationProject.DTO.LoginResult;
import com.GraduationProject.GraduationProject.DTO.UserLoginDTO;
import com.GraduationProject.GraduationProject.Entity.Users;
import com.GraduationProject.GraduationProject.Enum.EnumRole;
import com.GraduationProject.GraduationProject.Enum.UserAccountStatus;
import com.GraduationProject.GraduationProject.Exception.AccountBlockedException;
import com.GraduationProject.GraduationProject.Repository.UsersRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UsersServiceTest {

    @Mock
    private UsersRepository usersRepository;

    @Mock
    private BCryptPasswordEncoder bCryptPasswordEncoder;

    @Mock
    private JWTService jwtService;

    @InjectMocks
    private UsersService usersService;

    @Test
    void verify_shouldReturnLoginResultForActiveUser() {
        Users user = user(UserAccountStatus.ACTIVE, null);
        UserLoginDTO loginDTO = new UserLoginDTO("owner@test.com", "password");

        when(usersRepository.findByEmail(loginDTO.email())).thenReturn(user);
        when(bCryptPasswordEncoder.matches(loginDTO.passwordHash(), user.getPasswordHash())).thenReturn(true);
        when(jwtService.generateJWTToken(user.getEmail(), user.getRole())).thenReturn("jwt-token");

        LoginResult result = usersService.verify(loginDTO);

        assertNotNull(result);
        assertEquals("jwt-token", result.jwt());
        assertEquals(user.getId(), result.userResponseDTO().id());
    }

    @Test
    void verify_shouldExposeBlockedStatusAndReasonAfterValidPassword() {
        Users user = user(UserAccountStatus.BANNED, "Spam posts");
        UserLoginDTO loginDTO = new UserLoginDTO("owner@test.com", "password");

        when(usersRepository.findByEmail(loginDTO.email())).thenReturn(user);
        when(bCryptPasswordEncoder.matches(loginDTO.passwordHash(), user.getPasswordHash())).thenReturn(true);

        AccountBlockedException ex = assertThrows(
                AccountBlockedException.class,
                () -> usersService.verify(loginDTO)
        );

        assertEquals(UserAccountStatus.BANNED, ex.getAccountStatus());
        assertEquals("Spam posts", ex.getReason());
    }

    private Users user(UserAccountStatus status, String reason) {
        Users user = new Users();
        user.setId(10L);
        user.setEmail("owner@test.com");
        user.setPasswordHash("encoded-password");
        user.setRole(EnumRole.OWNER);
        user.setAccountStatus(status);
        user.setAccountStatusReason(reason);
        return user;
    }
}
