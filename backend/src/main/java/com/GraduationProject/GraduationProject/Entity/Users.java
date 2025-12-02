package com.GraduationProject.GraduationProject.Entity;

import com.GraduationProject.GraduationProject.Enum.EnumRole;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@NoArgsConstructor
@Entity
@Table(name="users")
public class Users {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "email",unique = true )
    private String email;

    @Column(name = "password_hash")
    private String passwordHash;


    @Enumerated(EnumType.STRING)
    @Column(name = "role")
    private EnumRole role;

    @OneToOne(mappedBy = "users", cascade = CascadeType.ALL, orphanRemoval = true)
    private UserInfo userInfo;

    @OneToOne(mappedBy = "users", cascade = CascadeType.ALL, orphanRemoval = true)
    private Vet vet;

    @OneToOne(mappedBy = "users", cascade = CascadeType.ALL, orphanRemoval = true)
    private Clinic clinic;

    // only if you have pet owner
    @OneToOne(mappedBy = "users", cascade = CascadeType.ALL, orphanRemoval = true)
    private Owner owner;


    public Users( String email, String passwordHash, EnumRole role) {
        this.email = email;
        this.passwordHash = passwordHash;
        this.role = role;
    }

}
