package com.GraduationProject.GraduationProject.Controller;

import com.GraduationProject.GraduationProject.DTO.ImageUploadResponseDTO;
import com.GraduationProject.GraduationProject.Service.CloudinaryService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/images")
public class ImageUploadController {

    private final CloudinaryService cloudinaryService;

    public ImageUploadController(CloudinaryService cloudinaryService) {
        this.cloudinaryService = cloudinaryService;
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ImageUploadResponseDTO uploadImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "folder", defaultValue = "petnexus/uploads") String folder
    ) {
        return new ImageUploadResponseDTO(cloudinaryService.uploadImage(file, folder));
    }
}
