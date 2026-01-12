package com.GraduationProject.GraduationProject.Controller;

import com.GraduationProject.GraduationProject.DTO.*;
import com.GraduationProject.GraduationProject.Entity.Users;
import com.GraduationProject.GraduationProject.Exception.EmailAlreadyExistsException;
import com.GraduationProject.GraduationProject.Service.JWTService;
import com.GraduationProject.GraduationProject.Service.UsersService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Controller for handling user authentication and registration.
 *
 * Features:
 *  - User registration with JWT issuance
 *  - Login / Logout with HttpOnly cookie for authentication
 *  - Retrieve currently authenticated user
 *  - Testing endpoints for development
 */
@RestController
@RequestMapping("/users")
public class UsersController {

    private final UsersService usersService;
    private final JWTService jwtService;

    public UsersController(UsersService usersService, JWTService jwtService) {
        this.usersService = usersService;
        this.jwtService = jwtService;
    }


    /**
     * Registers a new user and generates a JWT token.
     * Sets an HttpOnly cookie for client authentication.
     *
     * @param usersRegisterDTO DTO containing registration info
     * @return ResponseEntity with JWT cookie and safe user info
     */
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody UsersRegisterDTO usersRegisterDTO) {
        try {

            LoginResult loginResult = usersService.addUser(usersRegisterDTO);


            return ResponseEntity.ok()
                    .header(HttpHeaders.SET_COOKIE,
                            authCookie(loginResult.jwt(), 60 * 60 * 24).toString())
                    .body(loginResult.userResponseDTO());

        } catch (EmailAlreadyExistsException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Registration failed"));
        }
    }


    /**
     * Authenticates the user and sets a JWT cookie.
     *
     * @param userLoginDTO DTO containing email & password
     * @return ResponseEntity with JWT cookie and safe user info
     */
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody UserLoginDTO userLoginDTO) {
        LoginResult loginResult = usersService.verify(userLoginDTO);

        if (loginResult == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .header(HttpHeaders.SET_COOKIE, authCookie("", 0).toString())
                    .body("Invalid credentials");
        }

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE,
                        authCookie(loginResult.jwt(), 60 * 60 * 24).toString())
                .body(loginResult.userResponseDTO());
    }


    /**
     * Clears the JWT cookie to log out the user.
     */
    @PostMapping("/logout")
    public ResponseEntity<?> logoutUser() {
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, authCookie("", 0).toString())
                .body("Logged out");
    }


    /**
     * Returns the currently authenticated user's basic info
     * based on the JWT cookie.
     *
     * @param token JWT token from cookie
     * @return UserResponseDTO with email, role, and ID
     */
    @GetMapping("/auth")
    public ResponseEntity<?> currentUser(@CookieValue(name = "authToken", required = false) String token) {
        if (token == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        String email = jwtService.extractEmail(token);
        Users user = usersService.getUserByEmail(email);

        return ResponseEntity.ok(new UserResponseDTO(user.getEmail(), user.getRole().toString(), user.getId()));
    }

    private ResponseCookie authCookie(String value, long maxAge) {
        return ResponseCookie.from("authToken", value)
                .httpOnly(true)
                .secure(true)
                .path("/")
                .sameSite("none")
                .maxAge(maxAge)
                .build();
    }
}
