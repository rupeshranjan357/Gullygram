package com.gullygram.backend.service;

import com.gullygram.backend.dto.request.UpdateProfileRequest;
import com.gullygram.backend.dto.response.InterestResponse;
import com.gullygram.backend.dto.response.ProfileResponse;
import com.gullygram.backend.entity.User;
import com.gullygram.backend.entity.UserProfile;
import com.gullygram.backend.exception.BadRequestException;
import com.gullygram.backend.exception.ResourceNotFoundException;
import com.gullygram.backend.repository.RelationshipRepository;
import com.gullygram.backend.repository.UserProfileRepository;
import com.gullygram.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final RelationshipRepository relationshipRepository;

    public ProfileResponse getProfile(UUID userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        UserProfile profile = userProfileRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Profile not found"));

        return buildProfileResponse(user, profile);
    }

    @Transactional
    public ProfileResponse updateProfile(UUID userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        UserProfile profile = userProfileRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Profile not found"));

        // Update fields if provided
        if (request.getAlias() != null) {
            if (!request.getAlias().equals(profile.getAlias()) && 
                userProfileRepository.existsByAlias(request.getAlias())) {
                throw new BadRequestException("Alias already taken");
            }
            profile.setAlias(request.getAlias());
        }

        if (request.getRealName() != null) {
            profile.setRealName(request.getRealName());
        }

        if (request.getBio() != null) {
            profile.setBio(request.getBio());
        }

        if (request.getAvatarUrlAlias() != null) {
            profile.setAvatarUrlAlias(request.getAvatarUrlAlias());
        }

        if (request.getAvatarUrlReal() != null) {
            profile.setAvatarUrlReal(request.getAvatarUrlReal());
        }

        if (request.getDob() != null) {
            profile.setDob(request.getDob());
        }

        if (request.getDefaultRadiusKm() != null) {
            profile.setDefaultRadiusKm(request.getDefaultRadiusKm());
        }

        userProfileRepository.save(profile);

        return buildProfileResponse(user, profile);
    }

    private ProfileResponse buildProfileResponse(User user, UserProfile profile) {
        return ProfileResponse.builder()
            .userId(user.getId())
            .email(user.getEmail())
            .phone(user.getPhone())
            .alias(profile.getAlias())
            .realName(profile.getRealName())
            .bio(profile.getBio())
            .avatarUrlAlias(profile.getAvatarUrlAlias())
            .avatarUrlReal(profile.getAvatarUrlReal())
            .dob(profile.getDob())
            .homeLat(profile.getHomeLat())
            .homeLon(profile.getHomeLon())
            .defaultRadiusKm(profile.getDefaultRadiusKm())
            .lastSeenLat(profile.getLastSeenLat())
            .lastSeenLon(profile.getLastSeenLon())
            .lastSeenAt(profile.getLastSeenAt())
            .interests(profile.getInterests().stream()
                .map(interest -> InterestResponse.builder()
                    .id(interest.getId())
                    .name(interest.getName())
                    .description(interest.getDescription())
                    .build())
                .collect(Collectors.toList()))
            .trustScore(profile.getTrustScore())
            .trustLevel(profile.getTrustLevel())
            .friendsCount(relationshipRepository.countFriends(user.getId()))
            .pendingRequestsCount(relationshipRepository.countPendingRequests(user.getId()))
            .build();
    }
}
