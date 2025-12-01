package com.GraduationProject.GraduationProject.Entity;

import com.GraduationProject.GraduationProject.Enum.EnumRole;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.antlr.v4.runtime.misc.NotNull;

@Data
@NoArgsConstructor
@RequiredArgsConstructor
@Entity
@Table(name="users")
public class Users {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "email",unique = true )
    @NotNull
    private String email;

    @NonNull
    @Column(name = "password")
    private String password;

    @NonNull
    @Enumerated(EnumType.STRING)
    @Column(name = "role")
    private EnumRole role;

}
