import { api } from './api';

export interface NotificationActor {
    userId: string;
    alias: string;
    avatarUrl?: string;
}

export interface NotificationResponse {
    id: string;
    type: string;
    actor: NotificationActor | null;
    entityType: string;
    entityId: string;
    message: string;
    isRead: boolean;
    createdAt: string;
}

export interface NotificationsPage {
    content: NotificationResponse[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
}

const notificationService = {
    async getNotifications(page: number = 0, size: number = 20): Promise<NotificationsPage> {
        const response = await api.get(`/notifications?page=${page}&size=${size}`);
        return response.data.data;
    },

    async getUnreadCount(): Promise<number> {
        const response = await api.get('/notifications/unread-count');
        return response.data.data.count;
    },

    async markAsRead(notificationId: string): Promise<void> {
        await api.post(`/notifications/${notificationId}/read`);
    },

    async markAllAsRead(): Promise<void> {
        await api.post('/notifications/read-all');
    },
};

export default notificationService;
