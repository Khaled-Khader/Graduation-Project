package com.GraduationProject.GraduationProject.Controller;

import com.GraduationProject.GraduationProject.DTO.LoginResult;
import com.GraduationProject.GraduationProject.DTO.UserLoginDTO;
import com.GraduationProject.GraduationProject.DTO.UserResponseDTO;
import com.GraduationProject.GraduationProject.DTO.UsersRegisterDTO;
import com.GraduationProject.GraduationProject.Entity.Users;
import com.GraduationProject.GraduationProject.Exception.EmailAlreadyExistsException;
import com.GraduationProject.GraduationProject.Service.JWTService;
import com.GraduationProject.GraduationProject.Service.UsersService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/users")
public class UsersController {

    private final UsersService usersService;
    private final JWTService jwtService;
    @Autowired
    public UsersController(UsersService usersService , JWTService jwtService) {
        this.usersService = usersService;
        this.jwtService = jwtService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody UsersRegisterDTO usersRegisterDTO) {
        try {
            // 1. Create user & generate JWT
            LoginResult loginResult = usersService.addUser(usersRegisterDTO);

            // 2. Set cookie + return safe JSON (id, email, role)
            return ResponseEntity.ok()
                    .header(HttpHeaders.SET_COOKIE,
                            authCookie(loginResult.jwt(), 60 * 60 * 24).toString())
                    .body(loginResult.userResponseDTO()); // only safe data
        } catch (EmailAlreadyExistsException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Registration failed"));
        }
    }



    private ResponseCookie authCookie(String value, long maxAge) {
        return ResponseCookie.from("authToken", value)
                .httpOnly(true)
                .secure(false)
                .path("/")
                .sameSite("Strict")
                .maxAge(maxAge)
                .build();
    }


    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody UserLoginDTO userLoginDTO) {

        LoginResult loginResult = usersService.verify(userLoginDTO);
        if (loginResult == null) {
            return ResponseEntity.status(401)
                    .header(HttpHeaders.SET_COOKIE, authCookie("", 0).toString())
                    .body("Invalid credentials");
        }

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE,
                        authCookie(loginResult.jwt(), 60 * 60 * 24).toString())
                .body(loginResult.userResponseDTO());
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logoutUser() {
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, authCookie("", 0).toString())
                .body("Logged out");
    }


    @GetMapping("/auth")
    public ResponseEntity<?> currentUser(@CookieValue(name = "authToken", required = false) String token) {
        if (token == null) return ResponseEntity.status(401).build();

        String email = jwtService.extractEmail(token);
        Users user = usersService.getUserByEmail(email);

        return ResponseEntity.ok(new UserResponseDTO(user.getEmail(), user.getRole().toString(), user.getId()));
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
