package com.GraduationProject.GraduationProject.Security;

import com.GraduationProject.GraduationProject.Entity.Users;
import org.jspecify.annotations.Nullable;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

/**
 * UserPrinciple class implements Spring Security's UserDetails interface.
 *
 * This class adapts the application's Users entity to a format compatible
 * with Spring Security. It provides authentication and authorization information
 * about the currently authenticated user.
 */
public class UserPrinciple implements UserDetails {

    private final Users users;

    /**
     * Constructor to create a UserPrinciple from a Users entity.
     *
     * @param users the Users entity representing the authenticated user
     */
    public UserPrinciple(Users users) {
        this.users = users;
    }

    /**
     * Returns the ID of the user.
     *
     * @return user ID
     */
    public Long getId() {
        return users.getId();
    }

    /**
     * Returns the authorities granted to the user.
     *
     * Authority format: ROLE_{role}
     *
     * @return collection of GrantedAuthority
     */
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(() -> "ROLE_" + users.getRole());
    }

    /**
     * Returns the password used to authenticate the user.
     *
     * @return hashed password
     */
    @Override
    public @Nullable String getPassword() {
        return users.getPasswordHash();
    }

    /**
     * Returns the username used to authenticate the user.
     *
     * In this application, the email serves as the username.
     *
     * @return email of the user
     */
    @Override
    public String getUsername() {
        return users.getEmail();
    }

    /**
     * Indicates whether the user's account has expired.
     *
     * @return true if the account is non-expired
     */
    @Override
    public boolean isAccountNonExpired() {
        return UserDetails.super.isAccountNonExpired();
    }

    /**
     * Indicates whether the user's account is locked.
     *
     * @return true if the account is non-locked
     */
    @Override
    public boolean isAccountNonLocked() {
        return UserDetails.super.isAccountNonLocked();
    }

    /**
     * Indicates whether the user's credentials (password) have expired.
     *
     * @return true if the credentials are non-expired
     */
    @Override
    public boolean isCredentialsNonExpired() {
        return UserDetails.super.isCredentialsNonExpired();
    }

    /**
     * Indicates whether the user is enabled or disabled.
     *
     * @return true if the user is enabled
     */
    @Override
    public boolean isEnabled() {
        return UserDetails.super.isEnabled();
    }
}
