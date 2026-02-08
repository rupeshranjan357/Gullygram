package com.gullygram.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "karma_transactions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KarmaTransaction {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private Integer amount;

    @Enumerated(EnumType.STRING)
    @Column(name = "source_type", nullable = false)
    private KarmaSourceType sourceType;

    @Column(name = "source_id")
    private UUID sourceId;

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
