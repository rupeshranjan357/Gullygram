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


        // Rank posts
        List<ScoredPost> scoredPosts = filteredPosts.stream()
            .map(post -> {
                double score = calculateFeedScore(post, userInterestIds, interestBoost != null && interestBoost);
                return new ScoredPost(post, score);
            })
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
                .map(sp -> postService.convertToResponse(sp.getPost(), userId))
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

    private double calculateFeedScore(Post post, Set<Integer> userInterestIds, boolean applyInterestBoost) {
        double score = 0.0;

        // 1. Recency score (newer posts get higher scores)
        long hoursSinceCreation = ChronoUnit.HOURS.between(post.getCreatedAt(), LocalDateTime.now());
        double recencyScore = Math.max(0, 100 - hoursSinceCreation); // Decays over time
        score += recencyScore * RECENCY_WEIGHT;

        // 2. Interest match score
        if (applyInterestBoost && post.getInterests() != null && !post.getInterests().isEmpty()) {
            Set<Integer> postInterestIds = post.getInterests().stream()
                .map(Interest::getId)
                .collect(Collectors.toSet());
            
            long matchingInterests = postInterestIds.stream()
                .filter(userInterestIds::contains)
                .count();
            
            if (matchingInterests > 0) {
                double interestScore = (matchingInterests * 50.0); // 50 points per match
                score += interestScore * INTEREST_MATCH_WEIGHT;
            }
        }

        // 3. Engagement score (likes + comments)
        long engagement = post.getLikes().size() + post.getComments().size();
        double engagementScore = Math.min(engagement, MAX_ENGAGEMENT_SCORE);
        score += engagementScore * ENGAGEMENT_WEIGHT;

        return score;
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
