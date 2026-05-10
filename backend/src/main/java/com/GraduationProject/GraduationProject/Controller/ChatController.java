package com.GraduationProject.GraduationProject.Controller;

import com.GraduationProject.GraduationProject.DTO.*;
import com.GraduationProject.GraduationProject.Service.ChatService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;

/**
 * Controller for managing private chats between pet owners and providers
 * (vets/clinics)
 *
 * Responsibilities: - Starting new chats (pet owners only) - Sending and
 * receiving messages - Retrieving chat history and conversations - Managing
 * chat status
 *
 * Security: - All endpoints require authentication - Messages are encrypted
 * end-to-end - Users can only access their own chats
 */
@RestController
@RequestMapping("/chat")
@CrossOrigin(origins = "*")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    /**
     * FR1: Start a new chat conversation Only pet owners can initiate chats
     * with vets or clinics
     *
     * @param dto StartChatDTO containing the provider ID
     * @return ChatDTO of the created or existing chat
     */
    @PostMapping("/start")
    public ChatDTO startChat(@Valid @RequestBody StartChatDTO dto) {
        return chatService.startChat(dto);
    }

    /**
     * Send a message in an existing chat Pet owners can always send messages
     * FR2: Providers can only reply to existing chats
     *
     * @param dto SendMessageDTO containing chat ID and message content
     * @return MessageDTO of the sent message
     */
    @PostMapping("/message/send")
    public MessageDTO sendMessage(@Valid @RequestBody SendMessageDTO dto) {
        return chatService.sendMessage(dto);
    }

    /**
     * Get all chats for the authenticated user Returns both chats where user is
     * owner and where user is provider
     *
     * @param pageable Pagination information
     * @return Page of ChatDTO objects
     */
    @GetMapping("/my-chats")
    public Page<ChatDTO> getUserChats(
            @PageableDefault(size = 10, page = 0) Pageable pageable) {
        return chatService.getUserChats(pageable);
    }

    @GetMapping("/unread-total")
    public Long getTotalUnreadCount() {
        return chatService.getTotalUnreadMessageCount();
    }

    /**
     * Get a specific chat with all messages User must be part of the chat
     *
     * @param chatId ID of the chat
     * @param pageable Pagination for messages
     * @return ChatDTO with messages
     */
    @GetMapping("/{chatId}")
    public ChatDTO getChat(
            @PathVariable Long chatId,
            @PageableDefault(size = 20, page = 0) Pageable pageable) {
        return chatService.getChat(chatId, pageable);
    }

    /**
     * Get messages from a specific chat
     *
     * @param chatId ID of the chat
     * @param pageable Pagination for messages
     * @return Page of MessageDTO objects
     */
    @GetMapping("/{chatId}/messages")
    public Page<MessageDTO> getChatMessages(
            @PathVariable Long chatId,
            @PageableDefault(size = 20, page = 0) Pageable pageable) {
        return chatService.getChatMessages(chatId, pageable);
    }

    /**
     * Get count of unread messages in a chat
     *
     * @param chatId ID of the chat
     * @return Number of unread messages
     */
    @GetMapping("/{chatId}/unread-count")
    public Long getUnreadCount(@PathVariable Long chatId) {
        return chatService.getUnreadMessageCount(chatId);
    }

    /**
     * Close a chat conversation User must be part of the chat
     *
     * @param chatId ID of the chat to close
     */
    @PutMapping("/{chatId}/close")
    public void closeChat(@PathVariable Long chatId) {
        chatService.closeChat(chatId);
    }

}
