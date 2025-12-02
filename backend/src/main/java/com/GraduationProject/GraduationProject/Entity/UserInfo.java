package com.GraduationProject.GraduationProject.Entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;



@Data
@NoArgsConstructor
@Entity
@Table(name = "user_profile")
public class UserInfo {

    @Id
    @Column(name="user_id")
    private Long id;

    @OneToOne
    @MapsId
    @JoinColumn(name = "user_id")
    private Users users;

    @Column(name = "first_name")
    private String firstName;

    @Column(name = "last_name")
    private String lastName;

    @Column(name ="photo_url")
    private String photoUrl;

    @Column(name = "bio")
    private String bio;

    public UserInfo(String firstName, String lastName, String photoUrl, String bio) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.photoUrl = photoUrl;
        this.bio = bio;
    }



}
