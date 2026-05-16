package com.GraduationProject.GraduationProject.Controller;

import com.GraduationProject.GraduationProject.Security.SecurityConfig;
import com.GraduationProject.GraduationProject.Filter.JWTFilter;
import com.GraduationProject.GraduationProject.Service.AdminService;
import com.GraduationProject.GraduationProject.Service.AdoptionRequestService;
import com.GraduationProject.GraduationProject.Service.ChatService;
import com.GraduationProject.GraduationProject.Service.ClinicService;
import com.GraduationProject.GraduationProject.Service.NotificationService;
import com.GraduationProject.GraduationProject.Service.PetService;
import com.GraduationProject.GraduationProject.Service.PostService;
import com.GraduationProject.GraduationProject.Service.ServiceService;
import com.GraduationProject.GraduationProject.Service.VerificationRequestService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.web.servlet.MockMvc;

import java.io.IOException;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(
        controllers = {
                AdminController.class,
                AdminNotificationController.class,
                AdminVerificationController.class,
                PostController.class,
                ChatController.class,
                AdoptionRequestController.class,
                ServiceController.class,
                PetController.class,
                ClinicController.class
        },
        excludeFilters = @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = JWTFilter.class)
)
@AutoConfigureMockMvc
@Import({SecurityConfig.class, AdminAuthorizationTest.SecurityTestConfig.class})
class AdminAuthorizationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AdminService adminService;

    @MockBean
    private VerificationRequestService verificationRequestService;

    @MockBean
    private PostService postService;

    @MockBean
    private ChatService chatService;

    @MockBean
    private AdoptionRequestService adoptionRequestService;

    @MockBean
    private ServiceService serviceService;

    @MockBean
    private PetService petService;

    @MockBean
    private ClinicService clinicService;

    @MockBean
    private NotificationService notificationService;

    @Test
    void adminTest_shouldAllowAdminOnly() throws Exception {
        mockMvc.perform(get("/api/admin/test").with(user("admin@test.com").roles("ADMIN")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Admin access granted"));

        mockMvc.perform(get("/api/admin/test").with(user("owner@test.com").roles("OWNER")))
                .andExpect(status().isForbidden());
    }

    @Test
    void adminUsers_shouldRequireAdminRole() throws Exception {
        when(adminService.listUsers(any(), any(), any(), any(Pageable.class))).thenReturn(Page.empty());

        mockMvc.perform(get("/api/admin/users").with(user("admin@test.com").roles("ADMIN")))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/admin/users").with(user("vet@test.com").roles("VET")))
                .andExpect(status().isForbidden());
    }

    @Test
    void adminBroadcast_shouldRequireAdminRole() throws Exception {
        when(notificationService.broadcastAdminAnnouncement(any(), any())).thenReturn(2);

        String body = """
                {
                  "title": "Maintenance",
                  "message": "PetNexus will be updated tonight."
                }
                """;

        mockMvc.perform(post("/api/admin/notifications/broadcast")
                        .with(user("admin@test.com").roles("ADMIN"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.deliveredCount").value(2));

        mockMvc.perform(post("/api/admin/notifications/broadcast")
                        .with(user("owner@test.com").roles("OWNER"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isForbidden());
    }

    @Test
    void adminVerifications_shouldRejectNonAdminUsers() throws Exception {
        mockMvc.perform(get("/api/admin/verifications/pending").with(user("clinic@test.com").roles("CLINIC")))
                .andExpect(status().isForbidden());
    }

    @Test
    void adminRole_shouldBeBlockedFromUserAndProviderFeatures() throws Exception {
        mockMvc.perform(post("/post/regular")
                        .with(user("admin@test.com").roles("ADMIN"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isForbidden());

        mockMvc.perform(post("/chat/start")
                        .with(user("admin@test.com").roles("ADMIN"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isForbidden());

        mockMvc.perform(post("/adoption-requests/1")
                        .with(user("admin@test.com").roles("ADMIN"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isForbidden());

        mockMvc.perform(post("/service")
                        .with(user("admin@test.com").roles("ADMIN"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isForbidden());

        mockMvc.perform(post("/pet")
                        .with(user("admin@test.com").roles("ADMIN"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isForbidden());

        mockMvc.perform(put("/api/clinics/1/location")
                        .with(user("admin@test.com").roles("ADMIN"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isForbidden());
    }

    @TestConfiguration
    static class SecurityTestConfig {

        @Bean
        UserDetailsService userDetailsService() {
            return username -> User.withUsername(username)
                    .password("{noop}password")
                    .roles("ADMIN")
                    .build();
        }

        @Bean
        JWTFilter jwtFilter() {
            return new JWTFilter(null, null) {
                @Override
                protected void doFilterInternal(
                        HttpServletRequest request,
                        HttpServletResponse response,
                        FilterChain filterChain
                ) throws ServletException, IOException {
                    filterChain.doFilter(request, response);
                }
            };
        }
    }
}
