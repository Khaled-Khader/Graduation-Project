package com.GraduationProject.GraduationProject.Service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

/**
 * Service for handling JWT (JSON Web Tokens) operations.
 *
 * Responsibilities:
 * 1. Generate JWT tokens for authenticated users.
 * 2. Extract claims like email and role from a token.
 * 3. Validate tokens and check expiration.
 */
@Service
public class JWTService {

    @Value("${jwt.secret}")
    private String secretKey; // Secret key from application properties


    /**
     * Generates a JWT token containing the user's email and role.
     * The token is valid for 24 hours from the time of creation.
     *
     * @param email User's email (used as subject)
     * @param role  User's role (added as a custom claim)
     * @return A signed JWT token string
     */
    public String generateJWTToken(String email, String role) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", role);

        return Jwts.builder()
                .claims(claims)
                .subject(email)
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + 1000L * 60 * 60 * 24)) // 24 hours
                .signWith(getSecretKey())
                .compact();
    }


    /**
     * Extracts the role claim from a JWT token.
     *
     * @param token JWT token
     * @return Role as a String
     */
    public String extractRole(String token) {
        return extractAllClaims(token).get("role", String.class);
    }

    /**
     * Extracts the email (subject) from a JWT token.
     *
     * @param token JWT token
     * @return Email as a String
     */
    public String extractEmail(String token) {
        return extractClaim(token, Claims::getSubject);
    }


    /**
     * Checks if a token is valid for a given user.
     * A token is valid if:
     * 1. The email in the token matches the user's email.
     * 2. The token has not expired.
     *
     * @param token       JWT token
     * @param userDetails UserDetails of the authenticated user
     * @return true if valid, false otherwise
     */
    public boolean validateToken(String token, UserDetails userDetails) {
        final String email = extractEmail(token);
        return (email.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }


    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    private <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    /**
     * Parses all claims from a token using the secret key.
     *
     * @param token JWT token
     * @return Claims object containing all data
     */
    private Claims extractAllClaims(String token) {
        return Jwts
                .parser()
                .verifyWith(getSecretKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    /**
     * Converts the secret key from Base64 to a SecretKey object.
     *
     * @return SecretKey used for signing and verifying tokens
     */
    private SecretKey getSecretKey() {
        byte[] encodedKey = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(encodedKey);
    }
}
