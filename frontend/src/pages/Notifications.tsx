import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import notificationService, { NotificationResponse } from '../services/notificationService';
import '../styles/Notifications.css';

const Notifications: React.FC = () => {
    const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        loadNotifications();
    }, [page]);

    const loadNotifications = async () => {
        try {
            setLoading(true);
            const data = await notificationService.getNotifications(page, 20);
            if (page === 0) {
                setNotifications(data.content);
            } else {
                setNotifications(prev => [...prev, ...data.content]);
            }
            setHasMore(data.number < data.totalPages - 1);
        } catch (error) {
            console.error('Error loading notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleNotificationClick = async (notification: NotificationResponse) => {
        // Mark as read
        if (!notification.isRead) {
            try {
                await notificationService.markAsRead(notification.id);
                setNotifications(prev =>
                    prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n)
                );
            } catch (error) {
                console.error('Error marking as read:', error);
            }
        }

        // Navigate based on notification type
        switch (notification.type) {
            case 'POST_LIKE':
            case 'POST_COMMENT':
                if (notification.entityId) {
                    navigate(`/post/${notification.entityId}`);
                }
                break;
            case 'FRIEND_REQUEST':
            case 'FRIEND_ACCEPT':
                navigate('/people');
                break;
            case 'NEW_MESSAGE':
                if (notification.actor?.userId) {
                    // Navigate to chat with the sender
                    navigate(`/messages`);
                }
                break;
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'FRIEND_REQUEST':
            case 'FRIEND_ACCEPT':
                return '👤';
            case 'POST_LIKE':
                return '❤️';
            case 'POST_COMMENT':
                return '💬';
            case 'NEW_MESSAGE':
                return '📨';
            default:
                return '🔔';
        }
    };

    const getTimeAgo = (timestamp: string) => {
        const now = new Date();
        const time = new Date(timestamp);
        const seconds = Math.floor((now.getTime() - time.getTime()) / 1000);

        if (seconds < 60) return 'just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        if (days < 7) return `${days}d ago`;
        const weeks = Math.floor(days / 7);
        return `${weeks}w ago`;
    };

    if (loading && page === 0) {
        return (
            <div className="notifications-page">
                <div className="notifications-header">
                    <h2>Notifications</h2>
                </div>
                <div className="loading">Loading...</div>
            </div>
        );
    }

    return (
        <div className="notifications-page">
            <div className="notifications-header">
                <h2>Notifications</h2>
                {notifications.some(n => !n.isRead) && (
                    <button className="mark-all-read" onClick={handleMarkAllAsRead}>
                        Mark all as read
                    </button>
                )}
            </div>

            {notifications.length === 0 ? (
                <div className="empty-state">
                    <span className="empty-icon">🔔</span>
                    <p>No notifications yet</p>
                    <small>You'll be notified when someone likes your posts, sends a friend request, or messages you</small>
                </div>
            ) : (
                <div className="notifications-list">
                    {notifications.map(notification => (
                        <div
                            key={notification.id}
                            className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                            onClick={() => handleNotificationClick(notification)}
                        >
                            <div className="notification-icon">
                                {getNotificationIcon(notification.type)}
                            </div>
                            <div className="notification-content">
                                <p className="notification-message">{notification.message}</p>
                                <span className="notification-time">{getTimeAgo(notification.createdAt)}</span>
                            </div>
                            {!notification.isRead && <div className="unread-dot"></div>}
                        </div>
                    ))}

                    {hasMore && (
                        <button
                            className="load-more"
                            onClick={() => setPage(prev => prev + 1)}
                            disabled={loading}
                        >
                            {loading ? 'Loading...' : 'Load More'}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default Notifications;
