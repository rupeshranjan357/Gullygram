package com.gullygram.backend.service;

import com.gullygram.backend.dto.response.PostResponse;
import com.gullygram.backend.dto.response.UserSummary;
import com.gullygram.backend.entity.Post;
import com.gullygram.backend.entity.UserProfile;

import java.util.List;
import java.util.UUID;

public interface SearchService {
    List<UserSummary> searchUsers(String query, UUID currentUserId);
    List<PostResponse> searchPosts(String query, UUID currentUserId, Double lat, Double lon, Double radiusKm);
    List<PostResponse> searchHashtags(String hashtag, UUID currentUserId, Double lat, Double lon, Double radiusKm);
}
