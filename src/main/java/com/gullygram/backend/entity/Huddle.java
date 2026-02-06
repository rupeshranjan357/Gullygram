package com.gullygram.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "huddle")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"creator", "participants"})
@EqualsAndHashCode(exclude = {"creator", "participants"})
public class Huddle {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creator_id", nullable = false)
    private User creator;

    @Column(nullable = false, length = 100)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    // Location
    @Column(nullable = false)
    private Double lat;

    @Column(nullable = false)
    private Double lon;

    @Column(length = 12)
    private String geohash;

    @Column(name = "location_name")
    private String locationName;

    // Time
    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalDateTime endTime;

    // Rules
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private HuddleStatus status = HuddleStatus.OPEN;

    @Column(name = "max_participants", nullable = false)
    @Builder.Default
    private Integer maxParticipants = 5;

    @Enumerated(EnumType.STRING)
    @Column(name = "gender_filter", nullable = false, length = 20)
    @Builder.Default
    private GenderFilter genderFilter = GenderFilter.EVERYONE;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @OneToMany(mappedBy = "huddle", cascade = CascadeType.ALL)
    @Builder.Default
    private Set<HuddleParticipant> participants = new HashSet<>();

    public enum HuddleStatus {
        OPEN, FULL, CANCELLED, COMPLETED
    }

    public enum GenderFilter {
        EVERYONE, WOMEN_ONLY, MEN_ONLY
    }

    public boolean isDeleted() {
        return deletedAt != null;
    }

    public void softDelete() {
        this.deletedAt = LocalDateTime.now();
        this.status = HuddleStatus.CANCELLED;
    }
}
