package com.gullygram.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * Minimal user info for lists (friends, suggestions, etc.)
 * Respects privacy based on relationship status
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserSummary {

    private UUID userId;
    private String alias;
    private String avatarUrl;
    
    // Only visible if friends or self
    private String realName;
    private String realAvatarUrl;
    
    // Relationship info
    private Boolean isFriend;
    
    // Optional distance info
    private Double distanceKm;
    
    // Trust level (1-5)
    private Integer trustLevel;
    
    // Bio snippet
    private String bio;
}
