package com.gullygram.backend.repository;

import com.gullygram.backend.entity.HuddleParticipant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface HuddleParticipantRepository extends JpaRepository<HuddleParticipant, UUID> {
    
    Optional<HuddleParticipant> findByHuddleIdAndUserId(UUID huddleId, UUID userId);
    
    List<HuddleParticipant> findByHuddleId(UUID huddleId);
    
    long countByHuddleIdAndStatus(UUID huddleId, HuddleParticipant.ParticipantStatus status);
    
    boolean existsByHuddleIdAndUserIdAndStatus(UUID huddleId, UUID userId, HuddleParticipant.ParticipantStatus status);
}
