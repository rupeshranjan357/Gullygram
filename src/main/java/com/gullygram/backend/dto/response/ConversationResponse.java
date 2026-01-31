package com.gullygram.backend.dto.response;

import com.gullygram.backend.dto.response.AuthorView;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class ConversationResponse {
    private UUID id;
    private AuthorView otherUser; // The friend
    private String lastMessagePreview;
    private LocalDateTime lastMessageAt;
    private int unreadCount;
    private LocalDateTime createdAt;
}
