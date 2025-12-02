package com.GraduationProject.GraduationProject.Repository;

import com.GraduationProject.GraduationProject.DTO.UserInfoDTO;
import com.GraduationProject.GraduationProject.Entity.UserInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserInfoRepository extends JpaRepository<UserInfo, Long> {
}
