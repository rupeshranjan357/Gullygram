package com.gullygram.backend.entity;

import com.gullygram.backend.converter.StringListConverter;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "vibe_checks")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VibeCheck {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewer_id", nullable = false)
    private User reviewer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewee_id", nullable = false)
    private User reviewee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "huddle_id", nullable = false)
    private Huddle huddle;

    @Column(name = "vibe_rating", nullable = false)
    private Integer vibeRating; // 1-5

    @Column(name = "vibe_tags")
    @Convert(converter = StringListConverter.class) // Assuming you have a converter or use native array support
    private List<String> vibeTags;

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
