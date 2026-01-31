package com.gullygram.backend.repository;

import com.gullygram.backend.entity.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, UUID> {

    /**
     * Find all conversations for a user, ordered by last message time
     */
    @Query("SELECT c FROM Conversation c WHERE " +
           "c.user1.id = :userId OR c.user2.id = :userId " +
           "ORDER BY c.lastMessageAt DESC NULLS LAST, c.createdAt DESC")
    List<Conversation> findByUserId(@Param("userId") UUID userId);

    /**
     * Find conversation between two users (order-independent)
     */
    @Query("SELECT c FROM Conversation c WHERE " +
           "(c.user1.id = :userId1 AND c.user2.id = :userId2) OR " +
           "(c.user1.id = :userId2 AND c.user2.id = :userId1)")
    Optional<Conversation> findByUsers(@Param("userId1") UUID userId1, 
                                       @Param("userId2") UUID userId2);
}
