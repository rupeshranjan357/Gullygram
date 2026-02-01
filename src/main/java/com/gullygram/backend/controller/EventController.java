package com.gullygram.backend.controller;

import com.gullygram.backend.dto.response.PostResponse;
import com.gullygram.backend.service.EventService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;

    @GetMapping("/city")
    public ResponseEntity<List<PostResponse>> getEventsByCity(
            @RequestParam("city") String city,
            @AuthenticationPrincipal UUID currentUserId) {
        
        return ResponseEntity.ok(eventService.getUpcomingEventsByCity(city, currentUserId));
    }

    @GetMapping("/nearby")
    public ResponseEntity<List<PostResponse>> getEventsNearby(
            @RequestParam("lat") double lat,
            @RequestParam("lon") double lon,
            @RequestParam(value = "radius", defaultValue = "10") double radius,
            @AuthenticationPrincipal UUID currentUserId) {
        
        return ResponseEntity.ok(eventService.getUpcomingEventsNearby(lat, lon, radius, currentUserId));
    }
}
