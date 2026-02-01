package com.gullygram.backend.repository;

import com.gullygram.backend.entity.UserProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserProfileRepository extends JpaRepository<UserProfile, UUID> {
    
    Optional<UserProfile> findByAlias(String alias);
    
    Optional<UserProfile> findByUserId(UUID userId);
    
    boolean existsByAlias(String alias);

    @Query(value = "SELECT * FROM user_profile " +
           "WHERE alias ILIKE %:query% OR real_name ILIKE %:query% " +
           "LIMIT 20", nativeQuery = true)
    List<UserProfile> searchUsers(@Param("query") String query);
}
