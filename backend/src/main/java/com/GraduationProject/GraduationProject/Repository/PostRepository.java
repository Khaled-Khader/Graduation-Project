package com.GraduationProject.GraduationProject.Repository;

import com.GraduationProject.GraduationProject.Entity.AdoptionPost;
import com.GraduationProject.GraduationProject.Entity.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post,Long> {


    @Query("""
        select p from Post p
        order by p.createdAt desc
    """)
    Page<Post> findAllPosts(Pageable pageable);



    AdoptionPost findAdoptionPostByPetId(Long id);
}
