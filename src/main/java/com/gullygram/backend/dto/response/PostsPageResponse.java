package com.gullygram.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Paginated response for posts
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PostsPageResponse {
    private List<PostResponse> content;
    private int page;
    private int size;
    private long totalElements;
    private int totalPages;
    private boolean hasNext;
    private boolean hasPrevious;
}
