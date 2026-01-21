package com.gullygram.backend.dto.request;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class UpdateInterestsRequest {
    
    @NotEmpty(message = "At least one interest is required")
    private List<Integer> interestIds;
}
