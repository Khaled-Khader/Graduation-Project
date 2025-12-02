package com.GraduationProject.GraduationProject.Controller;

import com.GraduationProject.GraduationProject.DTO.UsersRequestDTO;
import com.GraduationProject.GraduationProject.Service.UsersService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
public class UsersController {

    private final UsersService usersService;

    @Autowired
    public UsersController(UsersService usersService) {
        this.usersService = usersService;
    }

    @PostMapping("/register")
    public void registerUser(@RequestBody UsersRequestDTO usersRequestDTO) {
        usersService.addUser(usersRequestDTO);
    }

    @DeleteMapping("/testing")
    public void deleteUser() {
        usersService.deleteAllTestData();
    }
}
