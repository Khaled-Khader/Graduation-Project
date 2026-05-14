package com.GraduationProject.GraduationProject.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateNotificationDTO {

    private Long userId;
    private String type;
    private String title;
    private String message;
    private Long relatedId;
    private String relatedEntityType;
}
