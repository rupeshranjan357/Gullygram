package com.gullygram.backend.repository;

import com.gullygram.backend.entity.OtpVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OtpVerificationRepository extends JpaRepository<OtpVerification, UUID> {
    
    Optional<OtpVerification> findTopByPhoneAndVerifiedFalseAndExpiresAtAfterOrderByCreatedAtDesc(
        String phone, LocalDateTime now
    );
    
    List<OtpVerification> findByPhoneAndCreatedAtAfter(String phone, LocalDateTime since);
}
