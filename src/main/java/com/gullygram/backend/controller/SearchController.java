package com.gullygram.backend.controller;

import com.gullygram.backend.dto.response.PostResponse;
import com.gullygram.backend.dto.response.UserSummary;
import com.gullygram.backend.entity.User;
import com.gullygram.backend.service.SearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

import java.util.List;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
public class SearchController {

    private final SearchService searchService;

    @GetMapping("/users")
    public ResponseEntity<List<UserSummary>> searchUsers(
            @RequestParam("q") String query,
            @AuthenticationPrincipal UUID userId) {
        
        List<UserSummary> results = searchService.searchUsers(query, userId);
        return ResponseEntity.ok(results);
    }

    @GetMapping("/posts")
    public ResponseEntity<List<PostResponse>> searchPosts(
            @RequestParam("q") String query,
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lon,
            @RequestParam(required = false, defaultValue = "50.0") Double radiusKm,
            @AuthenticationPrincipal UUID userId) {
        
        List<PostResponse> results = searchService.searchPosts(query, userId, lat, lon, radiusKm);
        return ResponseEntity.ok(results);
    }

    @GetMapping("/hashtags")
    public ResponseEntity<List<PostResponse>> searchHashtags(
            @RequestParam("q") String hashtag,
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lon,
            @RequestParam(required = false, defaultValue = "50.0") Double radiusKm,
            @AuthenticationPrincipal UUID userId) {
        
        List<PostResponse> results = searchService.searchHashtags(hashtag, userId, lat, lon, radiusKm);
        return ResponseEntity.ok(results);
    }
}
