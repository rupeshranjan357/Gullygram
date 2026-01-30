package com.gullygram.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * Author view DTO that respects privacy based on relationship status.
 * Real name and avatar are only visible when:
 * - Viewing your own content
 * - Viewing content from friends (ACCEPTED relationship)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthorView {

    private UUID userId;
    private String alias;
    private String avatarUrl;
    
    // Real identity - only visible to friends or self
    private String realName;
    private String realAvatarUrl;
    
    // Relationship indicator
    private Boolean isFriend;
    
    // Trust level (1-5) for badge display
    private Integer trustLevel;
}
