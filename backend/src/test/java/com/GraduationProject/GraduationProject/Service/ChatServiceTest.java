package com.GraduationProject.GraduationProject.Service;

import com.GraduationProject.GraduationProject.DTO.ChatDTO;
import com.GraduationProject.GraduationProject.DTO.ChatRealtimeEventDTO;
import com.GraduationProject.GraduationProject.DTO.MessageDTO;
import com.GraduationProject.GraduationProject.DTO.SendMessageDTO;
import com.GraduationProject.GraduationProject.DTO.StartChatDTO;
import com.GraduationProject.GraduationProject.Entity.Chat;
import com.GraduationProject.GraduationProject.Entity.Message;
import com.GraduationProject.GraduationProject.Entity.UserInfo;
import com.GraduationProject.GraduationProject.Entity.Users;
import com.GraduationProject.GraduationProject.Enum.EnumRole;
import com.GraduationProject.GraduationProject.Repository.ChatRepository;
import com.GraduationProject.GraduationProject.Repository.MessageRepository;
import com.GraduationProject.GraduationProject.Repository.UsersRepository;
import com.GraduationProject.GraduationProject.Security.UserPrinciple;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ChatServiceTest {

    private static final String ENCRYPTED_CONTENT = "e2ee:v1:abc:def";

    @Mock
    private ChatRepository chatRepository;

    @Mock
    private MessageRepository messageRepository;

    @Mock
    private UsersRepository usersRepository;

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @Mock
    private NotificationService notificationService;

    @Mock
    private Authentication authentication;

    @Mock
    private SecurityContext securityContext;

    @InjectMocks
    private ChatService chatService;

    private Users owner;
    private Users vet;
    private Users clinic;
    private Users otherOwner;

    @BeforeEach
    void setUp() {
        owner = user(1L, EnumRole.OWNER, "Omar", "Owner");
        vet = user(2L, EnumRole.VET, "Lina", "Vet");
        clinic = user(3L, EnumRole.CLINIC, "Pet", "Clinic");
        otherOwner = user(4L, EnumRole.OWNER, "Sara", "Owner");

        lenient().when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);
    }

    @Test
    void startChat_shouldCreateChat_whenOwnerStartsWithVet() {
        authenticateAs(owner);
        when(usersRepository.findById(vet.getId())).thenReturn(Optional.of(vet));
        when(chatRepository.findChatBetween(owner, vet)).thenReturn(Optional.empty());
        when(messageRepository.countUnreadMessagesForUser(any(Users.class))).thenReturn(0L);
        when(chatRepository.save(any(Chat.class))).thenAnswer(invocation -> {
            Chat chat = invocation.getArgument(0);
            chat.setId(10L);
            return chat;
        });

        ChatDTO result = chatService.startChat(new StartChatDTO(vet.getId()));

        assertEquals(10L, result.getId());
        assertEquals(owner.getId(), result.getOwnerId());
        assertEquals(vet.getId(), result.getProviderId());
        assertEquals("VET", result.getProviderRole());
        verify(chatRepository).save(any(Chat.class));
        verify(messagingTemplate, times(2))
                .convertAndSend(contains("/topic/users/"), any(ChatRealtimeEventDTO.class));
    }

    @Test
    void startChat_shouldReturnExistingChat_whenConversationAlreadyExists() {
        authenticateAs(owner);
        Chat existingChat = chat(20L, owner, clinic);

        when(usersRepository.findById(clinic.getId())).thenReturn(Optional.of(clinic));
        when(chatRepository.findChatBetween(owner, clinic)).thenReturn(Optional.of(existingChat));

        ChatDTO result = chatService.startChat(new StartChatDTO(clinic.getId()));

        assertEquals(20L, result.getId());
        assertEquals(clinic.getId(), result.getProviderId());
        verify(chatRepository, never()).save(any(Chat.class));
        verifyNoInteractions(messagingTemplate);
    }

    @Test
    void startChat_shouldRejectNonOwnerInitiation() {
        authenticateAs(vet);

        ResponseStatusException ex = assertThrows(
                ResponseStatusException.class,
                () -> chatService.startChat(new StartChatDTO(clinic.getId()))
        );

        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
        assertEquals("Only pet owners can start chats", ex.getReason());
        verify(chatRepository, never()).save(any(Chat.class));
    }

    @Test
    void startChat_shouldRejectOwnerToOwnerChat() {
        authenticateAs(owner);
        when(usersRepository.findById(otherOwner.getId())).thenReturn(Optional.of(otherOwner));

        ResponseStatusException ex = assertThrows(
                ResponseStatusException.class,
                () -> chatService.startChat(new StartChatDTO(otherOwner.getId()))
        );

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        assertEquals("Can only chat with veterinarians or clinics", ex.getReason());
        verify(chatRepository, never()).save(any(Chat.class));
    }

    @Test
    void sendMessage_shouldSaveEncryptedMessageAndBroadcast() {
        authenticateAs(owner);
        Chat chat = chat(30L, owner, vet);

        when(chatRepository.findById(chat.getId())).thenReturn(Optional.of(chat));
        when(messageRepository.countUnreadMessagesForUser(any(Users.class))).thenReturn(1L);
        when(messageRepository.save(any(Message.class))).thenAnswer(invocation -> {
            Message message = invocation.getArgument(0);
            message.setId(100L);
            return message;
        });

        MessageDTO result = chatService.sendMessage(
                new SendMessageDTO(chat.getId(), ENCRYPTED_CONTENT)
        );

        assertEquals(100L, result.getId());
        assertEquals(owner.getId(), result.getSenderId());
        assertEquals(ENCRYPTED_CONTENT, result.getContent());
        verify(messageRepository).save(any(Message.class));
        verify(chatRepository).save(chat);
        verify(messagingTemplate, times(2))
                .convertAndSend(contains("/topic/users/"), any(ChatRealtimeEventDTO.class));
    }

    @Test
    void sendMessage_shouldRejectPlainTextMessages() {
        authenticateAs(owner);
        Chat chat = chat(40L, owner, vet);
        when(chatRepository.findById(chat.getId())).thenReturn(Optional.of(chat));

        ResponseStatusException ex = assertThrows(
                ResponseStatusException.class,
                () -> chatService.sendMessage(new SendMessageDTO(chat.getId(), "hello"))
        );

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        assertEquals("Messages must be encrypted before being sent", ex.getReason());
        verify(messageRepository, never()).save(any(Message.class));
    }

    @Test
    void sendMessage_shouldRejectUserOutsideChat() {
        authenticateAs(otherOwner);
        Chat chat = chat(50L, owner, vet);
        when(chatRepository.findById(chat.getId())).thenReturn(Optional.of(chat));

        ResponseStatusException ex = assertThrows(
                ResponseStatusException.class,
                () -> chatService.sendMessage(new SendMessageDTO(chat.getId(), ENCRYPTED_CONTENT))
        );

        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
        assertEquals("You are not part of this chat", ex.getReason());
        verify(messageRepository, never()).save(any(Message.class));
    }

    @Test
    void getChat_shouldMarkMessagesAsReadAndReturnMessages() {
        authenticateAs(vet);
        Chat chat = chat(60L, owner, vet);
        Message message = message(200L, chat, owner, ENCRYPTED_CONTENT);

        when(chatRepository.findById(chat.getId())).thenReturn(Optional.of(chat));
        when(messageRepository.markChatMessagesAsRead(eq(chat.getId()), eq(vet.getId()), any(LocalDateTime.class)))
                .thenReturn(1);
        when(messageRepository.countUnreadMessagesForUser(vet)).thenReturn(0L);
        when(messageRepository.findByChatIdOrderByCreatedAtAsc(eq(chat.getId()), any()))
                .thenReturn(new PageImpl<>(List.of(message)));

        ChatDTO result = chatService.getChat(chat.getId(), PageRequest.of(0, 20));

        assertEquals(chat.getId(), result.getId());
        assertEquals(1, result.getMessages().size());
        assertEquals(ENCRYPTED_CONTENT, result.getMessages().get(0).getContent());
        verify(messageRepository).markChatMessagesAsRead(eq(chat.getId()), eq(vet.getId()), any(LocalDateTime.class));
        verify(messagingTemplate).convertAndSend(
                eq("/topic/users/" + vet.getId() + "/chats"),
                any(ChatRealtimeEventDTO.class)
        );
    }

    @Test
    void getTotalUnreadMessageCount_shouldReturnCurrentUserUnreadCount() {
        authenticateAs(owner);
        when(messageRepository.countUnreadMessagesForUser(owner)).thenReturn(5L);

        Long result = chatService.getTotalUnreadMessageCount();

        assertEquals(5L, result);
    }

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    private void authenticateAs(Users user) {
        lenient().when(authentication.getPrincipal()).thenReturn(new UserPrinciple(user));
        lenient().when(usersRepository.findById(user.getId())).thenReturn(Optional.of(user));
    }

    private Users user(Long id, EnumRole role, String firstName, String lastName) {
        Users user = new Users();
        user.setId(id);
        user.setEmail(firstName.toLowerCase() + id + "@test.com");
        user.setPasswordHash("password");
        user.setRole(role);

        UserInfo userInfo = new UserInfo();
        userInfo.setUsers(user);
        userInfo.setFirstName(firstName);
        userInfo.setLastName(lastName);
        userInfo.setPhotoUrl("photo-" + id);
        user.setUserInfo(userInfo);

        return user;
    }

    private Chat chat(Long id, Users owner, Users provider) {
        Chat chat = new Chat();
        chat.setId(id);
        chat.setOwner(owner);
        chat.setProvider(provider);
        chat.setCreatedAt(LocalDateTime.now().minusMinutes(5));
        chat.setLastMessageAt(LocalDateTime.now());
        chat.setIsActive(true);
        return chat;
    }

    private Message message(Long id, Chat chat, Users sender, String content) {
        Message message = new Message();
        message.setId(id);
        message.setChat(chat);
        message.setSender(sender);
        message.setContent(content);
        message.setCreatedAt(LocalDateTime.now());
        message.setIsRead(false);
        return message;
    }
}
