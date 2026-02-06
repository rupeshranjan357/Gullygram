package com.gullygram.backend.service;

import com.gullygram.backend.dto.request.CreateHuddleRequest;
import com.gullygram.backend.dto.response.AuthorView;
import com.gullygram.backend.dto.response.HuddleResponse;
import com.gullygram.backend.entity.Huddle;
import com.gullygram.backend.entity.HuddleParticipant;
import com.gullygram.backend.entity.User;
import com.gullygram.backend.repository.HuddleParticipantRepository;
import com.gullygram.backend.repository.HuddleRepository;
import com.gullygram.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class HuddleService {

    private final HuddleRepository huddleRepository;
    private final HuddleParticipantRepository huddleParticipantRepository;
    private final UserRepository userRepository;
    private final AuthorViewService authorViewService;

    @Transactional
    public HuddleResponse createHuddle(UUID userId, CreateHuddleRequest request) {
        User creator = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (request.getStartTime().isBefore(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Start time must be in the future");
        }

        Huddle huddle = Huddle.builder()
                .creator(creator)
                .title(request.getTitle())
                .description(request.getDescription())
                .lat(request.getLat())
                .lon(request.getLon())
                // .geohash() // TODO: Add GeoHash util if needed
                .locationName(request.getLocationName())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .maxParticipants(request.getMaxParticipants())
                .genderFilter(request.getGenderFilter())
                .status(Huddle.HuddleStatus.OPEN)
                .build();

        huddle = huddleRepository.save(huddle);

        // Creator automatically joins
        joinHuddle(huddle.getId(), userId);

        return convertToResponse(huddle, userId);
    }

    @Transactional
    public void joinHuddle(UUID huddleId, UUID userId) {
        Huddle huddle = huddleRepository.findById(huddleId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Huddle not found"));
        
        if (huddle.getStatus() != Huddle.HuddleStatus.OPEN) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Huddle is not open");
        }

        long participantCount = huddleParticipantRepository.countByHuddleIdAndStatus(huddleId, HuddleParticipant.ParticipantStatus.JOINED);
        if (participantCount >= huddle.getMaxParticipants()) {
             // Check if already joined to avoid error on idempotent retry
            boolean alreadyJoined = huddleParticipantRepository.existsByHuddleIdAndUserIdAndStatus(huddleId, userId, HuddleParticipant.ParticipantStatus.JOINED);
            if (!alreadyJoined) {
                // If full and not joined, mark as FULL (optional logic)
                huddle.setStatus(Huddle.HuddleStatus.FULL);
                huddleRepository.save(huddle);
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Huddle is full");
            }
        }
        
        // TODO: Gender check logic here (requires User gender field)

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        // Check if exists (idempotent)
        huddleParticipantRepository.findByHuddleIdAndUserId(huddleId, userId)
                .ifPresentOrElse(
                        participant -> {
                            if (participant.getStatus() != HuddleParticipant.ParticipantStatus.JOINED) {
                                participant.setStatus(HuddleParticipant.ParticipantStatus.JOINED);
                                huddleParticipantRepository.save(participant);
                            }
                        },
                        () -> {
                            HuddleParticipant newParticipant = HuddleParticipant.builder()
                                    .huddle(huddle)
                                    .user(user)
                                    .status(HuddleParticipant.ParticipantStatus.JOINED)
                                    .build();
                            huddleParticipantRepository.save(newParticipant);
                        }
                );
    }
    
    @Transactional
    public void leaveHuddle(UUID huddleId, UUID userId) {
         HuddleParticipant participant = huddleParticipantRepository.findByHuddleIdAndUserId(huddleId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Not joined"));
         
         participant.setStatus(HuddleParticipant.ParticipantStatus.LEFT);
         huddleParticipantRepository.save(participant);
         
         // If creator leaves, cancel huddle? Or transfer? For now, keep it open or implement cancel.
         // Simplified: If creator leaves, cancel.
         Huddle huddle = participant.getHuddle();
         if (huddle.getCreator().getId().equals(userId)) {
             huddle.setStatus(Huddle.HuddleStatus.CANCELLED);
             huddleRepository.save(huddle);
         } else {
             // If huddle was full, reopen it
             if (huddle.getStatus() == Huddle.HuddleStatus.FULL) {
                 huddle.setStatus(Huddle.HuddleStatus.OPEN);
                 huddleRepository.save(huddle);
             }
         }
    }

    @Transactional(readOnly = true)
    public List<HuddleResponse> getNearbyHuddles(UUID userId, double lat, double lon, double radiusKm) {
        List<Huddle> huddles = huddleRepository.findNearbyOpenHuddles(lat, lon, radiusKm);
        return huddles.stream()
                .map(h -> convertToResponse(h, userId))
                .collect(Collectors.toList());
    }

    private HuddleResponse convertToResponse(Huddle huddle, UUID currentUserId) {
        AuthorView creatorView = authorViewService.buildAuthorView(currentUserId, huddle.getCreator());
        long currentParticipants = huddleParticipantRepository.countByHuddleIdAndStatus(huddle.getId(), HuddleParticipant.ParticipantStatus.JOINED);
        boolean isJoined = huddleParticipantRepository.existsByHuddleIdAndUserIdAndStatus(huddle.getId(), currentUserId, HuddleParticipant.ParticipantStatus.JOINED);
        
        // Calculate distance
        // Simplified Haversine for display
        double distance = calculateDistanceInternal(huddle.getLat(), huddle.getLon(), huddle.getLat(), huddle.getLon()); // This needs current user location passed in if we want dynamic distance, 
                                                                                                                        // but for list mapping usually we map relative to center or pass in user location.
        // Huddle entity stores its own location. The 'distance' in response SHOULD be relative to the requested lat/lon. 
        // For now, I'll allow distance to be 0 or null in conversion if not available, OR I need to change signature.
        // Let's assume frontend calculates precise distance or we pass user location context.
        
        return HuddleResponse.builder()
                .id(huddle.getId())
                .creator(creatorView)
                .title(huddle.getTitle())
                .description(huddle.getDescription())
                .lat(huddle.getLat())
                .lon(huddle.getLon())
                .locationName(huddle.getLocationName())
                .startTime(huddle.getStartTime())
                .endTime(huddle.getEndTime())
                .status(huddle.getStatus())
                .maxParticipants(huddle.getMaxParticipants())
                // .distanceKm(distance) // Omit for now or calculate if lat/lon available in context
                .currentParticipants((int) currentParticipants)
                .genderFilter(huddle.getGenderFilter())
                .isJoined(isJoined)
                .createdAt(huddle.getCreatedAt())
                .build();
    }
    
    private double calculateDistanceInternal(double lat1, double lon1, double lat2, double lon2) {
        // Quick Haversine
        if ((lat1 == lat2) && (lon1 == lon2)) return 0;
        double theta = lon1 - lon2;
        double dist = Math.sin(Math.toRadians(lat1)) * Math.sin(Math.toRadians(lat2)) + 
                      Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) * Math.cos(Math.toRadians(theta));
        dist = Math.acos(dist);
        dist = Math.toDegrees(dist);
        dist = dist * 60 * 1.1515;
        dist = dist * 1.609344; // in Kilometers
        return dist;
    }
}
