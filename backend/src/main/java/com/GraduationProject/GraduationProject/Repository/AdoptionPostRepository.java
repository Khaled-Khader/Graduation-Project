package com.GraduationProject.GraduationProject.Repository;

import com.GraduationProject.GraduationProject.Entity.AdoptionPost;
import com.GraduationProject.GraduationProject.Entity.RegularPost;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AdoptionPostRepository
        extends JpaRepository<AdoptionPost, Long> {

    @Query("""
            select p 
            from AdoptionPost p
            order by p.createdAt desc
            """)
    Page<AdoptionPost> findAdoptionPost(Pageable pageable);

    List<AdoptionPost> findPostsByUserId(Long userId);
    AdoptionPost findAdoptionPostByPetId(Long id);
}

