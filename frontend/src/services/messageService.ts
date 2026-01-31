import { api } from './api';
import { ApiResponse } from '@/types';

export interface ConversationResponse {
    id: string;
    otherUser: {
        userId: string;
        alias: string;
        avatarUrl?: string;
    };
    lastMessagePreview?: string;
    lastMessageAt?: string;
    unreadCount: number;
    createdAt: string;
}

export interface MessageResponse {
    id: string;
    conversationId: string;
    senderId: string;
    content: string;
    isRead: boolean;
    readAt?: string;
    createdAt: string;
    isMine: boolean;
}

export interface ConversationDetailResponse {
    id: string;
    otherUser: {
        userId: string;
        alias: string;
        avatarUrl?: string;
    };
    messages: MessageResponse[];
    totalMessages: number;
    currentPage: number;
    totalPages: number;
}

export interface SendMessageRequest {
    recipientId: string;
    content: string;
}

export const messageService = {
    // Get all conversations
    getConversations: async (): Promise<ConversationResponse[]> => {
        const response = await api.get<ApiResponse<ConversationResponse[]>>('/messages/conversations');
        return response.data.data;
    },

    // Get conversation details with messages
    getConversation: async (conversationId: string, page = 0): Promise<ConversationDetailResponse> => {
        const response = await api.get<ApiResponse<ConversationDetailResponse>>(
            `/messages/conversations/${conversationId}?page=${page}`
        );
        return response.data.data;
    },

    // Send a message
    sendMessage: async (request: SendMessageRequest): Promise<MessageResponse> => {
        const response = await api.post<ApiResponse<MessageResponse>>('/messages/send', request);
        return response.data.data;
    },

    // Mark messages as read
    markAsRead: async (conversationId: string): Promise<void> => {
        await api.post(`/messages/conversations/${conversationId}/read`);
    },

    // Delete a message
    deleteMessage: async (messageId: string): Promise<void> => {
        await api.delete(`/messages/${messageId}`);
    }
};
