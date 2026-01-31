package com.gullygram.backend.service;

import com.gullygram.backend.dto.request.SendMessageRequest;
import com.gullygram.backend.dto.response.ConversationDetailResponse;
import com.gullygram.backend.dto.response.ConversationResponse;
import com.gullygram.backend.dto.response.MessageResponse;
import com.gullygram.backend.dto.response.AuthorView;
import com.gullygram.backend.entity.Conversation;
import com.gullygram.backend.entity.Message;
import com.gullygram.backend.entity.User;
import com.gullygram.backend.repository.ConversationRepository;
import com.gullygram.backend.repository.MessageRepository;
import com.gullygram.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MessageService {

    private final MessageRepository messageRepository;
    private final ConversationRepository conversationRepository;
    private final UserRepository userRepository;
    private final RelationshipService relationshipService;
    private final AuthorViewService authorViewService;

    /**
     * Send a message to a friend
     */
    @Transactional
    public MessageResponse sendMessage(UUID senderId, SendMessageRequest request) {
        log.info("Sending message from {} to {}", senderId, request.getRecipientId());

        // Validate friendship
        log.info("Validating friendship between sender {} and recipient {}", senderId, request.getRecipientId());
        boolean areFriends = relationshipService.areFriends(senderId, request.getRecipientId());
        log.info("Friendship check result: {}", areFriends);
        
        if (!areFriends) {
            log.error("Friendship validation failed for sender {} and recipient {}", senderId, request.getRecipientId());
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only message friends");
        }

        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Sender not found"));

        User recipient = userRepository.findById(request.getRecipientId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Recipient not found"));

        // Get or create conversation
        Conversation conversation = getOrCreateConversation(sender, recipient);

        // Create message
        Message message = Message.builder()
                .conversation(conversation)
                .sender(sender)
                .content(request.getContent())
                .build();

        message = messageRepository.save(message);

        // Update conversation's last message timestamp
        conversation.setLastMessageAt(message.getCreatedAt());
        conversationRepository.save(conversation);

        log.info("Message sent successfully: {}", message.getId());
        return convertToMessageResponse(message, senderId);
    }

    /**
     * Get all conversations for a user
     */
    @Transactional(readOnly = true)
    public List<ConversationResponse> getConversations(UUID userId) {
        log.info("Getting conversations for user {}", userId);

        List<Conversation> conversations = conversationRepository.findByUserId(userId);

        return conversations.stream()
                .map(conv -> convertToConversationResponse(conv, userId))
                .collect(Collectors.toList());
    }

    /**
     * Get conversation details with messages (paginated)
     */
    @Transactional(readOnly = true)
    public ConversationDetailResponse getConversationDetails(UUID userId, UUID conversationId, int page) {
        log.info("Getting conversation {} for user {}, page {}", conversationId, userId, page);

        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Conversation not found"));

        // Check access
        if (!conversation.includes(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your conversation");
        }

        // Get messages (paginated, newest first)
        Pageable pageable = PageRequest.of(page, 50, Sort.by("createdAt").descending());
        Page<Message> messagesPage = messageRepository.findByConversationId(conversationId, pageable);

        List<MessageResponse> messages = messagesPage.getContent().stream()
                .map(msg -> convertToMessageResponse(msg, userId))
                .collect(Collectors.toList());

        User otherUser = conversation.getOtherUser(userId);

        return ConversationDetailResponse.builder()
                .id(conversation.getId())
                .otherUser(convertToAuthorView(otherUser, userId))
                .messages(messages)
                .totalMessages((int) messagesPage.getTotalElements())
                .currentPage(page)
                .totalPages(messagesPage.getTotalPages())
                .build();
    }

    /**
     * Mark messages as read
     */
    @Transactional
    public void markMessagesAsRead(UUID userId, UUID conversationId) {
        log.info("Marking messages as read for user {} in conversation {}", userId, conversationId);

        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Conversation not found"));

        // Check access
        if (!conversation.includes(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your conversation");
        }

        // Get unread messages
        List<Message> unreadMessages = messageRepository.findUnreadMessages(conversationId, userId);

        // Mark as read
        unreadMessages.forEach(Message::markAsRead);
        messageRepository.saveAll(unreadMessages);

        log.info("Marked {} messages as read", unreadMessages.size());
    }

    /**
     * Delete a message (soft delete, sender only)
     */
    @Transactional
    public void deleteMessage(UUID userId, UUID messageId) {
        log.info("Deleting message {} by user {}", messageId, userId);

        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Message not found"));

        // Only sender can delete
        if (!message.getSender().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only delete your own messages");
        }

        message.softDelete();
        messageRepository.save(message);

        log.info("Message deleted successfully");
    }

    /**
     * Get or create a conversation between two users
     */
    private Conversation getOrCreateConversation(User user1, User user2) {
        // Ensure user1.id < user2.id for uniqueness constraint
        // WE MUST USE toString() comparison to match Database lexical sorting!
        // Java's UUID.compareTo() uses signed comparison (so 0x8... is negative),
        // causing mismatch with Postgres which considers 0x8... > 0x0...
        User smaller = user1.getId().toString().compareTo(user2.getId().toString()) < 0 ? user1 : user2;
        User larger = user1.getId().toString().compareTo(user2.getId().toString()) < 0 ? user2 : user1;

        return conversationRepository.findByUsers(smaller.getId(), larger.getId())
                .orElseGet(() -> {
                    Conversation newConv = Conversation.builder()
                            .user1(smaller)
                            .user2(larger)
                            .build();
                    return conversationRepository.save(newConv);
                });
    }

    /**
     * Convert Conversation to ConversationResponse
     */
    private ConversationResponse convertToConversationResponse(Conversation conversation, UUID currentUserId) {
        User otherUser = conversation.getOtherUser(currentUserId);
        
        // Get last message preview
        Message lastMessage = messageRepository.findLastMessage(conversation.getId());
        String lastMessagePreview = lastMessage != null ? truncate(lastMessage.getContent(), 50) : null;

        // Get unread count
        int unreadCount = messageRepository.countUnreadMessages(conversation.getId(), currentUserId);

        return ConversationResponse.builder()
                .id(conversation.getId())
                .otherUser(convertToAuthorView(otherUser, currentUserId))
                .lastMessagePreview(lastMessagePreview)
                .lastMessageAt(conversation.getLastMessageAt())
                .unreadCount(unreadCount)
                .createdAt(conversation.getCreatedAt())
                .build();
    }

    /**
     * Convert Message to MessageResponse
     */
    private MessageResponse convertToMessageResponse(Message message, UUID currentUserId) {
        return MessageResponse.builder()
                .id(message.getId())
                .conversationId(message.getConversation().getId())
                .senderId(message.getSender().getId())
                .content(message.getContent())
                .isRead(message.isRead())
                .readAt(message.getReadAt())
                .createdAt(message.getCreatedAt())
                .isMine(message.getSender().getId().equals(currentUserId))
                .build();
    }

    /**
     * Convert User to AuthorView
     */
    private AuthorView convertToAuthorView(User user, UUID currentUserId) {
        return authorViewService.buildAuthorView(currentUserId, user);
    }

    /**
     * Truncate string to specified length
     */
    private String truncate(String str, int length) {
        if (str == null || str.length() <= length) {
            return str;
        }
        return str.substring(0, length) + "...";
    }
}
