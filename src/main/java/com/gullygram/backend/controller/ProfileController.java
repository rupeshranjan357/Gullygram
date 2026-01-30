package com.gullygram.backend.controller;

import com.gullygram.backend.dto.request.UpdateLocationRequest;
import com.gullygram.backend.dto.request.UpdateProfileRequest;
import com.gullygram.backend.dto.response.ApiResponse;
import com.gullygram.backend.dto.response.ProfileResponse;
import com.gullygram.backend.security.CurrentUser;
import com.gullygram.backend.service.LocationService;
import com.gullygram.backend.service.ProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;
    private final LocationService locationService;
    private final CurrentUser currentUser;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<ProfileResponse>> getMyProfile() {
        ProfileResponse response = profileService.getProfile(currentUser.getUserId());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PatchMapping("/me/profile")
    public ResponseEntity<ApiResponse<ProfileResponse>> updateProfile(
            @Valid @RequestBody UpdateProfileRequest request) {
        ProfileResponse response = profileService.updateProfile(currentUser.getUserId(), request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", response));
    }

    @PostMapping("/me/location")
    public ResponseEntity<ApiResponse<Void>> updateLocation(
            @Valid @RequestBody UpdateLocationRequest request) {
        locationService.updateLocation(currentUser.getUserId(), request);
        return ResponseEntity.ok(ApiResponse.success("Location updated successfully", null));
    }
}
