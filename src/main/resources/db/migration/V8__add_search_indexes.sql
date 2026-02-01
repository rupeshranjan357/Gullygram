-- Enable trigram extension for fuzzy search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Full-text search on posts using GIN index
CREATE INDEX idx_post_text_search ON post USING gin(to_tsvector('english', text));

-- Trigram index for fuzzy search on user alias
CREATE INDEX idx_user_profile_alias_trgm ON user_profile USING gin(alias gin_trgm_ops);

-- Trigram index for fuzzy search on real name
CREATE INDEX idx_user_profile_name_trgm ON user_profile USING gin(real_name gin_trgm_ops);
