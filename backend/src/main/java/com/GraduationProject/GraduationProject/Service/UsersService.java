package com.GraduationProject.GraduationProject.Service;

import com.GraduationProject.GraduationProject.DTO.LoginResult;
import com.GraduationProject.GraduationProject.DTO.UserLoginDTO;
import com.GraduationProject.GraduationProject.DTO.UserResponseDTO;
import com.GraduationProject.GraduationProject.DTO.UsersRegisterDTO;
import com.GraduationProject.GraduationProject.Entity.*;
import com.GraduationProject.GraduationProject.Enum.EnumRole;
import com.GraduationProject.GraduationProject.Exception.EmailAlreadyExistsException;
import com.GraduationProject.GraduationProject.Repository.*;
import jakarta.transaction.Transactional;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
public class UsersService {

    private final UsersRepository usersRepository;
    private final BCryptPasswordEncoder bCryptPasswordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JWTService jwtService;

    public UsersService(UsersRepository usersRepository ,
                        BCryptPasswordEncoder bCryptPasswordEncoder,
                        AuthenticationManager authenticationManager,
                        JWTService jwtService
                        ) {
        this.usersRepository = usersRepository;
        this.bCryptPasswordEncoder = bCryptPasswordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;

    }

    public boolean isUserExists(String email) {
        return usersRepository.existsByEmail(email);
    }

    public LoginResult addUser(UsersRegisterDTO usersRegisterDTO) {
        if (usersRepository.existsByEmail(usersRegisterDTO.email())) {
            throw new EmailAlreadyExistsException("Email Already Exists");
        }

        Users users = new Users();
        users.setEmail(usersRegisterDTO.email());
        users.setPasswordHash(bCryptPasswordEncoder.encode(usersRegisterDTO.passwordHash()));
        users.setRole(usersRegisterDTO.role());

        // User info
        UserInfo userInfo = new UserInfo();
        userInfo.setUsers(users);
        userInfo.setFirstName(usersRegisterDTO.userInfoDTO().firstName());
        userInfo.setLastName(usersRegisterDTO.userInfoDTO().lastName());
        userInfo.setBio(usersRegisterDTO.userInfoDTO().bio());
        userInfo.setPhotoUrl(usersRegisterDTO.userInfoDTO().photoUrl());
        users.setUserInfo(userInfo);

        // Role-specific entities
        switch (usersRegisterDTO.role()) {
            case VET -> {
                Vet vet = new Vet();
                vet.setUsers(users);
                vet.setSpecialty(usersRegisterDTO.vetDTO().specialty());
                users.setVet(vet);
            }
            case CLINIC -> {
                Clinic clinic = new Clinic();
                clinic.setUsers(users);
                clinic.setCity(usersRegisterDTO.clinicDTO().city());
                clinic.setAddress(usersRegisterDTO.clinicDTO().address());
                clinic.setLatitude(usersRegisterDTO.clinicDTO().latitude());
                clinic.setLongitude(usersRegisterDTO.clinicDTO().longitude());
                users.setClinic(clinic);
            }
            case OWNER -> {
                Owner owner = new Owner();
                owner.setUsers(users);
                users.setOwner(owner);
            }
        }

        // Save user
        usersRepository.save(users);

        // Generate JWT directly
        String jwt = jwtService.generateJWTToken(users.getEmail(), users.getRole().toString());

        UserResponseDTO userResponseDTO = new UserResponseDTO(
                users.getEmail(),
                users.getRole().toString(),
                users.getId()
        );

        return new LoginResult(jwt, userResponseDTO);
    }


    public Users getUserByEmail(String email){
        return usersRepository.findByEmail(email);
    }

    public LoginResult verify(UserLoginDTO userLoginDTO) {



        try {
            Authentication authentication =
                    authenticationManager.authenticate(
                            new UsernamePasswordAuthenticationToken(userLoginDTO.email(), userLoginDTO.passwordHash())
                    );

            Users user = usersRepository.findByEmail(userLoginDTO.email());

            String jwt=jwtService.generateJWTToken(userLoginDTO.email(), user.getRole().name());

            UserResponseDTO userResponseDTO=new UserResponseDTO(
                    user.getEmail(),
                    user.getRole().toString(),
                    user.getId()
            );
            LoginResult loginResult=new LoginResult(jwt,userResponseDTO);
            return loginResult;
        }catch (Exception e){
            return null;
        }

    }






    @Transactional
    public String deleteAllTestData() {
        usersRepository.deleteAll();
        return "All test data has been deleted";
    }


}
