CREATE TABLE huddle (
    id UUID PRIMARY KEY,
    creator_id UUID NOT NULL REFERENCES users(id),
    title VARCHAR(100) NOT NULL,
    description TEXT,
    
    -- Location
    lat DOUBLE PRECISION NOT NULL,
    lon DOUBLE PRECISION NOT NULL,
    geohash VARCHAR(12),
    location_name VARCHAR(255),
    
    -- Time
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    
    -- Rules
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN', -- OPEN, FULL, CANCELLED, COMPLETED
    max_participants INTEGER NOT NULL DEFAULT 5,
    gender_filter VARCHAR(20) NOT NULL DEFAULT 'EVERYONE', -- EVERYONE, WOMEN_ONLY, MEN_ONLY
    
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE INDEX idx_huddle_geohash ON huddle(geohash);
CREATE INDEX idx_huddle_start_time ON huddle(start_time);
CREATE INDEX idx_huddle_creator ON huddle(creator_id);

CREATE TABLE huddle_participant (
    id UUID PRIMARY KEY,
    huddle_id UUID NOT NULL REFERENCES huddle(id),
    user_id UUID NOT NULL REFERENCES users(id),
    status VARCHAR(20) NOT NULL DEFAULT 'JOINED', -- JOINED, LEFT, REMOVED
    joined_at TIMESTAMP NOT NULL DEFAULT NOW(),
    
    CONSTRAINT uk_huddle_participant UNIQUE (huddle_id, user_id)
);
