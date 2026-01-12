package com.GraduationProject.GraduationProject.Security;

import com.GraduationProject.GraduationProject.Filter.JWTFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

/**
 * Main Security Configuration class for the application.
 *
 * This class configures Spring Security with:
 *
 *     JWT-based authentication
 *     Role-based access control for endpoints
 *     CORS configuration integration
 *     Stateless session management (no HTTP session)
 *
 *
 *
 * Endpoints are secured based on user roles:
 *
 *     CLINIC → /clinic/**
 *     VET → /vet/**
 *     ADMIN → /admin/**
 *     OWNER → /owner/**
 *     CLINIC, VET, OWNER → /pet/**, /service/**, /post/**
 *     Public → /users/register, /users/login, /users/auth
 *
 *
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final UserDetailsService userDetailsService;
    private final JWTFilter jwtFilter;

    @Autowired
    public SecurityConfig(UserDetailsService userDetailsService, JWTFilter jwtFilter) {
        this.userDetailsService = userDetailsService;
        this.jwtFilter = jwtFilter;
    }

    /**
     * Configures the security filter chain.
     *
     * This includes:
     *
     *      CSRF protection (not needed for stateless JWT)
     *     Integrating CORS configuration
     *     Registering a DAO-based authentication provider with BCrypt password encoder
     *     Setting endpoint authorization rules based on roles
     *     Adding JWTFilter before UsernamePasswordAuthenticationFilter
     *     Setting session management to stateless
     *
     *
     *
     * @param http Spring Security HttpSecurity object
     * @param corsConfigurationSource CORS configuration source
     * @return configured SecurityFilterChain
     * @throws Exception in case of security configuration errors
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http,
                                                   CorsConfigurationSource corsConfigurationSource) throws Exception {
        return http
                .csrf(csrf -> csrf.disable()) // Disable CSRF (JWT used instead)
                .cors(cors -> cors.configurationSource(corsConfigurationSource)) // Apply CORS
                .authenticationProvider(authenticationProvider()) // Set DAO-based authentication
                .authorizeHttpRequests(authorizeRequests ->
                        authorizeRequests
                                // Public endpoints
                                .requestMatchers("/users/register", "/users/login", "/users/auth").permitAll()
                                // Role-based access control
                                .requestMatchers("/clinic/**").hasRole("CLINIC")
                                .requestMatchers("/vet/**").hasRole("VET")
                                .requestMatchers("/admin/**").hasRole("ADMIN")
                                .requestMatchers("/owner/**").hasRole("OWNER")
                                .requestMatchers("/pet/**").hasAnyRole("CLINIC", "VET", "OWNER")
                                .requestMatchers("/service/**").hasAnyRole("CLINIC", "VET", "OWNER")
                                .requestMatchers("/post/**").hasAnyRole("CLINIC", "VET", "OWNER")
                                // Any other requests must be authenticated
                                .anyRequest().authenticated())
                // Stateless session: do not use HTTP session
                .sessionManagement(sessionManagement ->
                        sessionManagement.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                // Add JWTFilter before UsernamePasswordAuthenticationFilter
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    /**
     * Configures a DAO authentication provider using the UserDetailsService
     * and BCrypt password encoder.
     *
     * @return AuthenticationProvider
     */
    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authenticationProvider = new DaoAuthenticationProvider(userDetailsService);
        authenticationProvider.setPasswordEncoder(passwordEncoder());
        return authenticationProvider;
    }

    /**
     * Exposes the AuthenticationManager bean used by Spring Security.
     *
     * @param config AuthenticationConfiguration
     * @return AuthenticationManager
     * @throws Exception
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    /**
     * BCrypt password encoder bean for hashing passwords.
     *
     * @return BCryptPasswordEncoder
     */
    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
