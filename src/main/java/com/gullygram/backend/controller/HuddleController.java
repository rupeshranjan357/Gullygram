package com.gullygram.backend.controller;

import com.gullygram.backend.security.CurrentUser;
import com.gullygram.backend.dto.request.CreateHuddleRequest;
import com.gullygram.backend.dto.response.HuddleResponse;
import com.gullygram.backend.service.HuddleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/huddles")
@RequiredArgsConstructor
public class HuddleController {

    private final HuddleService huddleService;

    @PostMapping
    public ResponseEntity<HuddleResponse> createHuddle(
            @CurrentUser UUID userId,
            @RequestBody CreateHuddleRequest request) {
        return ResponseEntity.ok(huddleService.createHuddle(userId, request));
    }

    @GetMapping
    public ResponseEntity<List<HuddleResponse>> getNearbyHuddles(
            @CurrentUser UUID userId,
            @RequestParam double lat,
            @RequestParam double lon,
            @RequestParam(defaultValue = "10") double radius) {
        return ResponseEntity.ok(huddleService.getNearbyHuddles(userId, lat, lon, radius));
    }

    @PostMapping("/{id}/join")
    public ResponseEntity<Void> joinHuddle(
            @CurrentUser UUID userId,
            @PathVariable UUID id) {
        huddleService.joinHuddle(id, userId);
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/{id}/leave")
    public ResponseEntity<Void> leaveHuddle(
            @CurrentUser UUID userId,
            @PathVariable UUID id) {
        huddleService.leaveHuddle(id, userId);
        return ResponseEntity.ok().build();
    }
}
