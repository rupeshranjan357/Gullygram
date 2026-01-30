package com.gullygram.backend.repository;

import com.gullygram.backend.entity.UserProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserProfileRepository extends JpaRepository<UserProfile, UUID> {
    
    Optional<UserProfile> findByAlias(String alias);
    
    Optional<UserProfile> findByUserId(UUID userId);
    
    boolean existsByAlias(String alias);

}
