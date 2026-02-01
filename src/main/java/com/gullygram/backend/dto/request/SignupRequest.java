package com.gullygram.backend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class SignupRequest {
    
    @Email(message = "Invalid email format")
    private String email;
    
    @Pattern(regexp = "^\\+?[1-9]\\d{9,14}$", message = "Invalid phone number")
    private String phone;
    
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;
    
    @NotBlank(message = "Alias is required")
    @Size(min = 3, max = 50, message = "Alias must be between 3 and 50 characters")
    @Pattern(regexp = "^[a-zA-Z0-9_]+$", message = "Alias can only contain letters, numbers, and underscores")
    private String alias;
    
    private String realName;

    // Company Registration Fields
    private String accountType; // "INDIVIDUAL" or "COMPANY"
    private String marketingCategory;
}
