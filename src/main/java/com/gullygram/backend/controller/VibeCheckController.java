package com.gullygram.backend.controller;

import com.gullygram.backend.dto.request.SubmitVibeCheckRequest;
import com.gullygram.backend.service.VibeCheckService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/karma")
@RequiredArgsConstructor
public class VibeCheckController {

    private final VibeCheckService vibeCheckService;

    @PostMapping("/vibe-check")
    public ResponseEntity<Void> submitVibeCheck(
            @AuthenticationPrincipal UUID userId,
            @RequestBody SubmitVibeCheckRequest request) {
        vibeCheckService.submitVibeCheck(userId, request);
        return ResponseEntity.ok().build();
    }
}
