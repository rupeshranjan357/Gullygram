package com.gullygram.backend.service.impl;

import com.gullygram.backend.dto.response.AuthorView;
import com.gullygram.backend.dto.response.PostResponse;
import com.gullygram.backend.dto.response.UserSummary;
import com.gullygram.backend.entity.Post;
import com.gullygram.backend.entity.User;
import com.gullygram.backend.entity.UserProfile;
import com.gullygram.backend.repository.PostRepository;
import com.gullygram.backend.repository.UserProfileRepository;
import com.gullygram.backend.repository.UserRepository;
import com.gullygram.backend.service.FeedService;
import com.gullygram.backend.service.RelationshipService;
import com.gullygram.backend.service.SearchService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import java.util.Objects; // Added import

@Service
@RequiredArgsConstructor
@Slf4j
public class SearchServiceImpl implements SearchService {

    private final UserProfileRepository userProfileRepository;
    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final RelationshipService relationshipService;
    // private final FeedService feedService; // Removed to avoid circular deps and unused warning

    // Rough approximation: 1 degree latitude ~ 111 km
    private static final double KM_PER_DEGREE = 111.0;

    @Override
    @Transactional(readOnly = true)
    public List<UserSummary> searchUsers(String query, UUID currentUserId) {
        if (query == null || query.trim().length() < 2) {
            return new ArrayList<>();
        }

        List<UserProfile> profiles = userProfileRepository.searchUsers(query.trim());
        
        return profiles.stream()
                .filter(p -> p.getUser() != null && !p.getUser().getId().equals(currentUserId)) // Exclude self and verify user exists
                .map(p -> convertToUserSummary(p, currentUserId))
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PostResponse> searchPosts(String query, UUID currentUserId, Double lat, Double lon, Double radiusKm) {
        if (query == null || query.trim().length() < 2) {
            return new ArrayList<>();
        }

        BoundingBox box = calculateBoundingBox(lat, lon, radiusKm);
        
        Page<Post> posts = postRepository.searchPosts(
            query.trim(),
            box.minLat, box.maxLat, box.minLon, box.maxLon,
            PageRequest.of(0, 20)
        );

        return posts.getContent().stream()
                .map(post -> convertToPostResponse(post, currentUserId))
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PostResponse> searchHashtags(String hashtag, UUID currentUserId, Double lat, Double lon, Double radiusKm) {
        if (hashtag == null || hashtag.trim().isEmpty()) {
            return new ArrayList<>();
        }
        
        if (!hashtag.startsWith("#")) {
            hashtag = "#" + hashtag;
        }

        BoundingBox box = calculateBoundingBox(lat, lon, radiusKm);
        
        Page<Post> posts = postRepository.searchHashtags(
            hashtag.trim(),
            box.minLat, box.maxLat, box.minLon, box.maxLon,
            PageRequest.of(0, 20)
        );

        return posts.getContent().stream()
                .map(post -> convertToPostResponse(post, currentUserId))
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    private UserSummary convertToUserSummary(UserProfile profile, UUID currentUserId) {
        if (profile == null) return null;
        try {
            // Use getUserId() which is field-based, safer than traversing to User
            UUID userId = profile.getUserId();
            
            // Still check user existence if needed, but we can survive without it for some fields
            if (profile.getUser() == null) {
                log.warn("Search: Profile {} has null User entity, but proceeding with ID if possible", userId);
            }
            
            boolean isFriend = relationshipService.areFriends(currentUserId, userId);
            
            return UserSummary.builder()
                    .userId(userId)
                    .alias(profile.getAlias())
                    .realName(isFriend ? profile.getRealName() : null)
                    .realAvatarUrl(isFriend ? profile.getAvatarUrlReal() : null)
                    .avatarUrl(profile.getAvatarUrlAlias())
                    .isFriend(isFriend)
                    .trustLevel(profile.getTrustLevel())
                    .build();
        } catch (Exception e) {
            log.error("Error converting profile {}: {}", profile.getUserId(), e.getMessage());
            return null;
        }
    }
    
    private PostResponse convertToPostResponse(Post post, UUID currentUserId) {
        if (post == null) return null;
        try {
            if (post.getAuthor() == null) {
                 log.warn("Search skipping Post {} due to missing Author", post.getId());
                 return null;
            }
            // Ensure Author has Profile
            if (post.getAuthor().getProfile() == null) {
                 log.warn("Search skipping Post {} due to missing Author Profile", post.getId());
                 return null;
            }

            boolean isFriend = relationshipService.areFriends(currentUserId, post.getAuthor().getId());
            // Safe stream check for likes
            boolean liked = post.getLikes() != null && post.getLikes().stream()
                    .anyMatch(l -> l.getUser() != null && l.getUser().getId().equals(currentUserId));
            
            UserProfile authorProfile = post.getAuthor().getProfile();
            
            return PostResponse.builder()
                    .id(post.getId())
                    .text(post.getText())
                    .visibility(post.getVisibility().name())
                    .type(post.getType()) 
                    .mediaUrls(post.getMediaUrls())
                    .likeCount(post.getLikes() != null ? (long) post.getLikes().size() : 0L)
                    .commentCount(post.getComments() != null ? (long) post.getComments().size() : 0L)
                    .likedByCurrentUser(liked)
                    .createdAt(post.getCreatedAt())
                    .distance(0.0) 
                    .author(AuthorView.builder()
                            .userId(post.getAuthor().getId())
                            .alias(authorProfile.getAlias())
                            .realName(isFriend ? authorProfile.getRealName() : null)
                            .realAvatarUrl(isFriend ? authorProfile.getAvatarUrlReal() : null)
                            .avatarUrl(authorProfile.getAvatarUrlAlias())
                            .isFriend(isFriend)
                            .trustLevel(authorProfile.getTrustLevel())
                            .build())
                    .build();
        } catch (Exception e) {
             log.error("Error converting post {}: {}", post.getId(), e.getMessage());
             return null;
        }
    }

    private BoundingBox calculateBoundingBox(Double lat, Double lon, Double radiusKm) {
        if (lat == null || lon == null) {
            // Default to whole world or standard default if location missing (though typically required)
            return new BoundingBox(-90, 90, -180, 180);
        }
        
        double r = (radiusKm != null && radiusKm > 0) ? radiusKm : 50.0; // Default 50km
        
        double latDelta = r / KM_PER_DEGREE;
        double lonDelta = r / (KM_PER_DEGREE * Math.cos(Math.toRadians(lat)));

        return new BoundingBox(
            lat - latDelta,
            lat + latDelta,
            lon - lonDelta,
            lon + lonDelta
        );
    }

    private static class BoundingBox {
        double minLat, maxLat, minLon, maxLon;
        BoundingBox(double minLat, double maxLat, double minLon, double maxLon) {
            this.minLat = minLat; this.maxLat = maxLat; this.minLon = minLon; this.maxLon = maxLon;
        }
    }
}
