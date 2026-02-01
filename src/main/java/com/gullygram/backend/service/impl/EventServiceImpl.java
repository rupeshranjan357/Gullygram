package com.gullygram.backend.service.impl;

import com.gullygram.backend.dto.response.PostResponse;
import com.gullygram.backend.entity.Post;
import com.gullygram.backend.repository.PostRepository;
import com.gullygram.backend.service.EventService;
import com.gullygram.backend.service.PostService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class EventServiceImpl implements EventService {

    private final PostRepository postRepository;
    private final PostService postService; // Reusing converter logic

    @Override
    @Transactional(readOnly = true)
    public List<PostResponse> getUpcomingEventsByCity(String city, UUID currentUserId) {
        List<Post> events = postRepository.findUpcomingEventsByCity(city);
        return events.stream()
                .map(post -> postService.convertToResponse(post, currentUserId))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PostResponse> getUpcomingEventsNearby(double lat, double lon, double radius, UUID currentUserId) {
        List<Post> events = postRepository.findUpcomingEventsNearby(lat, lon, radius);
        return events.stream()
                .map(post -> postService.convertToResponse(post, currentUserId))
                .collect(Collectors.toList());
    }
}
