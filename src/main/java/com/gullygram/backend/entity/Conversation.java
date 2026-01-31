package com.gullygram.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "conversation")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Conversation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user1_id", nullable = false)
    private User user1;

    @ManyToOne(fetch =FetchType.LAZY)
    @JoinColumn(name = "user2_id", nullable = false)
    private User user2;

    @Column(name = "last_message_at")
    private LocalDateTime lastMessageAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    /**
     * Get the other user in the conversation (not the current user)
     */
    public User getOtherUser(UUID currentUserId) {
        if (user1.getId().equals(currentUserId)) {
            return user2;
        } else if (user2.getId().equals(currentUserId)) {
            return user1;
        }
        throw new IllegalArgumentException("User " + currentUserId + " is not part of this conversation");
    }

    /**
     * Check if a user is part of this conversation
     */
    public boolean includes(UUID userId) {
        return user1.getId().equals(userId) || user2.getId().equals(userId);
    }
}
