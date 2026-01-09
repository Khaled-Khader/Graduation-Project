package com.GraduationProject.GraduationProject.Service;

import com.GraduationProject.GraduationProject.DTO.PetDTO;
import com.GraduationProject.GraduationProject.DTO.post.AdoptionPostDTO;
import com.GraduationProject.GraduationProject.DTO.post.CreatePostDTO;
import com.GraduationProject.GraduationProject.DTO.post.RegularPostDTO;
import com.GraduationProject.GraduationProject.Entity.*;
import com.GraduationProject.GraduationProject.Factory.PostFactory;
import com.GraduationProject.GraduationProject.Mapper.PostMapper;
import com.GraduationProject.GraduationProject.Repository.*;
import com.GraduationProject.GraduationProject.Security.UserPrinciple;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
public class PostService {

    private final PostRepository postRepository;
    private final RegularPostRepository regularPostRepository;
    private final AdoptionPostRepository adoptionPostRepository;
    private final UsersRepository usersRepository;
    private final PetRepository petRepository;

    public PostService(
            PostRepository postRepository,
            UsersRepository usersRepository,
            PetRepository petRepository,
            RegularPostRepository regularPostRepository,
            AdoptionPostRepository adoptionPostRepository
    ) {
        this.postRepository = postRepository;
        this.usersRepository = usersRepository;
        this.petRepository = petRepository;
        this.regularPostRepository = regularPostRepository;
        this.adoptionPostRepository = adoptionPostRepository;
    }

    // ---------- CREATE REGULAR POST ----------
    public RegularPostDTO createRegularPost(
            CreatePostDTO dto
    ) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserPrinciple userPrinciple = (UserPrinciple) authentication.getPrincipal();

        Users user = usersRepository.findById(userPrinciple.getId()).orElseThrow(
                () -> new EntityNotFoundException("User with id " + userPrinciple.getId() + " not found")
        );

        RegularPost post =
                PostFactory.createRegularPost(dto, user);

        return PostMapper.toRegularPostDTO(
                postRepository.save(post)
        );
    }

    // ---------- CREATE ADOPTION POST ----------
    public AdoptionPostDTO createAdoptionPost(
            CreatePostDTO dto
    ) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserPrinciple userPrinciple = (UserPrinciple) authentication.getPrincipal();

        Users user = usersRepository.findById(userPrinciple.getId())
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        Pet pet = petRepository.findById(dto.getPetId())
                .orElseThrow(() -> new EntityNotFoundException("Pet not found"));

        if(postRepository.findAdoptionPostByPetId(pet.getId())!=null) {
            throw new RuntimeException("Adoption post already exists");
        }

        // 🔐 Ownership check
        if (!pet.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("You do not own this pet");
        }

        AdoptionPost post =
                PostFactory.createAdoptionPost(dto, user, pet);

        postRepository.save(post);
        return PostMapper.toAdoptionPostDTO(post);
    }

    // ---------- FEED + PAGINATION ----------

        public Page<RegularPostDTO> getRegularPosts(Pageable pageable) {
           return regularPostRepository.findRegularPost(pageable)
                   .map(postMapper -> PostMapper.toRegularPostDTO(postMapper));
        }

        public Page<AdoptionPostDTO> getAdoptionPosts(Pageable pageable) {
               return adoptionPostRepository.findAdoptionPost(pageable)
                       .map(postMapper ->PostMapper.toAdoptionPostDTO(postMapper));
        }

        public List<AdoptionPostDTO> getAdoptionPostsByUserId() {
            List<AdoptionPostDTO> adoptionPostDTOs = new ArrayList<>();

            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            UserPrinciple userPrinciple = (UserPrinciple) authentication.getPrincipal();

            Users user = usersRepository.findById(userPrinciple.getId()).orElseThrow(
                    () -> new EntityNotFoundException("User with id " + userPrinciple.getId() + " not found")
            );

            for(AdoptionPost adoptionPost:adoptionPostRepository.findPostsByUserId(user.getId())) {
                adoptionPostDTOs.add(PostMapper.toAdoptionPostDTO(adoptionPost));
            }
            return adoptionPostDTOs;
        }

}
