package com.gullygram.backend.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FriendRequestDTO {

    @NotNull(message = "Receiver ID is required")
    private UUID receiverId;

    // Optional intro message with the friend request
    private String message;
}
