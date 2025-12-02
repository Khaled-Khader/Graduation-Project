package com.GraduationProject.GraduationProject.Entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@NoArgsConstructor
@Entity
@Table(name = "clinic")
public class Clinic {

    @Id
    @Column(name = "user_id")
    private Long id;


    @OneToOne
    @MapsId
    @JoinColumn(name = "user_id")
    private Users users;

    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    @Column(name = "city")
    private String city;

    @Column(name = "address")
    private String address;


    public Clinic(String city, String address, Double latitude, Double longitude) {
        this.city = city;
        this.address = address;
        this.latitude = latitude;
        this.longitude = longitude;
    }

}
