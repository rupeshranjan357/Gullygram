package com.gullygram.backend.repository;

import com.gullygram.backend.entity.VibeCheck;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface VibeCheckRepository extends JpaRepository<VibeCheck, UUID> {
    boolean existsByReviewerIdAndRevieweeIdAndHuddleId(UUID reviewerId, UUID revieweeId, UUID huddleId);

    java.util.List<VibeCheck> findAllByHuddleId(UUID huddleId);
}
