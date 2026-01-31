-- V5: Create messaging tables (conversation and message)

-- Create conversation table
CREATE TABLE conversation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user1_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user2_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    last_message_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    
    -- Ensure user1_id < user2_id to prevent duplicate conversations
    CONSTRAINT user_order_check CHECK (user1_id < user2_id),
    CONSTRAINT unique_conversation UNIQUE (user1_id, user2_id)
);

-- Create message table
CREATE TABLE message (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversation(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    read_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_conversation_user1 ON conversation(user1_id);
CREATE INDEX idx_conversation_user2 ON conversation(user2_id);
CREATE INDEX idx_conversation_last_message ON conversation(last_message_at DESC);

CREATE INDEX idx_message_conversation ON message(conversation_id, created_at DESC);
CREATE INDEX idx_message_sender ON message(sender_id);
CREATE INDEX idx_message_unread ON message(conversation_id, read_at) WHERE deleted_at IS NULL;
