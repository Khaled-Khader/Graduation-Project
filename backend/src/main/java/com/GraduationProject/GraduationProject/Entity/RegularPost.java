package com.GraduationProject.GraduationProject.Entity;


import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "regular_posts")
@DiscriminatorValue("REGULAR")
@NoArgsConstructor
public class RegularPost extends Post {

    @Getter
    @Setter
    @OneToMany(
            mappedBy = "post",
            cascade = CascadeType.ALL,
            orphanRemoval = true,
            fetch = FetchType.LAZY
    )
    private List<Comment> comments = new ArrayList<>();

//    public RegularPost(Users user, String content, String imageUrl) {
//        this.setUser(user);
//        this.setContent(content);
//        this.setImageUrl(imageUrl);\
//    }no need

    public void addComment(Comment comment){
        this.comments.add(comment);
        comment.setPost(this);
    }

    public void removeComment(Comment comment) {
        comments.remove(comment);
        comment.setPost(null);
    }
}
