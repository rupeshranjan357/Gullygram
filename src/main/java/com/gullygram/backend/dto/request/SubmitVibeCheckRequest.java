package com.gullygram.backend.dto.request;

import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class SubmitVibeCheckRequest {
    private UUID huddleId;
    private UUID revieweeId;
    private Integer rating; // 1-5
    private List<String> tags; // e.g., ["Funny", "Late", "Safe"]
}
