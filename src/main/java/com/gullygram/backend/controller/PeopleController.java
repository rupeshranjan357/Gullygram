package com.gullygram.backend.controller;

import com.gullygram.backend.dto.response.ApiResponse;
import com.gullygram.backend.dto.response.PeopleSuggestionResponse;
import com.gullygram.backend.dto.response.UserSummary;
import com.gullygram.backend.entity.User;
import com.gullygram.backend.exception.BadRequestException;
import com.gullygram.backend.exception.ResourceNotFoundException;
import com.gullygram.backend.repository.RelationshipRepository;
import com.gullygram.backend.repository.UserRepository;
import com.gullygram.backend.security.CurrentUser;
import com.gullygram.backend.service.AuthorViewService;
import com.gullygram.backend.service.PeopleSuggestionService;
import com.gullygram.backend.service.RelationshipService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/people")
@RequiredArgsConstructor
public class PeopleController {

    private final PeopleSuggestionService peopleSuggestionService;
    private final RelationshipService relationshipService;
    private final AuthorViewService authorViewService;
    private final UserRepository userRepository;
    private final CurrentUser currentUser;

    /**
     * Get suggested people to connect with based on interests and location
     */
    @GetMapping("/suggestions")
    public ResponseEntity<ApiResponse<List<PeopleSuggestionResponse>>> getSuggestions(
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lon,
            @RequestParam(defaultValue = "10") Integer radiusKm,
            @RequestParam(defaultValue = "20") int limit) {
        
        UUID userId = currentUser.getUserId();
        List<PeopleSuggestionResponse> suggestions = peopleSuggestionService.getSuggestions(
            userId, lat, lon, radiusKm, limit
        );
        return ResponseEntity.ok(ApiResponse.success("Success", suggestions));
    }

    /**
     * Get a user's public profile (respects privacy based on relationship)
     */
    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse<UserSummary>> getUserProfile(
            @PathVariable UUID userId,
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lon) {
        
        UUID viewerId = currentUser.getUserId();
        
        // Check if blocked
        if (relationshipService.isBlockedBetween(viewerId, userId)) {
            throw new BadRequestException("User not found");
        }
        
        User targetUser = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        UserSummary userSummary = authorViewService.buildUserSummary(viewerId, targetUser, lat, lon);
        return ResponseEntity.ok(ApiResponse.success("Success", userSummary));
    }
}
