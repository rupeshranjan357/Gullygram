CREATE TABLE IF NOT EXISTS interest_alias (
    id SERIAL PRIMARY KEY,
    alias VARCHAR(100) NOT NULL UNIQUE,
    interest_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_interest_alias_interest FOREIGN KEY (interest_id) REFERENCES interest (id)
);

CREATE INDEX IF NOT EXISTS idx_alias_name ON interest_alias(alias);
