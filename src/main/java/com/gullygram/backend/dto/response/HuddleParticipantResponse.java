package com.gullygram.backend.dto.response;

import lombok.Builder;
import lombok.Data;
import java.util.UUID;

@Data
@Builder
public class HuddleParticipantResponse {
    private UUID userId;
    private String alias;
    private String avatarUrl;
}
