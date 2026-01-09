package com.GraduationProject.GraduationProject.Entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "posts")
@Inheritance(strategy = InheritanceType.JOINED)
@DiscriminatorColumn(name = "post_type")
public abstract class Post {

    @Id
    @Getter
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Setter
    @Getter
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id",nullable = false)
    private Users user;

    // @Getter
//
//    @Enumerated(EnumType.STRING)
//    @Column(name = "post_type",insertable = false, updatable = false,nullable = false)
//    protected EnumPostType postType;
//no need
    @Getter
    @Setter
    @Column(columnDefinition = "TEXT" ,name = "content")
    private String content;

    @Getter
    @Setter
    @Column(name = "image_url")
    private String imageUrl;


    @Getter
    @Column(name = "created_at" ,updatable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;


}
