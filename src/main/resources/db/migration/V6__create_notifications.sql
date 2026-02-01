-- V6: Create notifications table

CREATE TABLE notification (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    actor_id UUID REFERENCES users(id) ON DELETE CASCADE,
    entity_type VARCHAR(50),
    entity_id UUID,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_notification_user ON notification(user_id, created_at DESC);
CREATE INDEX idx_notification_unread ON notification(user_id, is_read) WHERE is_read = FALSE;

-- Comments for documentation
COMMENT ON TABLE notification IS 'Stores user notifications for various events';
COMMENT ON COLUMN notification.type IS 'Type of notification: FRIEND_REQUEST, POST_LIKE, POST_COMMENT, NEW_MESSAGE';
COMMENT ON COLUMN notification.actor_id IS 'User who triggered the notification (can be null for system notifications)';
COMMENT ON COLUMN notification.entity_type IS 'Type of related entity: POST, COMMENT, MESSAGE, RELATIONSHIP';
COMMENT ON COLUMN notification.entity_id IS 'ID of the related entity';
