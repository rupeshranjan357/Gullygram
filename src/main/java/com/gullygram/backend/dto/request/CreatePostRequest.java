package com.gullygram.backend.dto.request;

import com.gullygram.backend.entity.Post;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreatePostRequest {

    @NotBlank(message = "Text is required")
    @Size(max = 5000, message = "Text must not exceed 5000 characters")
    private String text;

    @NotNull(message = "Post type is required")
    private Post.PostType type;

    private List<String> mediaUrls;

    @NotNull(message = "Latitude is required")
    @DecimalMin(value = "-90.0", message = "Latitude must be between -90 and 90")
    @DecimalMax(value = "90.0", message = "Latitude must be between -90 and 90")
    private Double latitude;

    @NotNull(message = "Longitude is required")
    @DecimalMin(value = "-180.0", message = "Longitude must be between -180 and 180")
    @DecimalMax(value = "180.0", message = "Longitude must be between -180 and 180")
    private Double longitude;

    @Min(value = 1, message = "Visibility radius must be at least 1km")
    @Max(value = 50, message = "Visibility radius must not exceed 50km")
    private Integer visibilityRadiusKm;

    private Set<Integer> interestIds;

    @Builder.Default
    private boolean friendsOnly = false;

}
