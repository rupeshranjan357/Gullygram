package com.gullygram.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

/**
 * Response DTO for people suggestions based on interests and location
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PeopleSuggestionResponse {

    private UUID userId;
    private String alias;
    private String avatarUrl;
    
    // Shared interests for "Why suggested" display
    private List<String> sharedInterests;
    
    // Distance from current user
    private Double distanceKm;
    
    // Human-readable reason: "Both into Music and Fitness • 2km away"
    private String whySuggested;
    
    // Trust level badge (1-5)
    private Integer trustLevel;
    
    // Is the user recently active?
    private Boolean recentlyActive;
    
    // Suggestion score (for debugging/internal use, can be hidden in production)
    private Integer score;
    
    // Bio snippet
    private String bio;
}
