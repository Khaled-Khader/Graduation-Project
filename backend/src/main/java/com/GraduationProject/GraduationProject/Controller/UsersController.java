package com.GraduationProject.GraduationProject.Controller;

import com.GraduationProject.GraduationProject.DTO.LoginResult;
import com.GraduationProject.GraduationProject.DTO.UserLoginDTO;
import com.GraduationProject.GraduationProject.DTO.UserResponseDTO;
import com.GraduationProject.GraduationProject.DTO.UsersRegisterDTO;
import com.GraduationProject.GraduationProject.Entity.Users;
import com.GraduationProject.GraduationProject.Service.JWTService;
import com.GraduationProject.GraduationProject.Service.UsersService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
    public void registerUser(@RequestBody UsersRegisterDTO usersRegisterDTO) {
        usersService.addUser(usersRegisterDTO);
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody UserLoginDTO userLoginDTO) {



       LoginResult loginResult = usersService.verify(userLoginDTO);

        if (loginResult == null) {
            ResponseCookie deleteCookie = ResponseCookie.from("authToken", "")
                    .httpOnly(true)
                    .secure(false)
                    .path("/")
                    .maxAge(0)
                    .sameSite("Strict")
                    .build();

            return ResponseEntity.status(401)
                    .header(HttpHeaders.SET_COOKIE, deleteCookie.toString())
                    .body("Invalid email or password");
        }


        ResponseCookie cookie = ResponseCookie.from("authToken", loginResult.jwt())
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(60 * 60 * 24) // 1 day
                .sameSite("Strict")
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(loginResult.userResponseDTO());
    }

    @PostMapping("logout")
    public ResponseEntity<?> logoutUser(HttpServletResponse response) {
        Cookie cookie = new Cookie("authToken", "");

        cookie.setHttpOnly(true);
        cookie.setSecure(false);
        cookie.setPath("/");
        cookie.setMaxAge(0);

        response.addCookie(cookie);

        return ResponseEntity.ok("Logged out");
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
