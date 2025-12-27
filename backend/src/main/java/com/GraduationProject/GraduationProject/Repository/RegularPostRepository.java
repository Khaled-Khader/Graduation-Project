package com.GraduationProject.GraduationProject.Repository;

import com.GraduationProject.GraduationProject.Entity.RegularPost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RegularPostRepository extends JpaRepository<RegularPost,Long> {
}
