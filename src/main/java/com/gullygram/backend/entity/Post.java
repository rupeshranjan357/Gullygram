package com.gullygram.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "post")
@Getter
@Setter
@ToString(exclude = {"author", "interests", "likes", "comments"})
@EqualsAndHashCode(exclude = {"author", "interests", "likes", "comments"})
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    @Builder.Default
    private PostType type = PostType.GENERAL;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String text;

    @Column(name = "media_urls", columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private List<String> mediaUrls;

    @Column(nullable = false)
    private Double lat;

    @Column(nullable = false)
    private Double lon;

    @Column(length = 20)
    private String geohash;

    @Column(name = "visibility_radius_km", nullable = false)
    @Builder.Default
    private Integer visibilityRadiusKm = 10;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @ManyToMany
    @JoinTable(
        name = "post_interest_tag",
        joinColumns = @JoinColumn(name = "post_id"),
        inverseJoinColumns = @JoinColumn(name = "interest_id")
    )
    @Builder.Default
    private Set<Interest> interests = new HashSet<>();

    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL)
    @org.hibernate.annotations.BatchSize(size = 20)
    @Builder.Default
    private Set<PostLike> likes = new HashSet<>();

    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL)
    @org.hibernate.annotations.BatchSize(size = 20)
    @Builder.Default
    private Set<Comment> comments = new HashSet<>();

    @Enumerated(EnumType.STRING)
    @Column(name = "visibility", length = 20)
    @Builder.Default
    private PostVisibility visibility = PostVisibility.PUBLIC;

    @Column(name = "event_date")
    private LocalDateTime eventDate;

    @Column(name = "event_location_name")
    private String eventLocationName;

    @Column(name = "event_city", length = 100)
    private String eventCity;

    public enum PostType {
        GENERAL,
        LOCAL_NEWS,
        MARKETING,
        EVENT_PROMO,
        MARKETPLACE
    }

    public enum PostVisibility {
        PUBLIC,
        FRIENDS_ONLY
    }

    public boolean isDeleted() {
        return deletedAt != null;
    }

    public void softDelete() {
        this.deletedAt = LocalDateTime.now();
    }
}
