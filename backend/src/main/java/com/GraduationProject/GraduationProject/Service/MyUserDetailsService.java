package com.GraduationProject.GraduationProject.Service;

import com.GraduationProject.GraduationProject.Entity.Users;
import com.GraduationProject.GraduationProject.Repository.UsersRepository;
import com.GraduationProject.GraduationProject.Security.UserPrinciple;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

/**
 * Custom UserDetailsService for Spring Security.
 *
 * This service is responsible for loading user details from the database
 * during authentication, based on the provided username (email).
 */
@Service
public class MyUserDetailsService implements UserDetailsService {

    private final UsersRepository usersRepository;

    public MyUserDetailsService(UsersRepository usersRepository) {
        this.usersRepository = usersRepository;
    }


    /**
     * Loads a user from the database using their email.
     *
     * This method is used by Spring Security during authentication to
     * retrieve user details including password and roles.
     *
     * @param username The email of the user (used as username)
     * @return UserDetails object containing user info for Spring Security
     * @throws UsernameNotFoundException if no user is found with the given email
     */
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {


        Users user = usersRepository.findByEmail(username);


        if (user == null) {
            throw new UsernameNotFoundException("User not found with email: " + username);
        }


        return new UserPrinciple(user);
    }
}
