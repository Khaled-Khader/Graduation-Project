package com.GraduationProject.GraduationProject.Filter;

import com.GraduationProject.GraduationProject.Service.JWTService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * JWTFilter is a Spring Security filter that intercepts incoming HTTP requests
 * to validate JWT tokens from cookies and set the authentication in the SecurityContext.
 *
 * This filter runs once per request and ensures that any valid JWT token
 * in the "authToken" cookie results in a properly authenticated user in Spring Security.
 *
 * It bypasses login and registration endpoints, allowing anonymous access to them.
 */
@Component
public class JWTFilter extends OncePerRequestFilter {

    private final JWTService jwtService;
    private final UserDetailsService userDetailsService;

    /**
     * Constructor for JWTFilter.
     *
     * @param jwtService       Service for extracting and validating JWT tokens
     * @param userDetailsService Service to load user details by username/email
     */
    public JWTFilter(JWTService jwtService, UserDetailsService userDetailsService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    /**
     * Main filter method executed for every request.
     *
     * @param request     HTTP servlet request
     * @param response    HTTP servlet response
     * @param filterChain Filter chain for passing the request/response to the next filter
     * @throws ServletException
     * @throws IOException
     */
    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {


        SecurityContextHolder.clearContext();

        String path = request.getServletPath();


        if (path.equals("/users/login") || path.equals("/users/register")) {
            filterChain.doFilter(request, response);
            return;
        }


        String token = extractTokenFromCookies(request);
        String email = null;

        if (token != null) {
            email = jwtService.extractEmail(token);
        }


        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = userDetailsService.loadUserByUsername(email);


            if (jwtService.validateToken(token, userDetails)) {
                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());

                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }
        filterChain.doFilter(request, response);
    }

    /**
     * Helper method to extract the JWT token from the request cookies.
     *
     * @param request HTTP servlet request
     * @return JWT token string if present, otherwise null
     */
    private String extractTokenFromCookies(HttpServletRequest request) {
        if (request.getCookies() == null) return null;

        for (Cookie cookie : request.getCookies()) {
            if ("authToken".equals(cookie.getName())) {
                return cookie.getValue();
            }
        }
        return null;
    }
}
