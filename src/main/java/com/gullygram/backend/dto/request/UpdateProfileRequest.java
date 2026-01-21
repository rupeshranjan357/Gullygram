package com.gullygram.backend.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
public class UpdateProfileRequest {
    
    @Size(min = 3, max = 50, message = "Alias must be between 3 and 50 characters")
    @Pattern(regexp = "^[a-zA-Z0-9_]+$", message = "Alias can only contain letters, numbers, and underscores")
    private String alias;
    
    private String realName;
    
    @Size(max = 500, message = "Bio cannot exceed 500 characters")
    private String bio;
    
    private String avatarUrlAlias;
    
    private String avatarUrlReal;
    
    private LocalDate dob;
    
    @Min(value = 5, message = "Minimum radius is 5km")
    @Max(value = 50, message = "Maximum radius is 50km")
    private Integer defaultRadiusKm;
}
