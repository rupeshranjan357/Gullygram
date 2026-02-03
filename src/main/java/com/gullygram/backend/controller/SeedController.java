package com.gullygram.backend.controller;

import com.gullygram.backend.service.SeedContentService;
import com.gullygram.backend.dto.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/seed")
@RequiredArgsConstructor
public class SeedController {

    private final SeedContentService seedContentService;
    private final com.gullygram.backend.service.MagicContentService magicContentService;

    @PostMapping("/magic")
    public ResponseEntity<ApiResponse<String>> seedMagic(@RequestParam Double lat, @RequestParam Double lon) {
        magicContentService.seedMagicContent(lat, lon);
        return ResponseEntity.ok(new ApiResponse<>(true, "Magic Seeding Complete for location: " + lat + ", " + lon, null));
    }

    @PostMapping("/koramangala")
    public ResponseEntity<ApiResponse<String>> seedKoramangala() {
        seedContentService.seedKoramangala();
        return ResponseEntity.ok(new ApiResponse<>(true, "Seeded Koramangala content successfully", null));
    }

    @PostMapping("/indiranagar")
    public ResponseEntity<ApiResponse<String>> seedIndiranagar() {
        seedContentService.seedIndiranagar();
        return ResponseEntity.ok(new ApiResponse<>(true, "Seeded Indiranagar content successfully", null));
    }

    @PostMapping("/custom")
    public ResponseEntity<ApiResponse<String>> seedCustom(@RequestParam double lat, @RequestParam double lon) {
        seedContentService.seedCustomLocation(lat, lon);
        return ResponseEntity.ok(new ApiResponse<>(true, "Seeded content at " + lat + ", " + lon, null));
    }
}
