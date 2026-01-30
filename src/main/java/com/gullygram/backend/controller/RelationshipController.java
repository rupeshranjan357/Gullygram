package com.gullygram.backend.controller;

import com.gullygram.backend.dto.request.FriendRequestDTO;
import com.gullygram.backend.dto.response.ApiResponse;
import com.gullygram.backend.dto.response.RelationshipResponse;
import com.gullygram.backend.security.CurrentUser;
import com.gullygram.backend.service.RelationshipService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class RelationshipController {

    private final RelationshipService relationshipService;
    private final CurrentUser currentUser;

    /**
     * Send a friend request to another user
     */
    @PostMapping("/relationships/request")
    public ResponseEntity<ApiResponse<RelationshipResponse>> sendFriendRequest(
            @Valid @RequestBody FriendRequestDTO request) {
        UUID userId = currentUser.getUserId();
        RelationshipResponse response = relationshipService.sendFriendRequest(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Friend request sent", response));
    }

    /**
     * Accept a friend request
     */
    @PostMapping("/relationships/{id}/accept")
    public ResponseEntity<ApiResponse<RelationshipResponse>> acceptFriendRequest(
            @PathVariable UUID id) {
        UUID userId = currentUser.getUserId();
        RelationshipResponse response = relationshipService.acceptFriendRequest(userId, id);
        return ResponseEntity.ok(ApiResponse.success("Friend request accepted", response));
    }

    /**
     * Reject a friend request
     */
    @PostMapping("/relationships/{id}/reject")
    public ResponseEntity<ApiResponse<Void>> rejectFriendRequest(@PathVariable UUID id) {
        UUID userId = currentUser.getUserId();
        relationshipService.rejectFriendRequest(userId, id);
        return ResponseEntity.ok(ApiResponse.success("Friend request rejected", null));
    }

    /**
     * Cancel a sent friend request
     */
    @DeleteMapping("/relationships/{id}")
    public ResponseEntity<ApiResponse<Void>> cancelFriendRequest(@PathVariable UUID id) {
        UUID userId = currentUser.getUserId();
        relationshipService.cancelFriendRequest(userId, id);
        return ResponseEntity.ok(ApiResponse.success("Friend request cancelled", null));
    }

    /**
     * Remove a friend (unfriend)
     */
    @DeleteMapping("/relationships/friend/{friendId}")
    public ResponseEntity<ApiResponse<Void>> removeFriend(@PathVariable UUID friendId) {
        UUID userId = currentUser.getUserId();
        relationshipService.removeFriend(userId, friendId);
        return ResponseEntity.ok(ApiResponse.success("Friend removed", null));
    }

    /**
     * Get all friends
     */
    @GetMapping("/relationships")
    public ResponseEntity<ApiResponse<List<RelationshipResponse>>> getFriends() {
        UUID userId = currentUser.getUserId();
        List<RelationshipResponse> friends = relationshipService.getFriends(userId);
        return ResponseEntity.ok(ApiResponse.success("Success", friends));
    }

    /**
     * Get pending friend requests received
     */
    @GetMapping("/relationships/requests")
    public ResponseEntity<ApiResponse<List<RelationshipResponse>>> getPendingRequests() {
        UUID userId = currentUser.getUserId();
        List<RelationshipResponse> requests = relationshipService.getPendingRequestsReceived(userId);
        return ResponseEntity.ok(ApiResponse.success("Success", requests));
    }

    /**
     * Get sent friend requests
     */
    @GetMapping("/relationships/sent")
    public ResponseEntity<ApiResponse<List<RelationshipResponse>>> getSentRequests() {
        UUID userId = currentUser.getUserId();
        List<RelationshipResponse> requests = relationshipService.getPendingRequestsSent(userId);
        return ResponseEntity.ok(ApiResponse.success("Success", requests));
    }

    /**
     * Get relationship counts (friends, pending requests)
     */
    @GetMapping("/relationships/counts")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getRelationshipCounts() {
        UUID userId = currentUser.getUserId();
        Map<String, Long> counts = new HashMap<>();
        counts.put("friends", relationshipService.getFriendsCount(userId));
        counts.put("pendingRequests", relationshipService.getPendingRequestsCount(userId));
        return ResponseEntity.ok(ApiResponse.success("Success", counts));
    }

    /**
     * Get relationship status with another user
     */
    @GetMapping("/relationships/status/{targetUserId}")
    public ResponseEntity<ApiResponse<Map<String, String>>> getRelationshipStatus(
            @PathVariable UUID targetUserId) {
        UUID userId = currentUser.getUserId();
        String status = relationshipService.getRelationshipStatus(userId, targetUserId);
        Map<String, String> result = new HashMap<>();
        result.put("status", status);
        return ResponseEntity.ok(ApiResponse.success("Success", result));
    }

    /**
     * Block a user
     */
    @PostMapping("/block/{userId}")
    public ResponseEntity<ApiResponse<Void>> blockUser(@PathVariable UUID userId) {
        UUID currentUserId = currentUser.getUserId();
        relationshipService.blockUser(currentUserId, userId);
        return ResponseEntity.ok(ApiResponse.success("User blocked", null));
    }

    /**
     * Unblock a user
     */
    @DeleteMapping("/block/{userId}")
    public ResponseEntity<ApiResponse<Void>> unblockUser(@PathVariable UUID userId) {
        UUID currentUserId = currentUser.getUserId();
        relationshipService.unblockUser(currentUserId, userId);
        return ResponseEntity.ok(ApiResponse.success("User unblocked", null));
    }
}
