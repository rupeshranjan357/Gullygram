CREATE TABLE area_votes (
    area_name VARCHAR(100) PRIMARY KEY,
    vote_count BIGINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_area_votes_count ON area_votes(vote_count DESC);
