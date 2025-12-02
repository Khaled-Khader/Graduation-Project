package com.GraduationProject.GraduationProject.Entity;


import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@NoArgsConstructor
@Entity
@Table(name = "vet")
public class Vet {

    @Id
    @Column(name = "user_id")
    private Long id;


    @OneToOne
    @MapsId
    @JoinColumn(name = "user_id")
    private Users users;

    @Column(name = "specialty")
    private String specialty;


    public Vet(String specialty) {
        this.specialty = specialty;
    }


}
