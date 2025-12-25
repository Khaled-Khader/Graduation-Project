package com.GraduationProject.GraduationProject.Entity;


import jakarta.persistence.*;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@Entity
@Table(name = "pet")
public class Pet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "name")
    private String name;

    @Column(name = "species")
    private String species;

    @Column(name = "age_years")
    private Double age;

    @Column(name = "photo_url")
    private String photoUrl;

    @Column(name = "health_status")
    private String healthStatus;

    @Column(name = "has_vaccine_cert")
    private boolean hasVaccineCert;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id")
    private Users user;

    public Pet(String name,
               String species,
               Double age,
               String photoUrl,
               String healthStatus,
               boolean hasVaccineCert) {
        this.name = name;
        this.species = species;
        this.age = age;
        this.photoUrl = photoUrl;
        this.healthStatus = healthStatus;
        this.hasVaccineCert = hasVaccineCert;
    }
}
