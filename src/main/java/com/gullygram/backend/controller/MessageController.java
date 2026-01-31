package com.gullygram.backend.controller;

import com.gullygram.backend.dto.request.SendMessageRequest;
import com.gullygram.backend.dto.response.ApiResponse;
import com.gullygram.backend.dto.response.ConversationDetailResponse;
import com.gullygram.backend.dto.response.ConversationResponse;
import com.gullygram.backend.dto.response.MessageResponse;
import com.gullygram.backend.security.UserPrincipal;
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

    /**
     * Get all conversations for the current user
     */
    @GetMapping("/conversations")
    public ResponseEntity<ApiResponse<List<ConversationResponse>>> getConversations(
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        log.info("GET /api/messages/conversations - user: {}", currentUser.getUserId());
        
        List<ConversationResponse> conversations = messageService.getConversations(currentUser.getUserId());
        
        return ResponseEntity.ok(ApiResponse.success(conversations));
    }

    /**
     * Get conversation details with messages
     */
    @GetMapping("/conversations/{conversationId}")
    public ResponseEntity<ApiResponse<ConversationDetailResponse>> getConversation(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable UUID conversationId,
            @RequestParam(defaultValue = "0") int page
    ) {
        log.info("GET /api/messages/conversations/{} - user: {}, page: {}", 
                conversationId, currentUser.getUserId(), page);
        
        ConversationDetailResponse conversation = messageService.getConversationDetails(
                currentUser.getUserId(), conversationId, page);
        
        return ResponseEntity.ok(ApiResponse.success(conversation));
    }

    /**
     * Send a message
     */
    @PostMapping("/send")
    public ResponseEntity<ApiResponse<MessageResponse>> sendMessage(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody SendMessageRequest request
    ) {
        log.info("POST /api/messages/send - from: {} to: {}", 
                currentUser.getUserId(), request.getRecipientId());
        
        MessageResponse message = messageService.sendMessage(currentUser.getUserId(), request);
        
        return ResponseEntity.ok(ApiResponse.success(message));
    }

    /**
     * Mark messages as read in a conversation
     */
    @PostMapping("/conversations/{conversationId}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable UUID conversationId
    ) {
        log.info("POST /api/messages/conversations/{}/read - user: {}", 
                conversationId, currentUser.getUserId());
        
        messageService.markMessagesAsRead(currentUser.getUserId(), conversationId);
        
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    /**
     * Delete a message (soft delete)
     */
    @DeleteMapping("/{messageId}")
    public ResponseEntity<ApiResponse<Void>> deleteMessage(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable UUID messageId
    ) {
        log.info("DELETE /api/messages/{} - user: {}", messageId, currentUser.getUserId());
        
        messageService.deleteMessage(currentUser.getUserId(), messageId);
        
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
