ALTER TABLE users ADD COLUMN karma_score INTEGER DEFAULT 100;
UPDATE users SET karma_score = 100;
