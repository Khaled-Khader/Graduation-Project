package com.GraduationProject.GraduationProject.Controller;

import com.GraduationProject.GraduationProject.DTO.ProfileDTO;
import com.GraduationProject.GraduationProject.Service.UserProfileService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/user-profile")
public class UserProfileController {

    private  final UserProfileService userProfileService;

    public UserProfileController(UserProfileService userProfileService) {
        this.userProfileService = userProfileService;
    }

    @GetMapping("/{userId}")
    public ProfileDTO getUserProfile(@PathVariable Long userId) {
        return userProfileService.getUserProfile(userId);
    }

}
