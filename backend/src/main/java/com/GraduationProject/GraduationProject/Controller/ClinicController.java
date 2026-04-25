package com.GraduationProject.GraduationProject.Controller;

import com.GraduationProject.GraduationProject.DTO.ClinicLocationUpdateDTO;
import com.GraduationProject.GraduationProject.DTO.ClinicMapResponseDTO;
import com.GraduationProject.GraduationProject.Service.ClinicService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/clinics")
public class ClinicController {

    private final ClinicService clinicService;

    public ClinicController(ClinicService clinicService) {
        this.clinicService = clinicService;
    }

    @PutMapping("/{clinicId}/location")
    public ResponseEntity<String> updateLocation(@PathVariable Long clinicId, @RequestBody ClinicLocationUpdateDTO dto) {
        clinicService.updateLocation(clinicId, dto.latitude(), dto.longitude());
        return ResponseEntity.ok("Location updated successfully");
    }

    @GetMapping("/nearby")
    public ResponseEntity<List<ClinicMapResponseDTO>> getNearby(@RequestParam Double lat, @RequestParam Double lng, @RequestParam(defaultValue = "10.0") Double radius) {
        return ResponseEntity.ok(clinicService.getNearbyClinics(lat, lng, radius));
    }
}