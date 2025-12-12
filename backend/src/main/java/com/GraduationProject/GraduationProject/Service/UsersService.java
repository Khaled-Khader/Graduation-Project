package com.GraduationProject.GraduationProject.Service;

import com.GraduationProject.GraduationProject.DTO.LoginResult;
import com.GraduationProject.GraduationProject.DTO.UserLoginDTO;
import com.GraduationProject.GraduationProject.DTO.UserResponseDTO;
import com.GraduationProject.GraduationProject.DTO.UsersRegisterDTO;
import com.GraduationProject.GraduationProject.Entity.*;
import com.GraduationProject.GraduationProject.Enum.EnumRole;
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

    public Users addUser(UsersRegisterDTO usersRegisterDTO){
        if(usersRepository.existsByEmail(usersRegisterDTO.email())){
            throw new RuntimeException("Email already exists");
        }
        Users users = new Users();
        users.setEmail(usersRegisterDTO.email());
        users.setPasswordHash(bCryptPasswordEncoder.encode(usersRegisterDTO.passwordHash()));
        users.setRole(usersRegisterDTO.role());


        UserInfo userInfo = new UserInfo();
        userInfo.setUsers(users);
        userInfo.setFirstName(usersRegisterDTO.userInfoDTO().firstName());
        userInfo.setLastName(usersRegisterDTO.userInfoDTO().lastName());
        userInfo.setBio(usersRegisterDTO.userInfoDTO().bio());

        users.setUserInfo(userInfo);

        switch (usersRegisterDTO.role()){
            case EnumRole.VET:
                Vet vet = new Vet();
                vet.setUsers(users);
                vet.setSpecialty(usersRegisterDTO.vetDTO().specialty());
                users.setVet(vet);
                break;

                case EnumRole.CLINIC:
                    Clinic clinic = new Clinic();
                    clinic.setUsers(users);
                    clinic.setCity(usersRegisterDTO.clinicDTO().city());
                    clinic.setAddress(usersRegisterDTO.clinicDTO().address());
                    clinic.setLatitude(usersRegisterDTO.clinicDTO().latitude());
                    clinic.setLongitude(usersRegisterDTO.clinicDTO().longitude());
                    users.setClinic(clinic);
                    break;

            case EnumRole.OWNER:
                Owner owner = new Owner();
                owner.setUsers(users);
                users.setOwner(owner);
                break;


        }
        usersRepository.save(users);
        return users;
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
