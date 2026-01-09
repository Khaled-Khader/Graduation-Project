package com.GraduationProject.GraduationProject.Service;

import com.GraduationProject.GraduationProject.Repository.RegularPostRepository;
import com.GraduationProject.GraduationProject.Repository.UsersRepository;
import org.springframework.stereotype.Service;

@Service
public class RegularPostService {

    private final RegularPostRepository regularPostRepository;
    private final UsersRepository usersRepository;

    public RegularPostService(RegularPostRepository regularPostRepository,
                              UsersRepository usersRepository) {
        this.regularPostRepository = regularPostRepository;
        this.usersRepository = usersRepository;
    }

}
