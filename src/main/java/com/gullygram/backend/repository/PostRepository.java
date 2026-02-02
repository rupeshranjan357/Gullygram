package com.gullygram.backend.repository;

import com.gullygram.backend.entity.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;
import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, UUID> {

    /**
     * Find posts within bounding box (used for geo-filtering)
     */
    @Query("SELECT p FROM Post p WHERE p.deletedAt IS NULL " +
           "AND p.lat BETWEEN :minLat AND :maxLat " +
           "AND p.lon BETWEEN :minLon AND :maxLon " +
           "ORDER BY p.createdAt DESC")
    Page<Post> findPostsInBoundingBox(
        @Param("minLat") double minLat,
        @Param("maxLat") double maxLat,
        @Param("minLon") double minLon,
        @Param("maxLon") double maxLon,
        Pageable pageable
    );

    /**
     * Find post by ID (not deleted)
     */
    @Query("SELECT p FROM Post p WHERE p.id = :id AND p.deletedAt IS NULL")
    Optional<Post> findByIdAndNotDeleted(@Param("id") UUID id);

    /**
     * Find posts by author
     */
    @Query("SELECT p FROM Post p WHERE p.author.id = :authorId AND p.deletedAt IS NULL ORDER BY p.createdAt DESC")
    Page<Post> findByAuthorId(@Param("authorId") UUID authorId, Pageable pageable);

    long countByAuthorId(UUID authorId);

    @Query(value = "SELECT * FROM post p " +
           "WHERE p.deleted_at IS NULL " +
           "AND p.lat BETWEEN :minLat AND :maxLat " +
           "AND p.lon BETWEEN :minLon AND :maxLon " +
           "AND to_tsvector('english', p.text) @@ plainto_tsquery('english', :query) " +
           "ORDER BY p.created_at DESC", nativeQuery = true)
    Page<Post> searchPosts(
        @Param("query") String query,
        @Param("minLat") double minLat,
        @Param("maxLat") double maxLat,
        @Param("minLon") double minLon,
        @Param("maxLon") double maxLon,
        Pageable pageable
    );

    @Query(value = "SELECT * FROM post p " +
           "WHERE p.deleted_at IS NULL " +
           "AND p.lat BETWEEN :minLat AND :maxLat " +
           "AND p.lon BETWEEN :minLon AND :maxLon " +
           "AND p.text LIKE %:hashtag% " +
           "ORDER BY p.created_at DESC", nativeQuery = true)
    Page<Post> searchHashtags(
        @Param("hashtag") String hashtag,
        @Param("minLat") double minLat,
        @Param("maxLat") double maxLat,
        @Param("minLon") double minLon,
        @Param("maxLon") double maxLon,
        Pageable pageable
    );

    // Find upcoming events in a specific city
    @Query("SELECT p FROM Post p WHERE p.type = 'EVENT_PROMO' AND LOWER(p.eventCity) = LOWER(:city) AND p.eventDate > CURRENT_TIMESTAMP ORDER BY p.eventDate ASC")
    List<java.util.UUID> findUpcomingEventsByCityIds(@Param("city") String city);
    
    default java.util.List<Post> findUpcomingEventsByCity(String city) {
        // Workaround for JPQL with PostType enum if needed, or straight JPQL
        return this.findPostsByEventCity(city);
    }
    
    @Query("SELECT p FROM Post p WHERE p.type = 'EVENT_PROMO' AND LOWER(p.eventCity) = LOWER(:city) AND p.eventDate > CURRENT_TIMESTAMP ORDER BY p.eventDate ASC")
    java.util.List<Post> findPostsByEventCity(@Param("city") String city);


    @Query("SELECT p FROM Post p WHERE p.type = 'EVENT_PROMO' AND p.eventDate > CURRENT_TIMESTAMP AND " +
           "(6371 * acos(cos(radians(:lat)) * cos(radians(p.lat)) * cos(radians(p.lon) - radians(:lon)) + sin(radians(:lat)) * sin(radians(p.lat)))) < :radius " +
           "ORDER BY p.eventDate ASC")
    java.util.List<Post> findUpcomingEventsNearby(@Param("lat") double lat, @Param("lon") double lon, @Param("radius") double radius);
}
