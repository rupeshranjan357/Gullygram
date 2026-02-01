package com.gullygram.backend.service;

import com.gullygram.backend.dto.request.FriendRequestDTO;
import com.gullygram.backend.dto.response.RelationshipResponse;
import com.gullygram.backend.dto.response.UserSummary;
import com.gullygram.backend.entity.Notification;
import com.gullygram.backend.entity.Relationship;
import com.gullygram.backend.entity.Relationship.RelationshipStatus;
import com.gullygram.backend.entity.User;
import com.gullygram.backend.entity.UserProfile;
import com.gullygram.backend.exception.BadRequestException;
import com.gullygram.backend.exception.ResourceNotFoundException;
import com.gullygram.backend.repository.RelationshipRepository;
import com.gullygram.backend.repository.UserProfileRepository;
import com.gullygram.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RelationshipService {

    private final RelationshipRepository relationshipRepository;
    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final AuthorViewService authorViewService;
    private final NotificationService notificationService;

    /**
     * Send a friend request to another user
     */
    @Transactional
    public RelationshipResponse sendFriendRequest(UUID requesterId, FriendRequestDTO request) {
        UUID receiverId = request.getReceiverId();

        // Validate not sending to self
        if (requesterId.equals(receiverId)) {
            throw new BadRequestException("Cannot send friend request to yourself");
        }

        // Check receiver exists
        User receiver = userRepository.findById(receiverId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        User requester = userRepository.findById(requesterId)
            .orElseThrow(() -> new ResourceNotFoundException("Requester not found"));

        // Check if blocked (either direction)
        if (relationshipRepository.isBlockedBetween(requesterId, receiverId)) {
            throw new BadRequestException("Cannot send friend request to this user");
        }

        // Check for existing relationship
        Optional<Relationship> existing = relationshipRepository
            .findRelationshipBetweenUsers(requesterId, receiverId);

        if (existing.isPresent()) {
            Relationship rel = existing.get();
            switch (rel.getStatus()) {
                case ACCEPTED:
                    throw new BadRequestException("You are already friends with this user");
                case REQUESTED:
                    if (rel.getRequester().getId().equals(requesterId)) {
                        throw new BadRequestException("Friend request already sent");
                    } else {
                        // They sent us a request, auto-accept!
                        return acceptFriendRequestInternal(requesterId, rel);
                    }
                case REJECTED:
                    // Allow re-sending after rejection
                    relationshipRepository.delete(rel);
                    break;
                case BLOCKED:
                    throw new BadRequestException("Cannot send friend request to this user");
            }
        }

        // Create new friend request
        Relationship relationship = Relationship.builder()
            .requester(requester)
            .receiver(receiver)
            .status(RelationshipStatus.REQUESTED)
            .message(request.getMessage())
            .build();

        Relationship saved = relationshipRepository.save(relationship);
        log.info("User {} sent friend request to user {}", requesterId, receiverId);
        
        
        // Create notification for receiver
        UserProfile requesterProfile = userProfileRepository.findByUserId(requesterId).orElse(null);
        String requesterAlias = requesterProfile != null ? requesterProfile.getAlias() : "Someone";
        notificationService.createNotification(
            receiverId,
            Notification. NotificationType.FRIEND_REQUEST,
            requesterId,
            "RELATIONSHIP",
            saved.getId(),
            requesterAlias + " sent you a friend request"
        );

        return buildRelationshipResponse(saved, requesterId);
    }

    /**
     * Accept a friend request
     */
    @Transactional
    public RelationshipResponse acceptFriendRequest(UUID userId, UUID relationshipId) {
        Relationship relationship = relationshipRepository.findById(relationshipId)
            .orElseThrow(() -> new ResourceNotFoundException("Friend request not found"));

        // Verify the current user is the receiver of this request
        if (!relationship.getReceiver().getId().equals(userId)) {
            throw new BadRequestException("You can only accept requests sent to you");
        }

        if (relationship.getStatus() != RelationshipStatus.REQUESTED) {
            throw new BadRequestException("This request is no longer pending");
        }

        return acceptFriendRequestInternal(userId, relationship);
    }

    private RelationshipResponse acceptFriendRequestInternal(UUID userId, Relationship relationship) {
        relationship.setStatus(RelationshipStatus.ACCEPTED);
        Relationship saved = relationshipRepository.save(relationship);
        
        log.info("User {} accepted friend request from user {}", 
                 relationship.getReceiver().getId(), relationship.getRequester().getId());
        
        
        // Create notification for requester
        UserProfile accepterProfile = userProfileRepository.findByUserId(relationship.getReceiver().getId()).orElse(null);
        String accepterAlias = accepterProfile != null ? accepterProfile.getAlias() : "Someone";
        notificationService.createNotification(
            relationship.getRequester().getId(),
            Notification.NotificationType.FRIEND_ACCEPT,
            relationship.getReceiver().getId(),
            "RELATIONSHIP",
            saved.getId(),
            accepterAlias + " accepted your friend request"
        );

        return buildRelationshipResponse(saved, userId);
    }

    /**
     * Reject a friend request
     */
    @Transactional
    public void rejectFriendRequest(UUID userId, UUID relationshipId) {
        Relationship relationship = relationshipRepository.findById(relationshipId)
            .orElseThrow(() -> new ResourceNotFoundException("Friend request not found"));

        // Verify the current user is the receiver of this request
        if (!relationship.getReceiver().getId().equals(userId)) {
            throw new BadRequestException("You can only reject requests sent to you");
        }

        if (relationship.getStatus() != RelationshipStatus.REQUESTED) {
            throw new BadRequestException("This request is no longer pending");
        }

        relationship.setStatus(RelationshipStatus.REJECTED);
        relationshipRepository.save(relationship);
        
        log.info("User {} rejected friend request from user {}", 
                 userId, relationship.getRequester().getId());
    }

    /**
     * Cancel a sent friend request
     */
    @Transactional
    public void cancelFriendRequest(UUID userId, UUID relationshipId) {
        Relationship relationship = relationshipRepository.findById(relationshipId)
            .orElseThrow(() -> new ResourceNotFoundException("Friend request not found"));

        // Verify the current user is the requester
        if (!relationship.getRequester().getId().equals(userId)) {
            throw new BadRequestException("You can only cancel requests you sent");
        }

        if (relationship.getStatus() != RelationshipStatus.REQUESTED) {
            throw new BadRequestException("This request is no longer pending");
        }

        relationshipRepository.delete(relationship);
        log.info("User {} cancelled friend request to user {}", 
                 userId, relationship.getReceiver().getId());
    }

    /**
     * Remove a friend (unfriend)
     */
    @Transactional
    public void removeFriend(UUID userId, UUID friendId) {
        Optional<Relationship> relationship = relationshipRepository
            .findFriendshipBetweenUsers(userId, friendId);

        if (relationship.isEmpty()) {
            throw new BadRequestException("You are not friends with this user");
        }

        relationshipRepository.delete(relationship.get());
        log.info("User {} removed friend {}", userId, friendId);
    }

    /**
     * Block a user
     */
    @Transactional
    public void blockUser(UUID blockerId, UUID blockedId) {
        if (blockerId.equals(blockedId)) {
            throw new BadRequestException("Cannot block yourself");
        }

        User blockedUser = userRepository.findById(blockedId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        User blocker = userRepository.findById(blockerId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Check if already blocked
        if (relationshipRepository.hasBlocked(blockerId, blockedId)) {
            throw new BadRequestException("User is already blocked");
        }

        // Remove any existing relationship first
        Optional<Relationship> existing = relationshipRepository
            .findRelationshipBetweenUsers(blockerId, blockedId);
        existing.ifPresent(relationshipRepository::delete);

        // Create block relationship
        Relationship block = Relationship.builder()
            .requester(blocker)
            .receiver(blockedUser)
            .status(RelationshipStatus.BLOCKED)
            .build();

        relationshipRepository.save(block);
        log.info("User {} blocked user {}", blockerId, blockedId);
    }

    /**
     * Unblock a user
     */
    @Transactional
    public void unblockUser(UUID blockerId, UUID blockedId) {
        Relationship block = relationshipRepository
            .findByRequesterIdAndReceiverId(blockerId, blockedId)
            .filter(r -> r.getStatus() == RelationshipStatus.BLOCKED)
            .orElseThrow(() -> new BadRequestException("User is not blocked"));

        relationshipRepository.delete(block);
        log.info("User {} unblocked user {}", blockerId, blockedId);
    }

    /**
     * Get all friends for a user
     */
    @Transactional(readOnly = true)
    public List<RelationshipResponse> getFriends(UUID userId) {
        List<Relationship> friends = relationshipRepository.findFriendsByUserId(userId);
        
        return friends.stream()
            .map(rel -> buildRelationshipResponse(rel, userId))
            .collect(Collectors.toList());
    }

    /**
     * Get pending friend requests received by user
     */
    @Transactional(readOnly = true)
    public List<RelationshipResponse> getPendingRequestsReceived(UUID userId) {
        List<Relationship> requests = relationshipRepository.findPendingRequestsReceived(userId);
        
        return requests.stream()
            .map(rel -> buildRelationshipResponse(rel, userId))
            .collect(Collectors.toList());
    }

    /**
     * Get pending friend requests sent by user
     */
    @Transactional(readOnly = true)
    public List<RelationshipResponse> getPendingRequestsSent(UUID userId) {
        List<Relationship> requests = relationshipRepository.findPendingRequestsSent(userId);
        
        return requests.stream()
            .map(rel -> buildRelationshipResponse(rel, userId))
            .collect(Collectors.toList());
    }

    /**
     * Get relationship status between two users
     */
    @Transactional(readOnly = true)
    public String getRelationshipStatus(UUID userId1, UUID userId2) {
        if (userId1.equals(userId2)) {
            return "SELF";
        }

        Optional<Relationship> relationship = relationshipRepository
            .findRelationshipBetweenUsers(userId1, userId2);

        if (relationship.isEmpty()) {
            return "NONE";
        }

        return relationship.get().getStatus().name();
    }

    /**
     * Check if two users are friends
     */
    @Transactional(readOnly = true)
    public boolean areFriends(UUID userId1, UUID userId2) {
        if (userId1.equals(userId2)) {
            return false;
        }
        return relationshipRepository.areFriends(userId1, userId2);
    }

    /**
     * Check if user A has blocked user B
     */
    @Transactional(readOnly = true)
    public boolean hasBlocked(UUID blockerId, UUID blockedId) {
        return relationshipRepository.hasBlocked(blockerId, blockedId);
    }

    /**
     * Check if there's any block between two users
     */
    @Transactional(readOnly = true)
    public boolean isBlockedBetween(UUID userId1, UUID userId2) {
        return relationshipRepository.isBlockedBetween(userId1, userId2);
    }

    /**
     * Get count of friends
     */
    @Transactional(readOnly = true)
    public long getFriendsCount(UUID userId) {
        return relationshipRepository.countFriends(userId);
    }

    /**
     * Get count of pending requests
     */
    @Transactional(readOnly = true)
    public long getPendingRequestsCount(UUID userId) {
        return relationshipRepository.countPendingRequests(userId);
    }

    /**
     * Get list of friend user IDs
     */
    @Transactional(readOnly = true)
    public List<UUID> getFriendUserIds(UUID userId) {
        return relationshipRepository.findFriendUserIds(userId);
    }

    /**
     * Get list of blocked user IDs
     */
    @Transactional(readOnly = true)
    public List<UUID> getBlockedUserIds(UUID userId) {
        return relationshipRepository.findBlockedUserIds(userId);
    }

    // Helper method to build response
    private RelationshipResponse buildRelationshipResponse(Relationship relationship, UUID currentUserId) {
        // Determine the "other" user
        User otherUser;
        String direction;
        
        if (relationship.getRequester().getId().equals(currentUserId)) {
            otherUser = relationship.getReceiver();
            direction = "SENT";
        } else {
            otherUser = relationship.getRequester();
            direction = "RECEIVED";
        }

        // Get current user's location for distance calculation
        UserProfile currentProfile = userProfileRepository.findByUserId(currentUserId).orElse(null);
        Double lat = currentProfile != null ? currentProfile.getLastSeenLat() : null;
        Double lon = currentProfile != null ? currentProfile.getLastSeenLon() : null;

        // Build user summary based on relationship status
        UserSummary userSummary;
        if (relationship.getStatus() == RelationshipStatus.ACCEPTED) {
            userSummary = authorViewService.buildFriendSummary(otherUser, lat, lon);
        } else {
            userSummary = authorViewService.buildStrangerSummary(otherUser, lat, lon);
        }

        return RelationshipResponse.builder()
            .id(relationship.getId())
            .user(userSummary)
            .status(relationship.getStatus().name())
            .direction(direction)
            .message(relationship.getMessage())
            .createdAt(relationship.getCreatedAt())
            .updatedAt(relationship.getUpdatedAt())
            .build();
    }
}
