package com.gullygram.backend.repository;

import com.gullygram.backend.entity.Huddle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface HuddleRepository extends JpaRepository<Huddle, UUID> {

    @Query("SELECT h FROM Huddle h WHERE h.status = 'OPEN' AND h.startTime > CURRENT_TIMESTAMP AND " +
           "(6371 * acos(cos(radians(:lat)) * cos(radians(h.lat)) * cos(radians(h.lon) - radians(:lon)) + sin(radians(:lat)) * sin(radians(h.lat)))) < :radius " +
           "ORDER BY h.startTime ASC")
    List<Huddle> findNearbyOpenHuddles(@Param("lat") double lat, @Param("lon") double lon, @Param("radius") double radius);

    List<Huddle> findByCreatorId(UUID creatorId);

    @Query("SELECT h FROM Huddle h WHERE h.endTime < :now AND h.status = 'OPEN'")
    List<Huddle> findExpiredHuddles(@Param("now") LocalDateTime now);
}
