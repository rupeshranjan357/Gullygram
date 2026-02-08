package com.gullygram.backend.controller;

import com.gullygram.backend.entity.KarmaTransaction;
import com.gullygram.backend.service.KarmaService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/karma")
@RequiredArgsConstructor
public class KarmaController {

    private final KarmaService karmaService;

    @GetMapping("/history")
    public ResponseEntity<List<com.gullygram.backend.dto.response.KarmaTransactionDTO>> getMyKarmaHistory(@AuthenticationPrincipal UUID userId) {
        List<KarmaTransaction> history = karmaService.getKarmaHistory(userId);
        List<com.gullygram.backend.dto.response.KarmaTransactionDTO> dtos = history.stream()
                .map(kt -> com.gullygram.backend.dto.response.KarmaTransactionDTO.builder()
                        .id(kt.getId())
                        .amount(kt.getAmount())
                        .sourceType(kt.getSourceType())
                        .sourceId(kt.getSourceId()) // Assuming checking sourceId is enough for now or I can add description logic
                        .createdAt(kt.getCreatedAt())
                        .build())
                .collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(dtos);
    }
    
    @GetMapping("/score")
    public ResponseEntity<Integer> getMyKarmaScore(@AuthenticationPrincipal UUID userId) {
        log.info("KarmaController.getMyKarmaScore called with userId: {}", userId);
        
        if (userId == null) {
            log.error("Received null userId in getMyKarmaScore");
            return ResponseEntity.ok(100); // Return default if auth fails
        }
        
        try {
            int score = karmaService.getKarmaScore(userId);
            log.info("Retrieved karma score {} for user {}", score, userId);
            return ResponseEntity.ok(score);
        } catch (Exception e) {
            log.error("Error getting karma score for user {}: {}", userId, e.getMessage(), e);
            return ResponseEntity.ok(100); // Return default on error to prevent 500
        }
    }
}
