package com.gullygram.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageResponse {
    private UUID id;
    private UUID conversationId;
    private UUID senderId;
    private String content;
    private boolean isRead;
    private LocalDateTime readAt;
    private LocalDateTime createdAt;
    private boolean isMine; // Convenience flag for frontend
}
