package com.GraduationProject.GraduationProject.Service;

import com.GraduationProject.GraduationProject.DTO.*;
import com.GraduationProject.GraduationProject.Entity.*;
import com.GraduationProject.GraduationProject.Enum.EnumRole;
import com.GraduationProject.GraduationProject.Enum.NotificationType;
import com.GraduationProject.GraduationProject.Repository.ChatRepository;
import com.GraduationProject.GraduationProject.Repository.MessageRepository;
import com.GraduationProject.GraduationProject.Repository.UsersRepository;
import com.GraduationProject.GraduationProject.Security.UserPrinciple;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
@Slf4j
public class ChatService {

    private final ChatRepository chatRepository;
    private final MessageRepository messageRepository;
    private final UsersRepository usersRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final NotificationService notificationService;
    private final CloudinaryService cloudinaryService;

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE_TIME;
    private static final String E2EE_MESSAGE_PREFIX = "e2ee:v1:";

    public ChatService(ChatRepository chatRepository,
            MessageRepository messageRepository,
            UsersRepository usersRepository,
            SimpMessagingTemplate messagingTemplate,
            NotificationService notificationService,
            CloudinaryService cloudinaryService) {
        this.chatRepository = chatRepository;
        this.messageRepository = messageRepository;
        this.usersRepository = usersRepository;
        this.messagingTemplate = messagingTemplate;
        this.notificationService = notificationService;
        this.cloudinaryService = cloudinaryService;
    }

    public ChatDTO startChat(StartChatDTO dto) {
        Users currentUser = getCurrentUser();

        if (!currentUser.getRole().equals(EnumRole.OWNER)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only pet owners can start chats");
        }

        Users provider = usersRepository.findById(dto.getProviderId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Provider not found"));

        if (!provider.getRole().equals(EnumRole.VET) && !provider.getRole().equals(EnumRole.CLINIC)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Can only chat with veterinarians or clinics");
        }

        if (Objects.equals(currentUser.getId(), provider.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You cannot start a chat with yourself");
        }

        Optional<Chat> existingChat = chatRepository.findChatBetween(currentUser, provider);
        if (existingChat.isPresent()) {
            return convertToDTO(existingChat.get());
        }

        Chat chat = new Chat();
        chat.setOwner(currentUser);
        chat.setProvider(provider);
        LocalDateTime now = LocalDateTime.now();
        chat.setCreatedAt(now);
        chat.setLastMessageAt(now);
        chat.setIsActive(true);

        Chat savedChat = chatRepository.save(chat);
        ChatDTO chatDTO = convertToDTO(savedChat);
        broadcastChatEvent("CHAT_STARTED", savedChat, chatDTO, null);
        return chatDTO;
    }

    public MessageDTO sendMessage(SendMessageDTO dto) {
        Users currentUser = getCurrentUser();

        Chat chat = chatRepository.findById(dto.getChatId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Chat not found"));

        if (!isUserInChat(chat, currentUser)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not part of this chat");
        }

        if (!Boolean.TRUE.equals(chat.getIsActive())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "This chat is closed");
        }

        if (currentUser.getRole().equals(EnumRole.VET) || currentUser.getRole().equals(EnumRole.CLINIC)) {
            if (!Objects.equals(currentUser.getId(), chat.getProvider().getId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Provider mismatch");
            }
        }

        String content = normalize(dto.getContent());
        String imageUrl = normalize(dto.getImageUrl());
        boolean hasText = content != null;
        boolean hasImage = imageUrl != null;

        if (!hasText && !hasImage) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Message content or image is required");
        }

        if (hasText && !isEncryptedClientMessage(content)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Messages must be encrypted before being sent");
        }

        if (hasImage && !isValidImageUrl(imageUrl)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid image URL");
        }

        LocalDateTime now = LocalDateTime.now();

        Message message = new Message();
        message.setChat(chat);
        message.setSender(currentUser);
        message.setContent(content);
        message.setImageUrl(imageUrl);
        message.setCreatedAt(now);
        message.setIsRead(false);

        Message savedMessage = messageRepository.save(message);

        chat.setLastMessageAt(now);
        chatRepository.save(chat);

        MessageDTO messageDTO = convertMessageToDTO(savedMessage);
        ChatDTO chatDTO = convertToDTO(chat);
        broadcastChatEvent("MESSAGE", chat, chatDTO, messageDTO);
        notifyMessageRecipient(chat, currentUser);

        return messageDTO;
    }

    public ChatImageUploadResponseDTO uploadChatImage(Long chatId, MultipartFile file) {
        Users currentUser = getCurrentUser();
        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Chat not found"));

        if (!isUserInChat(chat, currentUser)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not part of this chat");
        }

        if (!Boolean.TRUE.equals(chat.getIsActive())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "This chat is closed");
        }

        return new ChatImageUploadResponseDTO(cloudinaryService.uploadChatImage(file));
    }

    public Page<ChatDTO> getUserChats(Pageable pageable) {
        Users currentUser = getCurrentUser();
        Page<Chat> chats = chatRepository.findUserChats(currentUser, pageable);
        return chats.map(this::convertToDTO);
    }

    public ChatDTO getChat(Long chatId, Pageable pageable) {
        Users currentUser = getCurrentUser();

        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Chat not found"));

        if (!isUserInChat(chat, currentUser)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not part of this chat");
        }

        markChatMessagesAsRead(chatId, currentUser);
        return convertToDTOWithMessages(chat, pageable);
    }

    public Page<MessageDTO> getChatMessages(Long chatId, Pageable pageable) {
        Users currentUser = getCurrentUser();

        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Chat not found"));

        if (!isUserInChat(chat, currentUser)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not part of this chat");
        }

        markChatMessagesAsRead(chatId, currentUser);
        Page<Message> messages = messageRepository.findByChatIdOrderByCreatedAtAsc(chatId, pageable);

        return messages.map(this::convertMessageToDTO);
    }

    public Long getTotalUnreadMessageCount() {
        Users currentUser = getCurrentUser();
        return messageRepository.countUnreadMessagesForUser(currentUser);
    }

    public Long getUnreadMessageCount(Long chatId) {
        Users currentUser = getCurrentUser();
        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Chat not found"));

        if (!isUserInChat(chat, currentUser)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not part of this chat");
        }

        return messageRepository.countByChat_IdAndIsReadFalseAndSender_IdNot(chatId, currentUser.getId());
    }

    public void closeChat(Long chatId) {
        Users currentUser = getCurrentUser();

        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Chat not found"));

        if (!isUserInChat(chat, currentUser)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not part of this chat");
        }

        chat.setIsActive(false);
        chatRepository.save(chat);
    }

    private Users getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UserPrinciple userPrinciple)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication is required");
        }

        Long userId = userPrinciple.getId();
        return usersRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    private boolean isUserInChat(Chat chat, Users user) {
        return Objects.equals(chat.getOwner().getId(), user.getId())
                || Objects.equals(chat.getProvider().getId(), user.getId());
    }

    private void markChatMessagesAsRead(Long chatId, Users currentUser) {
        int updatedRows = messageRepository.markChatMessagesAsRead(chatId, currentUser.getId(), LocalDateTime.now());
        if (updatedRows > 0) {
            Long unreadCount = messageRepository.countUnreadMessagesForUser(currentUser);
            ChatRealtimeEventDTO event = new ChatRealtimeEventDTO(
                    "READ",
                    chatId,
                    null,
                    null,
                    unreadCount
            );
            sendToUser(currentUser, event);
        }
    }

    private void broadcastChatEvent(String type, Chat chat, ChatDTO chatDTO, MessageDTO messageDTO) {
        sendToUser(chat.getOwner(), new ChatRealtimeEventDTO(
                type,
                chat.getId(),
                chatDTO,
                messageDTO,
                messageRepository.countUnreadMessagesForUser(chat.getOwner())
        ));

        sendToUser(chat.getProvider(), new ChatRealtimeEventDTO(
                type,
                chat.getId(),
                chatDTO,
                messageDTO,
                messageRepository.countUnreadMessagesForUser(chat.getProvider())
        ));
    }

    private void sendToUser(Users user, ChatRealtimeEventDTO event) {
        messagingTemplate.convertAndSend("/topic/users/" + user.getId() + "/chats", event);
    }

    private void notifyMessageRecipient(Chat chat, Users sender) {
        Users recipient = Objects.equals(sender.getId(), chat.getOwner().getId())
                ? chat.getProvider()
                : chat.getOwner();

        try {
            String displayName = getDisplayName(sender);
            notificationService.createNotification(new CreateNotificationDTO(
                    recipient.getId(),
                    NotificationType.NEW_MESSAGE.name(),
                    "💬 رسالة جديدة من " + displayName,
                    "أرسل لك: رسالة خاصة جديدة",
                    chat.getId(),
                    Notification.RelatedEntityType.CHAT.name()
            ));
        } catch (Exception e) {
            log.warn("Failed to create chat notification for user {}: {}", recipient.getId(), e.getMessage());
        }
    }

    private boolean isEncryptedClientMessage(String content) {
        if (content == null || !content.startsWith(E2EE_MESSAGE_PREFIX)) {
            return false;
        }

        String[] parts = content.split(":");
        return parts.length == 4
                && !parts[2].isBlank()
                && !parts[3].isBlank();
    }

    private ChatDTO convertToDTO(Chat chat) {
        Users provider = chat.getProvider();
        Users owner = chat.getOwner();

        String providerName = getDisplayName(provider);
        String providerImage = getUserProfilePhoto(provider);
        String ownerName = getDisplayName(owner);
        String ownerImage = getUserProfilePhoto(owner);

        ChatDTO dto = new ChatDTO();
        dto.setId(chat.getId());
        dto.setOwnerId(owner.getId());
        dto.setOwnerName(ownerName);
        dto.setOwnerProfileImage(ownerImage);
        dto.setProviderId(provider.getId());
        dto.setProviderName(providerName);
        dto.setProviderProfileImage(providerImage);
        dto.setProviderRole(provider.getRole().toString());
        dto.setCreatedAt(chat.getCreatedAt().format(FORMATTER));
        dto.setLastMessageAt(chat.getLastMessageAt() != null ? chat.getLastMessageAt().format(FORMATTER) : null);
        dto.setIsActive(chat.getIsActive());

        return dto;
    }

    private ChatDTO convertToDTOWithMessages(Chat chat, Pageable pageable) {
        ChatDTO dto = convertToDTO(chat);

        Page<Message> messages = messageRepository.findByChatIdOrderByCreatedAtAsc(chat.getId(), pageable);
        List<MessageDTO> messageDTOs = messages.getContent()
                .stream()
                .map(this::convertMessageToDTO)
                .collect(Collectors.toList());

        dto.setMessages(messageDTOs);
        return dto;
    }

    private MessageDTO convertMessageToDTO(Message message) {
        Users sender = message.getSender();
        String senderName = getDisplayName(sender);
        String senderImage = getUserProfilePhoto(sender);

        MessageDTO dto = new MessageDTO();
        dto.setId(message.getId());
        dto.setSenderId(sender.getId());
        dto.setSenderName(senderName);
        dto.setSenderProfileImage(senderImage);
        dto.setContent(message.getContent());
        dto.setImageUrl(message.getImageUrl());
        dto.setCreatedAt(message.getCreatedAt().format(FORMATTER));
        dto.setIsRead(message.getIsRead());

        return dto;
    }

    private String normalize(String value) {
        if (value == null || value.trim().isBlank()) {
            return null;
        }

        return value.trim();
    }

    private boolean isValidImageUrl(String imageUrl) {
        return cloudinaryService.isManagedImageUrl(imageUrl);
    }

    private String getDisplayName(Users user) {
        if (user.getUserInfo() != null) {
            String firstName = user.getUserInfo().getFirstName() != null ? user.getUserInfo().getFirstName() : "";
            String lastName = user.getUserInfo().getLastName() != null ? user.getUserInfo().getLastName() : "";
            return (firstName + " " + lastName).trim();
        }
        return "Unknown";
    }

    private String getUserProfilePhoto(Users user) {
        if (user.getUserInfo() != null) {
            return user.getUserInfo().getPhotoUrl();
        }
        return null;
    }

}
