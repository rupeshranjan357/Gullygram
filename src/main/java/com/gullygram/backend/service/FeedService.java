package com.gullygram.backend.service;

import com.gullygram.backend.dto.response.FeedResponse;
import com.gullygram.backend.dto.response.PostResponse;
import com.gullygram.backend.entity.Interest;
import com.gullygram.backend.entity.Post;
import com.gullygram.backend.entity.UserProfile;
import com.gullygram.backend.exception.BadRequestException;
import com.gullygram.backend.exception.ResourceNotFoundException;
import com.gullygram.backend.repository.PostRepository;
import com.gullygram.backend.repository.UserProfileRepository;
import com.gullygram.backend.util.GeoUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class FeedService {

    private final PostRepository postRepository;
    private final UserProfileRepository userProfileRepository;
    private final PostService postService;
    private final RelationshipService relationshipService;

    // Feed ranking weights
    private static final double RECENCY_WEIGHT = 1.0;
    private static final double INTEREST_MATCH_WEIGHT = 2.0;
    private static final double ENGAGEMENT_WEIGHT = 0.5;
    private static final int MAX_ENGAGEMENT_SCORE = 100; // Cap for normalization

    @Transactional(readOnly = true)
    public FeedResponse getFeed(UUID userId, Double lat, Double lon, Integer radiusKm, 
                                 Boolean interestBoost, int page, int size) {
        // Validate inputs
        if (!GeoUtil.isValidLatitude(lat)) {
            throw new BadRequestException("Invalid latitude");
        }
        if (!GeoUtil.isValidLongitude(lon)) {
            throw new BadRequestException("Invalid longitude");
        }
        if (radiusKm == null || radiusKm <= 0) {
            radiusKm = 10; // Default
        }
        if (radiusKm > 50) {
            throw new BadRequestException("Radius cannot exceed 50km");
        }
        
        final int effectiveRadius = radiusKm; // Make it final for lambda

        // Get user profile for interest matching
        UserProfile userProfile = userProfileRepository.findByUserId(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User profile not found"));

        Set<Integer> userInterestIds = userProfile.getInterests().stream()
            .map(Interest::getId)
            .collect(Collectors.toSet());


        // Calculate bounding box
        double[] bbox = GeoUtil.getBoundingBox(lat, lon, effectiveRadius);
        double minLat = bbox[0];
        double maxLat = bbox[1];
        double minLon = bbox[2];
        double maxLon = bbox[3];

        // Fetch posts from database (larger page to filter and rank)
        int fetchSize = Math.max(size * 3, 30); // Fetch more for better ranking
        Pageable pageable = PageRequest.of(0, fetchSize);
        Page<Post> candidatePosts = postRepository.findPostsInBoundingBox(minLat, maxLat, minLon, maxLon, pageable);

        log.info("Found {} candidate posts in bounding box for user {}", candidatePosts.getTotalElements(), userId);

        // Filter by actual distance using Haversine
        List<Post> filteredPosts = candidatePosts.stream()
            .filter(post -> {
                double distance = GeoUtil.calculateDistance(lat, lon, post.getLat(), post.getLon());
                return distance <= effectiveRadius;
            })
            .collect(Collectors.toList());

        log.info("Filtered to {} posts within {}km radius", filteredPosts.size(), effectiveRadius);

        // Filter out FRIENDS_ONLY posts if viewer is not a friend
        List<Post> visibilityFilteredPosts = filteredPosts.stream()
            .filter(post -> {
                // If post is PUBLIC, everyone can see it
                if (post.getVisibility() == Post.PostVisibility.PUBLIC) {
                    return true;
                }
                // If post is FRIENDS_ONLY, check relationship
                if (post.getVisibility() == Post.PostVisibility.FRIENDS_ONLY) {
                    // Author can always see their own posts
                    if (post.getAuthor().getId().equals(userId)) {
                        return true;
                    }
                    // Check if viewer is friends with author
                    return relationshipService.areFriends(userId, post.getAuthor().getId());
                }
                return false;
            })
            .collect(Collectors.toList());

        log.info("After visibility filtering: {} posts visible to user", visibilityFilteredPosts.size());


        // Rank and Filter posts using Tiered Hybrid Algorithm
        List<ScoredPost> scoredPosts = visibilityFilteredPosts.stream()
            .map(post -> {
                double distance = GeoUtil.calculateDistance(lat, lon, post.getLat(), post.getLon());
                boolean isInterestMatch = isInterestMatch(post, userInterestIds);

                // TIER 1: Local Zone (0-5km)
                if (distance <= 5.0) {
                    // Show EVERYTHING.
                    // Score is primarily time-based, but we boost interest matches slightly for visual ordering
                    double score = calculateRecencyScore(post);
                    if (isInterestMatch) score += 5; // Slight boost
                    return new ScoredPost(post, score);
                }

                // TIER 2: Extended Zone (5km to effectiveRadius)
                // We already filtered by effectiveRadius at line 88.
                
                double baseScore = calculateRecencyScore(post);
                double engagementBonus = calculateEngagementScore(post);
                
                double finalScore = baseScore + (engagementBonus * 0.5);

                // DISCOVERY LOGIC:
                // If user asked for a LARGE radius (> 15km), they want to explore.
                // Boost distant posts so they see what's new out there, instead of just local stuff.
                if (effectiveRadius > 15 && distance > 5.0) {
                     // "The Wanderlust Boost": +2 points per km away
                     finalScore += (distance * 2.0); 
                } else {
                     // Normal Mode: Slight decay for distance to keep feed relevant
                     double decay = Math.max(0.8, 1.0 - (distance / 100.0));
                     finalScore *= decay;
                }
                
                // Interest Boost matches get a flat bonus
                if (isInterestMatch && (interestBoost != null && interestBoost)) {
                    finalScore += 20; 
                }

                return new ScoredPost(post, finalScore);
            })
            .filter(Objects::nonNull) // Remove nulls (filtered out posts)
            .sorted(Comparator.comparingDouble(ScoredPost::getScore).reversed())
            .collect(Collectors.toList());

        // Paginate manually
        int start = page * size;
        int end = Math.min(start + size, scoredPosts.size());
        
        List<PostResponse> postResponses;
        if (start >= scoredPosts.size()) {
            postResponses = new ArrayList<>();
        } else {
            postResponses = scoredPosts.subList(start, end).stream()
                .map(sp -> {
                    // Add "Reason" to response if needed (not in MVP schema yet)
                    return postService.convertToResponse(sp.getPost(), userId);
                })
                .collect(Collectors.toList());
        }

        int totalElements = scoredPosts.size();
        int totalPages = (int) Math.ceil((double) totalElements / size);

        return FeedResponse.builder()
            .posts(postResponses)
            .currentPage(page)
            .totalPages(totalPages)
            .totalElements(totalElements)
            .pageSize(size)
            .hasNext(page < totalPages - 1)
            .hasPrevious(page > 0)
            .build();
    }

    private boolean isInterestMatch(Post post, Set<Integer> userInterestIds) {
        if (post.getInterests() == null || post.getInterests().isEmpty()) return false;
        return post.getInterests().stream()
            .anyMatch(i -> userInterestIds.contains(i.getId()));
    }

    private double calculateRecencyScore(Post post) {
        long hoursSinceCreation = ChronoUnit.HOURS.between(post.getCreatedAt(), LocalDateTime.now());
        // Simple decay: 100 points - 1 point per hour
        return Math.max(0, 100 - hoursSinceCreation); 
    }

    private double calculateEngagementScore(Post post) {
        // Engagement score for Hype Zone
        long likes = post.getLikes().size();
        long comments = post.getComments().size();
        
        // Cap at 100
        return Math.min(100, (likes * 2) + (comments * 3));
    }


    // Helper class for scoring
    private static class ScoredPost {
        private final Post post;
        private final double score;

        public ScoredPost(Post post, double score) {
            this.post = post;
            this.score = score;
        }

        public Post getPost() {
            return post;
        }

        public double getScore() {
            return score;
        }
    }
}
