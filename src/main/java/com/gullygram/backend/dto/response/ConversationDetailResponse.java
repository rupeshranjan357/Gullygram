package com.gullygram.backend.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
@Builder
public class ConversationDetailResponse {
    private UUID id;
    private UserView otherUser;
    private List<MessageResponse> messages;
    private int totalMessages;
    private int currentPage;
    private int totalPages;
}
