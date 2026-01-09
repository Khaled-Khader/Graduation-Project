package com.GraduationProject.GraduationProject.Entity;

import com.GraduationProject.GraduationProject.Enum.AdoptionStatus;
import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;
@Entity
@Data
@Getter

@Setter

@Table(name = "adoption_posts")
@DiscriminatorValue("ADOPTION")
public class AdoptionPost extends Post {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pet_id", nullable = false)
    private Pet pet;

    @Column(name = "city", nullable = false)
    private String city;

    @Enumerated(EnumType.STRING)
    @Column(name = "adoption_status", nullable = false)
    private AdoptionStatus adoptionStatus = AdoptionStatus.OPEN;

    @OneToMany(
            mappedBy = "adoptionPost",
            cascade = CascadeType.ALL,
            orphanRemoval = true,
            fetch = FetchType.LAZY
    )
    private List<AdoptionRequest> requests = new ArrayList<>();

    // helper methods (Best Practice)
    public void addRequest(AdoptionRequest request) {
        requests.add(request);
        request.setAdoptionPost(this);
    }

    public void removeRequest(AdoptionRequest request) {
        requests.remove(request);
        request.setAdoptionPost(null);
    }
}
