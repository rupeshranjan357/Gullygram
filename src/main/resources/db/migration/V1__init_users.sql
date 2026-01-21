CREATE EXTENSION IF NOT EXISTS postgis;

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20) UNIQUE,
    password_hash VARCHAR(255),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User profile table
CREATE TABLE user_profile (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    alias VARCHAR(50) UNIQUE NOT NULL,
    real_name VARCHAR(100),
    bio TEXT,
    avatar_url_alias VARCHAR(500),
    avatar_url_real VARCHAR(500),
    dob DATE,
    home_lat DOUBLE PRECISION,
    home_lon DOUBLE PRECISION,
    home_geohash VARCHAR(20),
    default_radius_km INT DEFAULT 10,
    last_seen_lat DOUBLE PRECISION,
    last_seen_lon DOUBLE PRECISION,
    last_seen_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Interests table
CREATE TABLE interest (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User interests (many-to-many)
CREATE TABLE user_interest (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    interest_id INT REFERENCES interest(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, interest_id)
);

-- OTP verification table
CREATE TABLE otp_verification (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone VARCHAR(20) NOT NULL,
    otp_code VARCHAR(6) NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verified_at TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_user_profile_alias ON user_profile(alias);
CREATE INDEX idx_user_profile_location ON user_profile(last_seen_lat, last_seen_lon);
CREATE INDEX idx_otp_phone ON otp_verification(phone);
CREATE INDEX idx_otp_expires ON otp_verification(expires_at);

-- Insert some default interests
INSERT INTO interest (name, description) VALUES
('Bodybuilding', 'Fitness and bodybuilding enthusiasts'),
('Books', 'Book lovers and readers'),
('Dance', 'Dance and choreography'),
('Music', 'Music lovers and musicians'),
('Sports', 'Sports enthusiasts'),
('Technology', 'Tech geeks and developers'),
('Travel', 'Travel and adventure'),
('Food', 'Foodies and culinary arts'),
('Photography', 'Photography enthusiasts'),
('Gaming', 'Video games and gaming'),
('Art', 'Visual arts and creativity'),
('Movies', 'Cinema and film lovers'),
('Fitness', 'Health and fitness'),
('Cooking', 'Cooking and recipes'),
('Fashion', 'Fashion and style');