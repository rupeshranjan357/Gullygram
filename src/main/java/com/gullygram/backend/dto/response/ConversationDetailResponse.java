package com.gullygram.backend.dto.response;

import com.gullygram.backend.dto.response.AuthorView;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConversationDetailResponse {
    private UUID id;
    private AuthorView otherUser;
    private List<MessageResponse> messages;
    private int totalMessages;
    private int currentPage;
    private int totalPages;
}
