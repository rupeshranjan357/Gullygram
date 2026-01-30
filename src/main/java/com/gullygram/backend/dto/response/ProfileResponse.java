package com.gullygram.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProfileResponse {
    
    private UUID userId;
    private String email;
    private String phone;
    private String alias;
    private String realName;
    private String bio;
    private String avatarUrlAlias;
    private String avatarUrlReal;
    private LocalDate dob;
    private Double homeLat;
    private Double homeLon;
    private Integer defaultRadiusKm;
    private Double lastSeenLat;
    private Double lastSeenLon;
    private LocalDateTime lastSeenAt;
    private List<InterestResponse> interests;
    
    // Trust system (Week 3+)
    private Integer trustScore;
    private Integer trustLevel;
    
    // Relationship counts
    private Long friendsCount;
    private Long pendingRequestsCount;
}
