package com.gullygram.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthorView {

    private UUID userId;
    private String alias;
    private String avatarUrl;
    
    // Real name will be added in Week 3 based on relationship status
    // private String realName;
}
