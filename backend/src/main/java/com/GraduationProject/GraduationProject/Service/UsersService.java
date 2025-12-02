package com.GraduationProject.GraduationProject.Service;

import com.GraduationProject.GraduationProject.DTO.UsersRequestDTO;
import com.GraduationProject.GraduationProject.Entity.*;
import com.GraduationProject.GraduationProject.Enum.EnumRole;
import com.GraduationProject.GraduationProject.Repository.*;
import jakarta.transaction.Transactional;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@Transactional
public class UsersService {

    private final UsersRepository usersRepository;
    private final BCryptPasswordEncoder bCryptPasswordEncoder;

    public UsersService(UsersRepository usersRepository ,
                        BCryptPasswordEncoder bCryptPasswordEncoder
                        ) {
        this.usersRepository = usersRepository;
        this.bCryptPasswordEncoder = bCryptPasswordEncoder;

    }

    public Users addUser(UsersRequestDTO usersRequestDTO){
        if(usersRepository.existsByEmail(usersRequestDTO.email())){
            throw new RuntimeException("Email already exists");
        }
        Users users = new Users();
        users.setEmail(usersRequestDTO.email());
        users.setPasswordHash(bCryptPasswordEncoder.encode(usersRequestDTO.passwordHash()));
        users.setRole(usersRequestDTO.role());


        UserInfo userInfo = new UserInfo();
        userInfo.setUsers(users);
        userInfo.setFirstName(usersRequestDTO.userInfoDTO().firstName());
        userInfo.setLastName(usersRequestDTO.userInfoDTO().lastName());
        userInfo.setBio(usersRequestDTO.userInfoDTO().bio());

        users.setUserInfo(userInfo);

        switch (usersRequestDTO.role()){
            case EnumRole.VET:
                Vet vet = new Vet();
                vet.setUsers(users);
                vet.setSpecialty(usersRequestDTO.vetDTO().specialty());
                users.setVet(vet);
                break;

                case EnumRole.CLINIC:
                    Clinic clinic = new Clinic();
                    clinic.setUsers(users);
                    clinic.setCity(usersRequestDTO.clinicDTO().city());
                    clinic.setAddress(usersRequestDTO.clinicDTO().address());
                    clinic.setLatitude(usersRequestDTO.clinicDTO().latitude());
                    clinic.setLongitude(usersRequestDTO.clinicDTO().longitude());
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


    @Transactional
    public String deleteAllTestData() {
        usersRepository.deleteAll();
        return "All test data has been deleted";
    }


}
