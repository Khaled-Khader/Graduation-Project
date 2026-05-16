package com.GraduationProject.GraduationProject.Controller;

import com.GraduationProject.GraduationProject.DTO.AdminPostDeletionDTO;
import com.GraduationProject.GraduationProject.DTO.AdminStatusUpdateDTO;
import com.GraduationProject.GraduationProject.DTO.AdminUserDTO;
import com.GraduationProject.GraduationProject.DTO.post.AllPosts;
import com.GraduationProject.GraduationProject.Enum.EnumRole;
import com.GraduationProject.GraduationProject.Enum.UserAccountStatus;
import com.GraduationProject.GraduationProject.Security.UserPrinciple;
import com.GraduationProject.GraduationProject.Service.AdminService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping
    public Map<String, String> adminHome(Authentication authentication) {
        return Map.of(
                "message", "Admin access granted",
                "user", authentication.getName(),
                "role", "ADMIN"
        );
    }

    @GetMapping("/test")
    public Map<String, String> adminTest() {
        return Map.of("message", "Admin access granted");
    }

    @GetMapping("/status")
    public Map<String, String> adminStatus() {
        return Map.of("status", "ADMIN_ROUTE_PROTECTED");
    }

    @GetMapping("/users")
    public Page<AdminUserDTO> listUsers(
            @RequestParam(defaultValue = "") String query,
            @RequestParam(required = false) EnumRole role,
            @RequestParam(required = false) UserAccountStatus accountStatus,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        return adminService.listUsers(query, role, accountStatus, pageable);
    }

    @PutMapping("/users/{userId}/suspend")
    public AdminUserDTO suspendUser(
            @PathVariable Long userId,
            @RequestBody(required = false) AdminStatusUpdateDTO dto,
            @AuthenticationPrincipal UserPrinciple currentUser
    ) {
        return adminService.suspendUser(userId, reasonFrom(dto), currentUser);
    }

    @PutMapping("/users/{userId}/ban")
    public AdminUserDTO banUser(
            @PathVariable Long userId,
            @RequestBody(required = false) AdminStatusUpdateDTO dto,
            @AuthenticationPrincipal UserPrinciple currentUser
    ) {
        return adminService.banUser(userId, reasonFrom(dto), currentUser);
    }

    @PutMapping("/users/{userId}/activate")
    public AdminUserDTO activateUser(
            @PathVariable Long userId,
            @AuthenticationPrincipal UserPrinciple currentUser
    ) {
        return adminService.activateUser(userId, currentUser);
    }

    @GetMapping("/posts")
    public Page<AllPosts> listPosts(
            @PageableDefault(size = 20) Pageable pageable,
            @RequestParam(defaultValue = "latest") String sortBy
    ) {
        return adminService.listPosts(pageable, sortBy);
    }

    @DeleteMapping("/posts/{postId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletePost(
            @PathVariable Long postId,
            @RequestBody(required = false) AdminPostDeletionDTO dto
    ) {
        adminService.deletePost(postId, reasonFrom(dto));
    }

    private String reasonFrom(AdminStatusUpdateDTO dto) {
        return dto != null ? dto.reason() : null;
    }

    private String reasonFrom(AdminPostDeletionDTO dto) {
        return dto != null ? dto.reason() : null;
    }
}
