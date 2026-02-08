package com.gullygram.backend.service;

import com.gullygram.backend.dto.request.SubmitVibeCheckRequest;
import com.gullygram.backend.entity.*;
import com.gullygram.backend.repository.HuddleParticipantRepository;
import com.gullygram.backend.repository.HuddleRepository;
import com.gullygram.backend.repository.UserRepository;
import com.gullygram.backend.repository.VibeCheckRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class VibeCheckService {

    private final VibeCheckRepository vibeCheckRepository;
    private final HuddleRepository huddleRepository;
    private final UserRepository userRepository;
    private final HuddleParticipantRepository huddleParticipantRepository;
    // KarmaService removed to prevent immediate awarding

    @Transactional
    public void submitVibeCheck(UUID reviewerId, SubmitVibeCheckRequest request) {
        // 1. Validate inputs
        if (request.getRating() < 1 || request.getRating() > 5) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Rating must be between 1 and 5");
        }

        if (reviewerId.equals(request.getRevieweeId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot vibe check yourself");
        }

        // 2. Check overlap (Did they actually meet?)
        // Ideally check if both were 'JOINED' in the same Huddle
        boolean reviewerJoined = huddleParticipantRepository.existsByHuddleIdAndUserIdAndStatus(
                request.getHuddleId(), reviewerId, HuddleParticipant.ParticipantStatus.JOINED);
        boolean revieweeJoined = huddleParticipantRepository.existsByHuddleIdAndUserIdAndStatus(
                request.getHuddleId(), request.getRevieweeId(), HuddleParticipant.ParticipantStatus.JOINED);

        if (!reviewerJoined || !revieweeJoined) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Both users must have joined the Huddle");
        }

        // 3. Prevent duplicate reviews
        if (vibeCheckRepository.existsByReviewerIdAndRevieweeIdAndHuddleId(
                reviewerId, request.getRevieweeId(), request.getHuddleId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "You have already vibe checked this user for this huddle");
        }

        Huddle huddle = huddleRepository.findById(request.getHuddleId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Huddle not found"));
        
        User reviewer = userRepository.findById(reviewerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reviewer not found"));
        User reviewee = userRepository.findById(request.getRevieweeId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reviewee not found"));

        // 4. Save Vibe Check
        VibeCheck vibeCheck = VibeCheck.builder()
                .reviewer(reviewer)
                .reviewee(reviewee)
                .huddle(huddle)
                .vibeRating(request.getRating())
                .vibeTags(request.getTags())
                .build();
        
        vibeCheckRepository.save(vibeCheck);

    }
}
