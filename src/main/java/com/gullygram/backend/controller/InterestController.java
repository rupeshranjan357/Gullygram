package com.gullygram.backend.controller;

import com.gullygram.backend.dto.request.UpdateInterestsRequest;
import com.gullygram.backend.dto.response.ApiResponse;
import com.gullygram.backend.dto.response.InterestResponse;
import com.gullygram.backend.security.CurrentUser;
import com.gullygram.backend.service.InterestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class InterestController {

    private final InterestService interestService;
    private final CurrentUser currentUser;

    @GetMapping("/interests")
    public ResponseEntity<ApiResponse<List<InterestResponse>>> getAllInterests() {
        List<InterestResponse> interests = interestService.getAllInterests();
        return ResponseEntity.ok(ApiResponse.success(interests));
    }

    @GetMapping("/me/interests")
    public ResponseEntity<ApiResponse<List<InterestResponse>>> getMyInterests() {
        List<InterestResponse> interests = interestService.getUserInterests(currentUser.getUserId());
        return ResponseEntity.ok(ApiResponse.success(interests));
    }

    @PutMapping("/me/interests")
    public ResponseEntity<ApiResponse<List<InterestResponse>>> updateMyInterests(
            @Valid @RequestBody UpdateInterestsRequest request) {
        List<InterestResponse> interests = interestService.updateUserInterests(
            currentUser.getUserId(), request
        );
        return ResponseEntity.ok(ApiResponse.success("Interests updated successfully", interests));
    }
}
