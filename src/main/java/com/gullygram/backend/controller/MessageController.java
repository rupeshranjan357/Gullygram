package com.gullygram.backend.controller;

import com.gullygram.backend.dto.request.SendMessageRequest;
import com.gullygram.backend.dto.response.ApiResponse;
import com.gullygram.backend.dto.response.ConversationDetailResponse;
import com.gullygram.backend.dto.response.ConversationResponse;
import com.gullygram.backend.dto.response.MessageResponse;
import com.gullygram.backend.security.CurrentUser;
import com.gullygram.backend.service.MessageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
@Slf4j
public class MessageController {

    private final MessageService messageService;
    private final CurrentUser currentUser;

    /**
     * Get all conversations for the current user
     */
    @GetMapping("/conversations")
    public ResponseEntity<ApiResponse<List<ConversationResponse>>> getConversations() {
        UUID userId = currentUser.getUserId();
        log.info("GET /api/messages/conversations - user: {}", userId);
        
        List<ConversationResponse> conversations = messageService.getConversations(userId);
        
        return ResponseEntity.ok(ApiResponse.success(conversations));
    }

    /**
     * Get conversation details with messages
     */
    @GetMapping("/conversations/{conversationId}")
    public ResponseEntity<ApiResponse<ConversationDetailResponse>> getConversation(
            @PathVariable UUID conversationId,
            @RequestParam(defaultValue = "0") int page
    ) {
        UUID userId = currentUser.getUserId();
        log.info("GET /api/messages/conversations/{} - user: {}, page: {}", 
                conversationId, userId, page);
        
        ConversationDetailResponse conversation = messageService.getConversationDetails(
                userId, conversationId, page);
        
        return ResponseEntity.ok(ApiResponse.success(conversation));
    }

    /**
     * Send a message
     */
    @PostMapping("/send")
    public ResponseEntity<ApiResponse<MessageResponse>> sendMessage(
            @Valid @RequestBody SendMessageRequest request
    ) {
        UUID userId = currentUser.getUserId();
        log.info("POST /api/messages/send - from: {} to: {}", 
                userId, request.getRecipientId());
        
        MessageResponse message = messageService.sendMessage(userId, request);
        
        return ResponseEntity.ok(ApiResponse.success(message));
    }

    /**
     * Mark messages as read in a conversation
     */
    @PostMapping("/conversations/{conversationId}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(
            @PathVariable UUID conversationId
    ) {
        UUID userId = currentUser.getUserId();
        log.info("POST /api/messages/conversations/{}/read - user: {}", 
                conversationId, userId);
        
        messageService.markMessagesAsRead(userId, conversationId);
        
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    /**
     * Delete a message (soft delete)
     */
    @DeleteMapping("/{messageId}")
    public ResponseEntity<ApiResponse<Void>> deleteMessage(
            @PathVariable UUID messageId
    ) {
        UUID userId = currentUser.getUserId();
        log.info("DELETE /api/messages/{} - user: {}", messageId, userId);
        
        messageService.deleteMessage(userId, messageId);
        
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
