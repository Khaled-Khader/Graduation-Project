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

    @Query("""
        select p from Post p
        order by p.createdAt asc
    """)
    Page<Post> findAllPostsOldest(Pageable pageable);

    @Query(
            value = """
                select p from Post p
                left join Comment c on c.post = p
                group by p
                order by count(c.id) desc, p.createdAt desc
            """,
            countQuery = """
                select count(p) from Post p
            """
    )
    Page<Post> findAllPostsMostCommented(Pageable pageable);



    AdoptionPost findAdoptionPostByPetId(Long id);
}
