package com.GraduationProject.GraduationProject.Security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * Configuration class for Cross-Origin Resource Sharing (CORS).
 *
 * This class defines a CORS policy to allow the frontend
 * applications (running on different origins) to communicate
 * securely with the backend API.
 *
 * Features:
 * - Allows credentials (cookies, authorization headers)
 * - Specifies allowed origins
 * - Defines permitted HTTP methods
 * - Sets allowed headers and exposed headers
 * - Configures maximum age for preflight requests
 */
@Configuration
public class CorsConfig {

    /**
     * Defines the CORS configuration source bean.
     *
     * This bean is automatically used by Spring Security
     * to enforce the CORS policy on all endpoints.
     *
     * @return the configured CorsConfigurationSource
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        // Allow credentials such as cookies or HTTP authentication
        config.setAllowCredentials(true);

        // Allowed origins (frontend URLs)
        config.setAllowedOrigins(List.of(
                "http://localhost:5173",
                "http://127.0.0.1:3000"
        ));

        // Allowed HTTP methods
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));

        // Allowed request headers
        config.setAllowedHeaders(List.of("Authorization", "Content-Type", "X-Requested-With", "Accept"));

        // Expose certain headers to the client
        config.setExposedHeaders(List.of("Set-Cookie"));

        // Max age for preflight requests (in seconds)
        config.setMaxAge(3600L);

        // Apply this configuration to all endpoints
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        return source;
    }
}
