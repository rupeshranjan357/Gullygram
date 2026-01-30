package com.gullygram.backend.service;

import com.gullygram.backend.dto.response.AuthorView;
import com.gullygram.backend.dto.response.UserSummary;
import com.gullygram.backend.entity.User;
import com.gullygram.backend.entity.UserProfile;
import com.gullygram.backend.repository.RelationshipRepository;
import com.gullygram.backend.repository.UserProfileRepository;
import com.gullygram.backend.util.GeoUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Service for building author/user views that respect privacy based on relationships.
 * 
 * Identity Reveal Rules:
 * - Self: Always see full profile (real name, real avatar)
 * - Friends (ACCEPTED relationship): See real name and real avatar
 * - Strangers: Only see alias and alias avatar
 * - Blocked: Should not see each other at all
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuthorViewService {

    private final RelationshipRepository relationshipRepository;
    private final UserProfileRepository userProfileRepository;

    /**
     * Build an AuthorView for displaying post/comment authors.
     * Respects privacy based on viewer's relationship with the author.
     */
    @Transactional(readOnly = true)
    public AuthorView buildAuthorView(UUID viewerId, User author) {
        if (author == null) {
            return null;
        }

        UserProfile profile = author.getProfile();
        if (profile == null) {
            return AuthorView.builder()
                .userId(author.getId())
                .alias("unknown")
                .build();
        }

        boolean isSelf = viewerId != null && viewerId.equals(author.getId());
        boolean isFriend = !isSelf && viewerId != null && 
                           relationshipRepository.areFriends(viewerId, author.getId());
        
        // Determine what identity info to reveal
        boolean revealIdentity = isSelf || isFriend;

        return AuthorView.builder()
            .userId(author.getId())
            .alias(profile.getAlias())
            .avatarUrl(profile.getAvatarUrlAlias())
            .realName(revealIdentity ? profile.getRealName() : null)
            .realAvatarUrl(revealIdentity ? profile.getAvatarUrlReal() : null)
            .isFriend(isFriend)
            .trustLevel(profile.getTrustLevel())
            .build();
    }

    /**
     * Build a UserSummary for lists (friends, suggestions, etc.)
     * Includes optional distance calculation.
     */
    @Transactional(readOnly = true)
    public UserSummary buildUserSummary(UUID viewerId, User targetUser, 
                                         Double viewerLat, Double viewerLon) {
        if (targetUser == null) {
            return null;
        }

        UserProfile profile = targetUser.getProfile();
        if (profile == null) {
            return UserSummary.builder()
                .userId(targetUser.getId())
                .alias("unknown")
                .build();
        }

        boolean isSelf = viewerId != null && viewerId.equals(targetUser.getId());
        boolean isFriend = !isSelf && viewerId != null && 
                           relationshipRepository.areFriends(viewerId, targetUser.getId());
        
        boolean revealIdentity = isSelf || isFriend;

        // Calculate distance if coordinates provided
        Double distance = null;
        if (viewerLat != null && viewerLon != null && 
            profile.getLastSeenLat() != null && profile.getLastSeenLon() != null) {
            distance = GeoUtil.calculateDistance(
                viewerLat, viewerLon,
                profile.getLastSeenLat(), profile.getLastSeenLon()
            );
        }

        return UserSummary.builder()
            .userId(targetUser.getId())
            .alias(profile.getAlias())
            .avatarUrl(profile.getAvatarUrlAlias())
            .realName(revealIdentity ? profile.getRealName() : null)
            .realAvatarUrl(revealIdentity ? profile.getAvatarUrlReal() : null)
            .isFriend(isFriend)
            .distanceKm(distance != null ? Math.round(distance * 10.0) / 10.0 : null) // Round to 1 decimal
            .trustLevel(profile.getTrustLevel())
            .bio(profile.getBio())
            .build();
    }

    /**
     * Build a UserSummary specifically for a friend (always reveals identity)
     */
    public UserSummary buildFriendSummary(User friend, Double viewerLat, Double viewerLon) {
        if (friend == null) {
            return null;
        }

        UserProfile profile = friend.getProfile();
        if (profile == null) {
            return UserSummary.builder()
                .userId(friend.getId())
                .alias("unknown")
                .isFriend(true)
                .build();
        }

        // Calculate distance if coordinates provided
        Double distance = null;
        if (viewerLat != null && viewerLon != null && 
            profile.getLastSeenLat() != null && profile.getLastSeenLon() != null) {
            distance = GeoUtil.calculateDistance(
                viewerLat, viewerLon,
                profile.getLastSeenLat(), profile.getLastSeenLon()
            );
        }

        return UserSummary.builder()
            .userId(friend.getId())
            .alias(profile.getAlias())
            .avatarUrl(profile.getAvatarUrlAlias())
            .realName(profile.getRealName())  // Always reveal for friends
            .realAvatarUrl(profile.getAvatarUrlReal())
            .isFriend(true)
            .distanceKm(distance != null ? Math.round(distance * 10.0) / 10.0 : null)
            .trustLevel(profile.getTrustLevel())
            .bio(profile.getBio())
            .build();
    }

    /**
     * Build a UserSummary for a stranger (never reveals identity)
     */
    public UserSummary buildStrangerSummary(User user, Double viewerLat, Double viewerLon) {
        if (user == null) {
            return null;
        }

        UserProfile profile = user.getProfile();
        if (profile == null) {
            return UserSummary.builder()
                .userId(user.getId())
                .alias("unknown")
                .isFriend(false)
                .build();
        }

        // Calculate distance if coordinates provided
        Double distance = null;
        if (viewerLat != null && viewerLon != null && 
            profile.getLastSeenLat() != null && profile.getLastSeenLon() != null) {
            distance = GeoUtil.calculateDistance(
                viewerLat, viewerLon,
                profile.getLastSeenLat(), profile.getLastSeenLon()
            );
        }

        return UserSummary.builder()
            .userId(user.getId())
            .alias(profile.getAlias())
            .avatarUrl(profile.getAvatarUrlAlias())
            .realName(null)  // Never reveal for strangers
            .realAvatarUrl(null)
            .isFriend(false)
            .distanceKm(distance != null ? Math.round(distance * 10.0) / 10.0 : null)
            .trustLevel(profile.getTrustLevel())
            .bio(profile.getBio())
            .build();
    }
}
