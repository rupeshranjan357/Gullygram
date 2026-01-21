package com.gullygram.backend.controller;

import com.gullygram.backend.dto.response.ApiResponse;
import com.gullygram.backend.dto.response.FeedResponse;
import com.gullygram.backend.security.CurrentUser;
import com.gullygram.backend.service.FeedService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/feed")
@RequiredArgsConstructor
public class FeedController {

    private final FeedService feedService;
    private final CurrentUser currentUser;

    @GetMapping
    public ResponseEntity<ApiResponse<FeedResponse>> getFeed(
            @RequestParam Double lat,
            @RequestParam Double lon,
            @RequestParam(required = false) Integer radiusKm,
            @RequestParam(defaultValue = "true") Boolean interestBoost,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        UUID userId = currentUser.getUserId();
        FeedResponse feed = feedService.getFeed(userId, lat, lon, radiusKm, interestBoost, page, size);
        return ResponseEntity.ok(ApiResponse.success("Success", feed));
    }
}
