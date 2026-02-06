package com.gullygram.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "relationship")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Relationship {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requester_id", nullable = false)
    private User requester;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "receiver_id", nullable = false)
    private User receiver;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private RelationshipStatus status = RelationshipStatus.REQUESTED;

    @Column(columnDefinition = "TEXT")
    private String message;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum RelationshipStatus {
        REQUESTED,  // Friend request sent, pending response
        ACCEPTED,   // Both users are friends
        REJECTED,   // Request was rejected
        BLOCKED     // User blocked another user
    }

    /**
     * Check if this relationship represents an active friendship
     */
    public boolean isFriendship() {
        return status == RelationshipStatus.ACCEPTED;
    }

    /**
     * Check if this is a pending request
     */
    public boolean isPending() {
        return status == RelationshipStatus.REQUESTED;
    }

    /**
     * Check if this represents a block
     */
    public boolean isBlock() {
        return status == RelationshipStatus.BLOCKED;
    }

    public User getRequester() {
        return requester;
    }

    public void setRequester(User requester) {
        this.requester = requester;
    }

    public User getReceiver() {
        return receiver;
    }

    public void setReceiver(User receiver) {
        this.receiver = receiver;
    }
}
