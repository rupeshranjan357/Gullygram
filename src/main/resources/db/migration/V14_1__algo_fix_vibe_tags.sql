ALTER TABLE vibe_checks 
ALTER COLUMN vibe_tags TYPE TEXT 
USING array_to_string(vibe_tags, ',');
