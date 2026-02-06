package com.gullygram.backend.dto.request;

import com.gullygram.backend.entity.Huddle;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CreateHuddleRequest {
    private String title;
    private String description;
    private Double lat;
    private Double lon;
    private String locationName;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Integer maxParticipants;
    private Huddle.GenderFilter genderFilter;
}
