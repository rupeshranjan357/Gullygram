-- Add Account Type to Users (INDIVIDUAL, COMPANY)
ALTER TABLE users ADD COLUMN account_type VARCHAR(20) DEFAULT 'INDIVIDUAL';
ALTER TABLE users ADD COLUMN marketing_category VARCHAR(50);
ALTER TABLE users ADD COLUMN last_marketing_post_at TIMESTAMP;

-- Add Event Metadata to Post
ALTER TABLE post ADD COLUMN event_date TIMESTAMP;
ALTER TABLE post ADD COLUMN event_location_name VARCHAR(255);
ALTER TABLE post ADD COLUMN event_city VARCHAR(100);

-- Create indexes for efficient filtering
CREATE INDEX idx_users_account_type ON users(account_type);
CREATE INDEX idx_post_event_city ON post(event_city);
CREATE INDEX idx_post_event_date ON post(event_date);
