package com.GraduationProject.GraduationProject.DTO;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StartChatDTO {

    @NotNull(message = "Provider id is required")
    private Long providerId; // VET or CLINIC ID

}
