package com.GraduationProject.GraduationProject.Service;

import com.GraduationProject.GraduationProject.DTO.ClinicMapResponseDTO;
import com.GraduationProject.GraduationProject.Entity.Clinic;
import com.GraduationProject.GraduationProject.Exception.ClinicNotFoundException;
import com.GraduationProject.GraduationProject.Repository.ClinicRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ClinicService {

    private final ClinicRepository clinicRepository;

    public ClinicService(ClinicRepository clinicRepository) {
        this.clinicRepository = clinicRepository;
    }


    public void updateLocation(Long clinicId, Double lat, Double lng) {
        Clinic clinic = clinicRepository.findById(clinicId)
                .orElseThrow(() -> new ClinicNotFoundException("The clinic does not exist"));
        clinic.setLatitude(lat);
        clinic.setLongitude(lng);
        clinicRepository.save(clinic);
    }

    public List<ClinicMapResponseDTO> getNearbyClinics(Double lat, Double lng, Double radiusInKm) {
        List<Clinic> clinics = clinicRepository.findNearbyClinics(lat, lng, radiusInKm);

        return clinics.stream().map(clinic -> {
            String clinicName = "Veterinary clinic";


            if (clinic.getUsers() != null && clinic.getUsers().getUserInfo() != null) {
                String fName = clinic.getUsers().getUserInfo().getFirstName();
                String lName = clinic.getUsers().getUserInfo().getLastName();


                clinicName = (fName != null ? fName : "") + " " + (lName != null ? lName : "");
                clinicName = clinicName.trim();

                if (clinicName.isEmpty()) {
                    clinicName = "Veterinary clinic";
                }
            }

            return new ClinicMapResponseDTO(
                    clinic.getId(),
                    clinicName,
                    clinic.getLatitude(),
                    clinic.getLongitude(),
                    clinic.getAddress()
            );
        }).collect(Collectors.toList());
    }
}