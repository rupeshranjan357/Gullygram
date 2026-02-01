package com.gullygram.backend.service;

import com.gullygram.backend.dto.response.PostResponse;
import java.util.List;
import java.util.UUID;

public interface EventService {
    List<PostResponse> getUpcomingEventsByCity(String city, UUID currentUserId);
    List<PostResponse> getUpcomingEventsNearby(double lat, double lon, double radius, UUID currentUserId);
}
