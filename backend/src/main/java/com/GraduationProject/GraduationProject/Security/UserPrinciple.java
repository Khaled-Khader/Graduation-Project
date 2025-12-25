package com.GraduationProject.GraduationProject.Security;

import com.GraduationProject.GraduationProject.Entity.Users;
import org.jspecify.annotations.Nullable;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

public class UserPrinciple implements UserDetails {
    private Users users;

    public UserPrinciple(Users users){
        this.users = users;
    }

    public Long getId() {
        return users.getId();
    }


    public Collection<? extends GrantedAuthority> getAuthorities() {
         return List.of(() -> "ROLE_" + users.getRole());
    }

    @Override
    public @Nullable String getPassword() {
        return users.getPasswordHash();
    }

    @Override
    public String getUsername() {
        return users.getEmail();
    }

    @Override
    public boolean isAccountNonExpired() {
        return UserDetails.super.isAccountNonExpired();
    }

    @Override
    public boolean isAccountNonLocked() {
        return UserDetails.super.isAccountNonLocked();
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return UserDetails.super.isCredentialsNonExpired();
    }

    @Override
    public boolean isEnabled() {
        return UserDetails.super.isEnabled();
    }
}
