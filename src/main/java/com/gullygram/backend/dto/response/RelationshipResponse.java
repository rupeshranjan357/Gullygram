package com.gullygram.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Response DTO for relationship/friend request data
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RelationshipResponse {

    private UUID id;
    
    // The other user in the relationship
    private UserSummary user;
    
    // Current status: REQUESTED, ACCEPTED, REJECTED, BLOCKED
    private String status;
    
    // Direction relative to current user: SENT or RECEIVED
    private String direction;
    
    // Optional message sent with the request
    private String message;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
