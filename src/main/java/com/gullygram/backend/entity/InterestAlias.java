package com.gullygram.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Maps alternative names/hashtags to canonical Interest categories
 * Example: "football" -> Sports, "coding" -> Technology
 */
@Entity
@Table(name = "interest_alias")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InterestAlias {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @Column(nullable = false, unique = true)
    private String alias;  // e.g., "football", "coding", "dj"
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "interest_id", nullable = false)
    private Interest interest;  // Maps to canonical Interest (e.g., Sports, Technology, Music)
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private java.time.LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = java.time.LocalDateTime.now();
    }
}
