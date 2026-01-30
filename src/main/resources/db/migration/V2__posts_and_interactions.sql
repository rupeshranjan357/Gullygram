-- Week 2: Posts, Feed, Likes, Comments

-- Post table
CREATE TABLE post (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL DEFAULT 'GENERAL',
    text TEXT NOT NULL,
    media_urls JSONB,
    lat DOUBLE PRECISION NOT NULL,
    lon DOUBLE PRECISION NOT NULL,
    geohash VARCHAR(20),
    visibility_radius_km INT NOT NULL DEFAULT 10,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    CONSTRAINT chk_post_type CHECK (type IN ('GENERAL', 'LOCAL_NEWS', 'MARKETING', 'EVENT_PROMO', 'MARKETPLACE')),
    CONSTRAINT chk_lat CHECK (lat >= -90 AND lat <= 90),
    CONSTRAINT chk_lon CHECK (lon >= -180 AND lon <= 180),
    CONSTRAINT chk_radius CHECK (visibility_radius_km > 0 AND visibility_radius_km <= 50)
);

-- Post interest tags (many-to-many)
CREATE TABLE post_interest_tag (
    post_id UUID REFERENCES post(id) ON DELETE CASCADE,
    interest_id INT REFERENCES interest(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (post_id, interest_id)
);

-- Post likes
CREATE TABLE post_like (
    post_id UUID REFERENCES post(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (post_id, user_id)
);

-- Comments
CREATE TABLE comment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES post(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_post_author ON post(author_id);
CREATE INDEX idx_post_location ON post(lat, lon);
CREATE INDEX idx_post_geohash ON post(geohash);
CREATE INDEX idx_post_created ON post(created_at DESC);
CREATE INDEX idx_post_deleted ON post(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_post_type ON post(type);

CREATE INDEX idx_post_like_post ON post_like(post_id);
CREATE INDEX idx_post_like_user ON post_like(user_id);

CREATE INDEX idx_comment_post ON comment(post_id);
CREATE INDEX idx_comment_author ON comment(author_id);
CREATE INDEX idx_comment_created ON comment(created_at);
CREATE INDEX idx_comment_deleted ON comment(deleted_at) WHERE deleted_at IS NULL;

-- Optional: Create a composite index for geo + time queries (feed optimization)
CREATE INDEX idx_post_location_time ON post(lat, lon, created_at DESC) WHERE deleted_at IS NULL;
