package com.GraduationProject.GraduationProject.Controller;

import com.GraduationProject.GraduationProject.DTO.ProfileDTO;
import com.GraduationProject.GraduationProject.Service.UserProfileService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tools.jackson.databind.JsonNode;

import java.util.Map;

/**
 * Controller for managing user profiles in PetNexus.
 *
 * Responsibilities:
 *  - Retrieve a user's profile (including pets, services, vet/clinic info)
 *  - Edit the authenticated user's profile
 */
@RestController
@RequestMapping("/user-profile")
public class UserProfileController {

    private final UserProfileService userProfileService;

    public UserProfileController(UserProfileService userProfileService) {
        this.userProfileService = userProfileService;
    }


    /**
     * Retrieves the profile of a specific user.
     *
     * The profile includes:
     *  - Basic user info (name, bio, photo)
     *  - Role-specific info (vet specialty or clinic details)
     *  - List of pets
     *  - List of services
     *
     * @param userId ID of the user whose profile is requested
     * @return ProfileDTO containing all relevant profile information
     */
    @GetMapping("/{userId}")
    public ProfileDTO getUserProfile(@PathVariable Long userId) {
        return userProfileService.getUserProfile(userId);
    }


    /**
     * Updates the authenticated user's profile.
     * Accepts a JSON payload with any of the following optional fields:
     *  - firstName, lastName, bio, photoUrl
     *  - specialty (for VET users)
     *  - latitude, longitude, city, address (for CLINIC users)
     *
     * The service layer ensures:
     *  - Only valid text and number fields are updated
     *  - Role-specific fields are updated only if the user has the corresponding role
     *
     * @param updates JSON payload with fields to update
     * @return ResponseEntity with success message or error details
     */
    @PatchMapping
    public ResponseEntity<?> editProfile(@RequestBody JsonNode updates) {
        try {
            userProfileService.editUserProfile(updates);
            return ResponseEntity.ok(Map.of("Message", "Profile updated successfully"));
        } catch (RuntimeException e) {
            // Return bad request if something goes wrong (invalid fields, user not found, etc.)
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
}
