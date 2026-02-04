-- Create interest_alias table for hashtag mapping
CREATE TABLE IF NOT EXISTS interest_alias (
    id SERIAL PRIMARY KEY,
    alias VARCHAR(100) NOT NULL UNIQUE,
    interest_id INTEGER NOT NULL REFERENCES interest(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_interest_alias_alias ON interest_alias(alias);
CREATE INDEX IF NOT EXISTS idx_interest_alias_interest_id ON interest_alias(interest_id);
