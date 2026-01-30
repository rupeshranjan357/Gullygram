package com.gullygram.backend.service;

import com.gullygram.backend.dto.response.PeopleSuggestionResponse;
import com.gullygram.backend.entity.Interest;
import com.gullygram.backend.entity.User;
import com.gullygram.backend.entity.UserProfile;
import com.gullygram.backend.exception.ResourceNotFoundException;
import com.gullygram.backend.repository.RelationshipRepository;
import com.gullygram.backend.repository.UserProfileRepository;
import com.gullygram.backend.repository.UserRepository;
import com.gullygram.backend.util.GeoUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for suggesting people to connect with based on:
 * - Shared interests
 * - Geographic proximity
 * - Recent activity
 * - Trust level
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PeopleSuggestionService {

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final RelationshipRepository relationshipRepository;

    // Scoring weights
    private static final int SAME_TOP_INTEREST_SCORE = 40;
    private static final int SHARED_INTERESTS_2_PLUS_SCORE = 20;
    private static final int CLOSE_DISTANCE_SCORE = 20;  // < 3km
    private static final int RECENTLY_ACTIVE_SCORE = 10; // active in last 48h
    private static final int HIGH_TRUST_BONUS = 10;      // trust level 4+

    /**
     * Get suggested people for a user based on interests and location
     */
    @Transactional(readOnly = true)
    public List<PeopleSuggestionResponse> getSuggestions(UUID userId, Double lat, Double lon, 
                                                          Integer radiusKm, int limit) {
        // Get current user's profile and interests
        UserProfile currentProfile = userProfileRepository.findByUserId(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User profile not found"));

        Set<Integer> userInterestIds = currentProfile.getInterests().stream()
            .map(Interest::getId)
            .collect(Collectors.toSet());

        // Get the user's top interest (first one for simplicity, could be improved)
        Integer topInterestId = userInterestIds.stream().findFirst().orElse(null);

        // Get excluded user IDs (self, friends, blocked)
        Set<UUID> excludedIds = new HashSet<>();
        excludedIds.add(userId);
        excludedIds.addAll(relationshipRepository.findFriendUserIds(userId));
        excludedIds.addAll(relationshipRepository.findBlockedUserIds(userId));

        // Also exclude users who have pending requests with current user
        relationshipRepository.findPendingRequestsReceived(userId)
            .forEach(r -> excludedIds.add(r.getRequester().getId()));
        relationshipRepository.findPendingRequestsSent(userId)
            .forEach(r -> excludedIds.add(r.getReceiver().getId()));

        // Use provided location or user's last seen location
        double searchLat = lat != null ? lat : 
            (currentProfile.getLastSeenLat() != null ? currentProfile.getLastSeenLat() : 0);
        double searchLon = lon != null ? lon : 
            (currentProfile.getLastSeenLon() != null ? currentProfile.getLastSeenLon() : 0);
        int searchRadius = radiusKm != null ? radiusKm : 
            (currentProfile.getDefaultRadiusKm() != null ? currentProfile.getDefaultRadiusKm() : 10);

        // Get all users within bounding box
        double[] bbox = GeoUtil.getBoundingBox(searchLat, searchLon, searchRadius);
        
        // Get all user profiles (for pilot with small user base)
        // In production, this would use a more efficient geo query
        List<UserProfile> candidateProfiles = userProfileRepository.findAll().stream()
            .filter(p -> p.getUserId() != null && !excludedIds.contains(p.getUserId()))
            .filter(p -> p.getLastSeenLat() != null && p.getLastSeenLon() != null)
            .filter(p -> {
                // Check within bounding box
                double pLat = p.getLastSeenLat();
                double pLon = p.getLastSeenLon();
                return pLat >= bbox[0] && pLat <= bbox[1] && pLon >= bbox[2] && pLon <= bbox[3];
            })
            .filter(p -> {
                // Check actual distance with Haversine
                double distance = GeoUtil.calculateDistance(searchLat, searchLon, 
                    p.getLastSeenLat(), p.getLastSeenLon());
                return distance <= searchRadius;
            })
            .collect(Collectors.toList());

        log.info("Found {} candidate users for suggestions within {}km", 
                 candidateProfiles.size(), searchRadius);

        // Score and rank candidates
        List<ScoredSuggestion> scoredSuggestions = candidateProfiles.stream()
            .map(profile -> scoreSuggestion(profile, userInterestIds, topInterestId, 
                                            searchLat, searchLon))
            .sorted(Comparator.comparingInt(ScoredSuggestion::getScore).reversed())
            .limit(limit)
            .collect(Collectors.toList());

        // Convert to response DTOs
        return scoredSuggestions.stream()
            .map(this::buildSuggestionResponse)
            .collect(Collectors.toList());
    }

    private ScoredSuggestion scoreSuggestion(UserProfile profile, Set<Integer> userInterestIds,
                                              Integer topInterestId, double userLat, double userLon) {
        int score = 0;
        List<String> sharedInterestNames = new ArrayList<>();
        List<String> reasons = new ArrayList<>();

        // Get candidate's interests
        Set<Interest> candidateInterests = profile.getInterests();
        Set<Integer> candidateInterestIds = candidateInterests.stream()
            .map(Interest::getId)
            .collect(Collectors.toSet());

        // Check for same top interest (+40)
        if (topInterestId != null && candidateInterestIds.contains(topInterestId)) {
            score += SAME_TOP_INTEREST_SCORE;
        }

        // Count shared interests
        for (Interest interest : candidateInterests) {
            if (userInterestIds.contains(interest.getId())) {
                sharedInterestNames.add(interest.getName());
            }
        }

        // +20 for 2+ shared interests
        if (sharedInterestNames.size() >= 2) {
            score += SHARED_INTERESTS_2_PLUS_SCORE;
        }

        // Calculate distance
        double distance = 0;
        if (profile.getLastSeenLat() != null && profile.getLastSeenLon() != null) {
            distance = GeoUtil.calculateDistance(userLat, userLon, 
                profile.getLastSeenLat(), profile.getLastSeenLon());
            
            // +20 for close distance (< 3km)
            if (distance < 3) {
                score += CLOSE_DISTANCE_SCORE;
                reasons.add(String.format("%.1f km away", distance));
            } else {
                reasons.add(String.format("%.0f km away", distance));
            }
        }

        // +10 for recently active (last 48 hours)
        boolean recentlyActive = false;
        if (profile.getLastSeenAt() != null) {
            LocalDateTime cutoff = LocalDateTime.now().minusHours(48);
            recentlyActive = profile.getLastSeenAt().isAfter(cutoff);
            if (recentlyActive) {
                score += RECENTLY_ACTIVE_SCORE;
                reasons.add("active today");
            }
        }

        // +10 for high trust level (4+)
        if (profile.getTrustLevel() != null && profile.getTrustLevel() >= 4) {
            score += HIGH_TRUST_BONUS;
        }

        // Build "why suggested" string
        String whySuggested = buildWhySuggested(sharedInterestNames, reasons);

        return new ScoredSuggestion(profile, score, sharedInterestNames, distance, 
                                     whySuggested, recentlyActive);
    }

    private String buildWhySuggested(List<String> sharedInterests, List<String> reasons) {
        StringBuilder sb = new StringBuilder();

        // Add shared interests
        if (!sharedInterests.isEmpty()) {
            if (sharedInterests.size() == 1) {
                sb.append("Both into ").append(sharedInterests.get(0));
            } else if (sharedInterests.size() == 2) {
                sb.append("Both into ").append(sharedInterests.get(0))
                  .append(" and ").append(sharedInterests.get(1));
            } else {
                sb.append("Both into ").append(sharedInterests.get(0))
                  .append(", ").append(sharedInterests.get(1))
                  .append(" +").append(sharedInterests.size() - 2).append(" more");
            }
        }

        // Add other reasons
        if (!reasons.isEmpty()) {
            if (sb.length() > 0) {
                sb.append(" • ");
            }
            sb.append(String.join(" • ", reasons));
        }

        return sb.toString();
    }

    private PeopleSuggestionResponse buildSuggestionResponse(ScoredSuggestion suggestion) {
        UserProfile profile = suggestion.getProfile();

        return PeopleSuggestionResponse.builder()
            .userId(profile.getUserId())
            .alias(profile.getAlias())
            .avatarUrl(profile.getAvatarUrlAlias())
            .sharedInterests(suggestion.getSharedInterests())
            .distanceKm(Math.round(suggestion.getDistance() * 10.0) / 10.0)
            .whySuggested(suggestion.getWhySuggested())
            .trustLevel(profile.getTrustLevel())
            .recentlyActive(suggestion.isRecentlyActive())
            .score(suggestion.getScore())
            .bio(profile.getBio())
            .build();
    }

    // Helper class for scoring
    private static class ScoredSuggestion {
        private final UserProfile profile;
        private final int score;
        private final List<String> sharedInterests;
        private final double distance;
        private final String whySuggested;
        private final boolean recentlyActive;

        public ScoredSuggestion(UserProfile profile, int score, List<String> sharedInterests,
                                 double distance, String whySuggested, boolean recentlyActive) {
            this.profile = profile;
            this.score = score;
            this.sharedInterests = sharedInterests;
            this.distance = distance;
            this.whySuggested = whySuggested;
            this.recentlyActive = recentlyActive;
        }

        public UserProfile getProfile() { return profile; }
        public int getScore() { return score; }
        public List<String> getSharedInterests() { return sharedInterests; }
        public double getDistance() { return distance; }
        public String getWhySuggested() { return whySuggested; }
        public boolean isRecentlyActive() { return recentlyActive; }
    }
}
