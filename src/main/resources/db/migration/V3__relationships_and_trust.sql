-- Week 3: Relationships, Trust, and Identity Reveal

-- Relationship table for friends/connections
CREATE TABLE relationship (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'REQUESTED',
    message TEXT,  -- Optional intro message with request
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_relationship_status CHECK (status IN ('REQUESTED', 'ACCEPTED', 'REJECTED', 'BLOCKED')),
    CONSTRAINT uq_relationship UNIQUE (requester_id, receiver_id),
    CONSTRAINT chk_not_self CHECK (requester_id != receiver_id)
);

-- Add trust fields to user_profile (for future Week 4/5)
ALTER TABLE user_profile 
    ADD COLUMN trust_score INT DEFAULT 10,
    ADD COLUMN trust_level INT DEFAULT 1;

-- Indexes for performance
CREATE INDEX idx_relationship_requester ON relationship(requester_id);
CREATE INDEX idx_relationship_receiver ON relationship(receiver_id);
CREATE INDEX idx_relationship_status ON relationship(status);
CREATE INDEX idx_relationship_pair ON relationship(requester_id, receiver_id);

-- Composite index for finding relationships between users
CREATE INDEX idx_relationship_users_status ON relationship(requester_id, receiver_id, status);

-- Index for finding all accepted friendships for a user
CREATE INDEX idx_relationship_friends ON relationship(status) WHERE status = 'ACCEPTED';
