package com.GraduationProject.GraduationProject.Entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@NoArgsConstructor
@Data
@Table(name = "service")
public class Service {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY ,optional = false)
    @JoinColumn(name = "user_id",nullable = false)
    private Users user;

    @Column(name = "name")
    private String name;

    @Column(columnDefinition = "TEXT",name = "description")
    private String description;

    public Service(Users user, String name, String description) {
        this.user = user;
        this.name = name;
        this.description = description;
    }

}
