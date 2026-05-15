package com.GraduationProject.GraduationProject.Repository;

import com.GraduationProject.GraduationProject.DTO.post.RegularPostDTO;
import com.GraduationProject.GraduationProject.Entity.AdoptionPost;
import com.GraduationProject.GraduationProject.Entity.Comment;
import com.GraduationProject.GraduationProject.Entity.RegularPost;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface RegularPostRepository
        extends JpaRepository<RegularPost, Long> {
    Page<Comment> findByIdOrderByCreatedAtAsc(
            Long  Id,
            Pageable pageable
    );

            @Query("""
            select p 
            from RegularPost p
            order by p.createdAt desc
            """)
            Page<RegularPost> findRegularPost(Pageable pageable);

            @Query("""
            select p 
            from RegularPost p
            order by p.createdAt asc
            """)
            Page<RegularPost> findRegularPostOldest(Pageable pageable);

            @Query(
                    value = """
                    select p
                    from RegularPost p
                    left join p.comments c
                    group by p
                    order by count(c.id) desc, p.createdAt desc
                    """,
                    countQuery = """
                    select count(p)
                    from RegularPost p
                    """
            )
            Page<RegularPost> findRegularPostMostCommented(Pageable pageable);

}
