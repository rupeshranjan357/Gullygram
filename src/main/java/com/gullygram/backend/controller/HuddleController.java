package com.gullygram.backend.controller;

import com.gullygram.backend.dto.request.CreateHuddleRequest;
import com.gullygram.backend.dto.response.HuddleResponse;
import com.gullygram.backend.service.HuddleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.gullygram.backend.dto.response.HuddleParticipantResponse;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/huddles")
@RequiredArgsConstructor
public class HuddleController {

    private final HuddleService huddleService;
    
    @GetMapping("/{id}/participants")
    public ResponseEntity<List<HuddleParticipantResponse>> getParticipants(@PathVariable UUID id) {
        return ResponseEntity.ok(huddleService.getParticipants(id));
    }

    @PostMapping
    public ResponseEntity<HuddleResponse> createHuddle(
            @AuthenticationPrincipal UUID userId,
            @RequestBody CreateHuddleRequest request) {
        return ResponseEntity.ok(huddleService.createHuddle(userId, request));
    }

    @GetMapping
    public ResponseEntity<List<HuddleResponse>> getNearbyHuddles(
            @AuthenticationPrincipal UUID userId,
            @RequestParam double lat,
            @RequestParam double lon,
            @RequestParam(defaultValue = "10") double radius) {
        return ResponseEntity.ok(huddleService.getNearbyHuddles(userId, lat, lon, radius));
    }

    @PostMapping("/{id}/join")
    public ResponseEntity<Void> joinHuddle(
            @AuthenticationPrincipal UUID userId,
            @PathVariable UUID id) {
        huddleService.joinHuddle(id, userId);
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/{id}/leave")
    public ResponseEntity<Void> leaveHuddle(
            @AuthenticationPrincipal UUID userId,
            @PathVariable UUID id) {
        huddleService.leaveHuddle(id, userId);
        return ResponseEntity.ok().build();
    }
    @PostMapping("/{id}/complete")
    public ResponseEntity<Void> completeHuddle(
            @AuthenticationPrincipal UUID userId,
            @PathVariable UUID id) {
        huddleService.completeHuddle(id, userId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<Void> cancelHuddle(
            @AuthenticationPrincipal UUID userId,
            @PathVariable UUID id) {
        huddleService.cancelHuddle(id, userId);
        return ResponseEntity.ok().build();
    }
}
