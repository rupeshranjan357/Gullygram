package com.gullygram.backend.repository;

import com.gullygram.backend.entity.KarmaTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface KarmaTransactionRepository extends JpaRepository<KarmaTransaction, UUID> {
    
    @Query("SELECT COALESCE(SUM(kt.amount), 0) FROM KarmaTransaction kt WHERE kt.user.id = :userId")
    Integer calculateTotalKarma(UUID userId);
}
