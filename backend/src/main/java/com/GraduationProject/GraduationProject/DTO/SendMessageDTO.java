package com.GraduationProject.GraduationProject.DTO;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SendMessageDTO {

    @NotNull(message = "Chat id is required")
    private Long chatId;

    @Size(max = 10000, message = "Message content is too long")
    private String content;

    @Size(max = 500, message = "Image URL is too long")
    private String imageUrl;

    public SendMessageDTO(Long chatId, String content) {
        this.chatId = chatId;
        this.content = content;
    }

}
