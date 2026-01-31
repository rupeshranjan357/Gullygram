package com.gullygram.backend.dto.response;

import com.gullygram.backend.entity.Post;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PostResponse {

    private UUID id;
    private AuthorView author;
    private Post.PostType type;
    private String text;
    private List<String> mediaUrls;
    private Double latitude;
    private Double longitude;
    private Integer visibilityRadiusKm;
    private Set<InterestResponse> interests;
    private Long likeCount;
    private Long commentCount;
    private Boolean likedByCurrentUser;
    private String visibility;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
