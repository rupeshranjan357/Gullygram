CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE users (
                       id UUID PRIMARY KEY,
                       email VARCHAR(255) UNIQUE,
                       phone VARCHAR(20) UNIQUE,
                       password_hash VARCHAR(255),
                       status VARCHAR(50),
                       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_profile (
                              user_id UUID PRIMARY KEY REFERENCES users(id),
                              alias VARCHAR(50) UNIQUE NOT NULL,
                              real_name VARCHAR(100),
                              bio TEXT,
                              default_radius_km INT DEFAULT 10
);