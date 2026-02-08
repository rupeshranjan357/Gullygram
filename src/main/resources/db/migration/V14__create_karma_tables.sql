CREATE TYPE karma_source_type AS ENUM ('HUDDLE_COMPLETION', 'VIBE_CHECK', 'REPORT', 'NO_SHOW');

CREATE TABLE karma_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    amount INTEGER NOT NULL,
    source_type karma_source_type NOT NULL,
    source_id UUID,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE vibe_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reviewer_id UUID NOT NULL REFERENCES users(id),
    reviewee_id UUID NOT NULL REFERENCES users(id),
    huddle_id UUID NOT NULL REFERENCES huddle(id),
    vibe_rating INTEGER NOT NULL CHECK (vibe_rating >= 1 AND vibe_rating <= 5),
    vibe_tags TEXT[], 
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_vibe_check UNIQUE (reviewer_id, reviewee_id, huddle_id)
);

CREATE INDEX idx_karma_user ON karma_transactions(user_id);
CREATE INDEX idx_vibe_check_huddle ON vibe_checks(huddle_id);
