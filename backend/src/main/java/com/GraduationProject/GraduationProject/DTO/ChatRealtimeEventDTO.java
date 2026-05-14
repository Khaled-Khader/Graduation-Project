package com.GraduationProject.GraduationProject.DTO;

public record ChatRealtimeEventDTO(
        String type,
        Long chatId,
        ChatDTO chat,
        MessageDTO message,
        Long unreadCount
) {
}
