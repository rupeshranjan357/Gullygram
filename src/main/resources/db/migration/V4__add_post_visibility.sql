-- Add visibility column to posts table
ALTER TABLE post ADD COLUMN visibility VARCHAR(20) DEFAULT 'PUBLIC';
