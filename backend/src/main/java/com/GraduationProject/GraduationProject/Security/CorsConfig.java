package com.GraduationProject.GraduationProject.Security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * Global CORS configuration.
 *
 * Enables secure cross-origin requests between the frontend
 * (React / Vite) and the backend (Spring Boot API),
 * including support for HttpOnly cookies.
 */
@Configuration
public class CorsConfig {

    @Value("${frontend.url}")
    private String frontendUrl;
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        // 🔐 Required for HttpOnly cookies (JWT)
        config.setAllowCredentials(true);

        // 🌍 Allowed frontend origins
        config.setAllowedOrigins(List.of(
                frontendUrl,
                "https://pet-nexus.vercel.app"
        ));

        // 🔁 Allowed HTTP methods
        config.setAllowedMethods(List.of(
                "GET",
                "POST",
                "PUT",
                "DELETE",
                "PATCH",
                "OPTIONS"
        ));

        // 📩 Allowed request headers
        config.setAllowedHeaders(List.of(
                "Authorization",
                "Content-Type",
                "X-Requested-With",
                "Accept"
        ));

        // 📤 Exposed response headers
        config.setExposedHeaders(List.of(
                "Set-Cookie"
        ));

        // ⏱ Cache preflight response for 1 hour
        config.setMaxAge(3600L);

        // 📌 Apply this CORS config to all endpoints
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        return source;
    }
}
