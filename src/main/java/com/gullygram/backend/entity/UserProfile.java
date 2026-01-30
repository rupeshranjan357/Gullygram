package com.gullygram.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "user_profile")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfile {

    @Id
    @Column(name = "user_id")
    private UUID userId;

    @OneToOne
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;

    @Column(unique = true, nullable = false, length = 50)
    private String alias;

    @Column(name = "real_name", length = 100)
    private String realName;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Column(name = "avatar_url_alias", length = 500)
    private String avatarUrlAlias;

    @Column(name = "avatar_url_real", length = 500)
    private String avatarUrlReal;

    private LocalDate dob;

    @Column(name = "home_lat")
    private Double homeLat;

    @Column(name = "home_lon")
    private Double homeLon;

    @Column(name = "home_geohash", length = 20)
    private String homeGeohash;

    @Column(name = "default_radius_km")
    @Builder.Default
    private Integer defaultRadiusKm = 10;

    @Column(name = "last_seen_lat")
    private Double lastSeenLat;

    @Column(name = "last_seen_lon")
    private Double lastSeenLon;

    @Column(name = "last_seen_at")
    private LocalDateTime lastSeenAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @ManyToMany
    @JoinTable(
        name = "user_interest",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "interest_id")
    )
    @Builder.Default
    private Set<Interest> interests = new HashSet<>();
}
