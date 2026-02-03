package com.gullygram.backend.controller;

import com.gullygram.backend.entity.AreaVote;
import com.gullygram.backend.repository.AreaVoteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/growth")
@RequiredArgsConstructor
public class GrowthController {

    private final AreaVoteRepository areaVoteRepository;

    @PostMapping("/vote")
    public ResponseEntity<AreaVote> castVote(@RequestParam String area) {
        // Simple UPSERT logic
        // In prod, should check if user already voted (by ID or IP)
        // For beta demo, unlimited votes is fine (Growth Hacking!)
        
        AreaVote vote = areaVoteRepository.findById(area)
            .map(v -> {
                v.setVoteCount(v.getVoteCount() + 1);
                return areaVoteRepository.save(v);
            })
            .orElseGet(() -> areaVoteRepository.save(
                AreaVote.builder().areaName(area).voteCount(1L).build()
            ));

        return ResponseEntity.ok(vote);
    }

    @GetMapping("/leaderboard")
    public ResponseEntity<List<AreaVote>> getLeaderboard() {
        return ResponseEntity.ok(areaVoteRepository.findAllByOrderByVoteCountDesc());
    }
}
