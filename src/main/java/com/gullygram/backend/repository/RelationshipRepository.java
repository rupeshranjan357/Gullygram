package com.gullygram.backend.repository;

import com.gullygram.backend.entity.Relationship;
import com.gullygram.backend.entity.Relationship.RelationshipStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RelationshipRepository extends JpaRepository<Relationship, UUID> {

    /**
     * Find a relationship where user A is requester and user B is receiver
     */
    Optional<Relationship> findByRequesterIdAndReceiverId(UUID requesterId, UUID receiverId);

    /**
     * Find any relationship between two users (in either direction)
     */
    @Query("SELECT r FROM Relationship r WHERE " +
           "(r.requester.id = :userId1 AND r.receiver.id = :userId2) OR " +
           "(r.requester.id = :userId2 AND r.receiver.id = :userId1)")
    Optional<Relationship> findRelationshipBetweenUsers(@Param("userId1") UUID userId1, 
                                                         @Param("userId2") UUID userId2);

    /**
     * Find friendship between two users (ACCEPTED status in either direction)
     */
    @Query("SELECT r FROM Relationship r WHERE " +
           "r.status = 'ACCEPTED' AND (" +
           "(r.requester.id = :userId1 AND r.receiver.id = :userId2) OR " +
           "(r.requester.id = :userId2 AND r.receiver.id = :userId1))")
    Optional<Relationship> findFriendshipBetweenUsers(@Param("userId1") UUID userId1, 
                                                       @Param("userId2") UUID userId2);

    /**
     * Check if two users are friends
     */
    @Query("SELECT COUNT(r) > 0 FROM Relationship r WHERE " +
           "r.status = 'ACCEPTED' AND (" +
           "(r.requester.id = :userId1 AND r.receiver.id = :userId2) OR " +
           "(r.requester.id = :userId2 AND r.receiver.id = :userId1))")
    boolean areFriends(@Param("userId1") UUID userId1, @Param("userId2") UUID userId2);

    /**
     * Get all friends for a user (ACCEPTED relationships in either direction)
     */
    @Query("SELECT r FROM Relationship r WHERE " +
           "r.status = 'ACCEPTED' AND " +
           "(r.requester.id = :userId OR r.receiver.id = :userId)")
    List<Relationship> findFriendsByUserId(@Param("userId") UUID userId);

    /**
     * Get pending friend requests received by user
     */
    @Query("SELECT r FROM Relationship r WHERE " +
           "r.receiver.id = :userId AND r.status = 'REQUESTED' " +
           "ORDER BY r.createdAt DESC")
    List<Relationship> findPendingRequestsReceived(@Param("userId") UUID userId);

    /**
     * Get pending friend requests sent by user
     */
    @Query("SELECT r FROM Relationship r WHERE " +
           "r.requester.id = :userId AND r.status = 'REQUESTED' " +
           "ORDER BY r.createdAt DESC")
    List<Relationship> findPendingRequestsSent(@Param("userId") UUID userId);

    /**
     * Check if user A has blocked user B
     */
    @Query("SELECT COUNT(r) > 0 FROM Relationship r WHERE " +
           "r.requester.id = :blockerId AND r.receiver.id = :blockedId AND r.status = 'BLOCKED'")
    boolean hasBlocked(@Param("blockerId") UUID blockerId, @Param("blockedId") UUID blockedId);

    /**
     * Check if there's any block between two users (either direction)
     */
    @Query("SELECT COUNT(r) > 0 FROM Relationship r WHERE " +
           "r.status = 'BLOCKED' AND (" +
           "(r.requester.id = :userId1 AND r.receiver.id = :userId2) OR " +
           "(r.requester.id = :userId2 AND r.receiver.id = :userId1))")
    boolean isBlockedBetween(@Param("userId1") UUID userId1, @Param("userId2") UUID userId2);

    /**
     * Get list of user IDs that have blocked the given user or are blocked by them
     */
    @Query("SELECT CASE WHEN r.requester.id = :userId THEN r.receiver.id ELSE r.requester.id END " +
           "FROM Relationship r WHERE " +
           "r.status = 'BLOCKED' AND (r.requester.id = :userId OR r.receiver.id = :userId)")
    List<UUID> findBlockedUserIds(@Param("userId") UUID userId);

    /**
     * Get list of friend user IDs for a user
     */
    @Query("SELECT CASE WHEN r.requester.id = :userId THEN r.receiver.id ELSE r.requester.id END " +
           "FROM Relationship r WHERE " +
           "r.status = 'ACCEPTED' AND (r.requester.id = :userId OR r.receiver.id = :userId)")
    List<UUID> findFriendUserIds(@Param("userId") UUID userId);

    /**
     * Count friends for a user
     */
    @Query("SELECT COUNT(r) FROM Relationship r WHERE " +
           "r.status = 'ACCEPTED' AND (r.requester.id = :userId OR r.receiver.id = :userId)")
    long countFriends(@Param("userId") UUID userId);

    /**
     * Count pending requests received
     */
    @Query("SELECT COUNT(r) FROM Relationship r WHERE " +
           "r.receiver.id = :userId AND r.status = 'REQUESTED'")
    long countPendingRequests(@Param("userId") UUID userId);

    /**
     * Delete relationship by requester and receiver
     */
    void deleteByRequesterIdAndReceiverId(UUID requesterId, UUID receiverId);

    /**
     * Check if a pending request exists from user A to user B
     */
    @Query("SELECT COUNT(r) > 0 FROM Relationship r WHERE " +
           "r.requester.id = :requesterId AND r.receiver.id = :receiverId AND r.status = 'REQUESTED'")
    boolean existsPendingRequest(@Param("requesterId") UUID requesterId, @Param("receiverId") UUID receiverId);
}
