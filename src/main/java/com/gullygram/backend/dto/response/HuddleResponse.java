package com.gullygram.backend.dto.response;

import com.gullygram.backend.entity.Huddle;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class HuddleResponse {
    private UUID id;
    private AuthorView creator;
    private String title;
    private String description;
    private Double lat;
    private Double lon;
    private String locationName;
    private Double distanceKm;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Huddle.HuddleStatus status;
    private Integer maxParticipants;
    private Integer currentParticipants;
    private Huddle.GenderFilter genderFilter;
    private boolean isJoined;
    private LocalDateTime createdAt;
}
