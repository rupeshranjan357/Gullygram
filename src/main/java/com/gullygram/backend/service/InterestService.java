package com.gullygram.backend.service;

import com.gullygram.backend.dto.request.UpdateInterestsRequest;
import com.gullygram.backend.dto.response.InterestResponse;
import com.gullygram.backend.entity.Interest;
import com.gullygram.backend.entity.UserProfile;
import com.gullygram.backend.exception.BadRequestException;
import com.gullygram.backend.exception.ResourceNotFoundException;
import com.gullygram.backend.repository.InterestRepository;
import com.gullygram.backend.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InterestService {

    private final InterestRepository interestRepository;
    private final UserProfileRepository userProfileRepository;

    public List<InterestResponse> getAllInterests() {
        return interestRepository.findAll().stream()
            .map(interest -> InterestResponse.builder()
                .id(interest.getId())
                .name(interest.getName())
                .description(interest.getDescription())
                .build())
            .collect(Collectors.toList());
    }

    @Transactional
    public List<InterestResponse> updateUserInterests(UUID userId, UpdateInterestsRequest request) {
        UserProfile profile = userProfileRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Profile not found"));

        // Validate all interest IDs exist
        List<Interest> interests = interestRepository.findByIdIn(request.getInterestIds());
        
        if (interests.size() != request.getInterestIds().size()) {
            throw new BadRequestException("One or more interest IDs are invalid");
        }

        // Update user interests
        profile.setInterests(new HashSet<>(interests));
        userProfileRepository.save(profile);

        return interests.stream()
            .map(interest -> InterestResponse.builder()
                .id(interest.getId())
                .name(interest.getName())
                .description(interest.getDescription())
                .build())
            .collect(Collectors.toList());
    }

    public List<InterestResponse> getUserInterests(UUID userId) {
        UserProfile profile = userProfileRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Profile not found"));

        return profile.getInterests().stream()
            .map(interest -> InterestResponse.builder()
                .id(interest.getId())
                .name(interest.getName())
                .description(interest.getDescription())
                .build())
            .collect(Collectors.toList());
    }
}
