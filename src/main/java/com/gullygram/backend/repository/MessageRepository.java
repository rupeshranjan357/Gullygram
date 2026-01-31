package com.gullygram.backend.repository;

import com.gullygram.backend.entity.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MessageRepository extends JpaRepository<Message, UUID> {

    /**
     * Find messages in a conversation (excludes soft-deleted messages)
     */
    @Query("SELECT m FROM Message m WHERE " +
           "m.conversation.id = :conversationId AND m.deletedAt IS NULL " +
           "ORDER BY m.createdAt DESC")
    Page<Message> findByConversationId(@Param("conversationId") UUID conversationId, 
                                        Pageable pageable);

    /**
     * Count unread messages for a user in a conversation
     */
    @Query("SELECT COUNT(m) FROM Message m WHERE " +
           "m.conversation.id = :conversationId AND " +
           "m.sender.id != :userId AND " +
           "m.readAt IS NULL AND " +
           "m.deletedAt IS NULL")
    int countUnreadMessages(@Param("conversationId") UUID conversationId, 
                            @Param("userId") UUID userId);

    /**
     * Find unread messages for a user in a conversation
     */
    @Query("SELECT m FROM Message m WHERE " +
           "m.conversation.id = :conversationId AND " +
           "m.sender.id != :userId AND " +
           "m.readAt IS NULL AND " +
           "m.deletedAt IS NULL")
    List<Message> findUnreadMessages(@Param("conversationId") UUID conversationId, 
                                      @Param("userId") UUID userId);

    /**
     * Get the last message in a conversation
     */
    @Query("SELECT m FROM Message m WHERE " +
           "m.conversation.id = :conversationId AND m.deletedAt IS NULL " +
           "ORDER BY m.createdAt DESC LIMIT 1")
    Message findLastMessage(@Param("conversationId") UUID conversationId);
}
