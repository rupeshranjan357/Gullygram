package com.gullygram.backend.service;

import com.gullygram.backend.dto.request.UpdateLocationRequest;
import com.gullygram.backend.entity.UserProfile;
import com.gullygram.backend.exception.ResourceNotFoundException;
import com.gullygram.backend.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LocationService {

    private final UserProfileRepository userProfileRepository;

    @Transactional
    public void updateLocation(UUID userId, UpdateLocationRequest request) {
        UserProfile profile = userProfileRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Profile not found"));

        profile.setLastSeenLat(request.getLatitude());
        profile.setLastSeenLon(request.getLongitude());
        profile.setLastSeenAt(LocalDateTime.now());

        // Generate geohash (simple implementation - can be improved with proper geohash library)
        String geohash = generateSimpleGeohash(request.getLatitude(), request.getLongitude());
        
        // Update home location if not set
        if (profile.getHomeLat() == null) {
            profile.setHomeLat(request.getLatitude());
            profile.setHomeLon(request.getLongitude());
            profile.setHomeGeohash(geohash);
        }

        userProfileRepository.save(profile);
    }

    private String generateSimpleGeohash(double lat, double lon) {
        // Simple geohash generation - for production, use a proper geohash library
        // like ch.hsr.geohash or similar
        return String.format("%.3f_%.3f", lat, lon);
    }
}
