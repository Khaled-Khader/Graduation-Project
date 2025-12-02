package com.GraduationProject.GraduationProject.Controller;

import com.GraduationProject.GraduationProject.DTO.UserLoginDTO;
import com.GraduationProject.GraduationProject.DTO.UsersRegisterDTO;
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
    public void registerUser(@RequestBody UsersRegisterDTO usersRegisterDTO) {
        usersService.addUser(usersRegisterDTO);
    }

    @PostMapping("/login")
    public String loginUser(@RequestBody UserLoginDTO userLoginDTO) {
        return usersService.verify(userLoginDTO);
    }


    //Test
    @GetMapping("/test")
    public String test() {
        return "test";
    }

    //Test
    @GetMapping("/testAgain")
    public String testAgain() {
        return "testAgain";
    }


    //Just for testing
    @DeleteMapping("/testing")
    public void deleteUser() {
        usersService.deleteAllTestData();
    }
}
