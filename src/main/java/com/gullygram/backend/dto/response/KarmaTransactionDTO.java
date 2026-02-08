package com.gullygram.backend.dto.response;

import com.gullygram.backend.entity.KarmaSourceType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class KarmaTransactionDTO {
    private UUID id;
    private Integer amount;
    private KarmaSourceType sourceType;
    private UUID sourceId;
    private String description; // Optional: derived from source type
    private LocalDateTime createdAt;
}
