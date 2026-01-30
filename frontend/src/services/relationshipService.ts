import { api } from './api';
import { ApiResponse } from '@/types';

// Types
export interface UserSummary {
    userId: string;
    alias: string;
    avatarUrl?: string;
    realName?: string;
    realAvatarUrl?: string;
    distanceKm?: number;
    trustLevel?: number;
    bio?: string;
}

export interface RelationshipResponse {
    id: string;
    user: UserSummary;
    status: 'REQUESTED' | 'ACCEPTED' | 'REJECTED' | 'BLOCKED';
    direction: 'SENT' | 'RECEIVED';
    message?: string;
    createdAt: string;
    updatedAt: string;
}

export interface PeopleSuggestion {
    userId: string;
    alias: string;
    avatarUrl?: string;
    sharedInterests: string[];
    distanceKm: number;
    whySuggested: string;
    trustLevel?: number;
    recentlyActive: boolean;
    score: number;
    bio?: string;
}

export interface RelationshipCounts {
    friends: number;
    pendingRequests: number;
}

// Service
export const relationshipService = {
    // Send friend request
    async sendFriendRequest(receiverId: string, message?: string): Promise<RelationshipResponse> {
        const response = await api.post<ApiResponse<RelationshipResponse>>('/relationships/request', {
            receiverId,
            message
        });
        return response.data.data;
    },

    // Accept friend request
    async acceptFriendRequest(requestId: string): Promise<RelationshipResponse> {
        const response = await api.post<ApiResponse<RelationshipResponse>>(`/relationships/${requestId}/accept`);
        return response.data.data;
    },

    // Reject friend request
    async rejectFriendRequest(requestId: string): Promise<void> {
        await api.post(`/relationships/${requestId}/reject`);
    },

    // Cancel sent friend request
    async cancelFriendRequest(requestId: string): Promise<void> {
        await api.delete(`/relationships/${requestId}`);
    },

    // Remove friend (unfriend)
    async removeFriend(friendId: string): Promise<void> {
        await api.delete(`/relationships/friend/${friendId}`);
    },

    // Get friends list
    async getFriends(): Promise<RelationshipResponse[]> {
        const response = await api.get<ApiResponse<RelationshipResponse[]>>('/relationships');
        return response.data.data;
    },

    // Get pending friend requests (received)
    async getPendingRequests(): Promise<RelationshipResponse[]> {
        const response = await api.get<ApiResponse<RelationshipResponse[]>>('/relationships/requests');
        return response.data.data;
    },

    // Get sent friend requests
    async getSentRequests(): Promise<RelationshipResponse[]> {
        const response = await api.get<ApiResponse<RelationshipResponse[]>>('/relationships/sent');
        return response.data.data;
    },

    // Get relationship counts
    async getCounts(): Promise<RelationshipCounts> {
        const response = await api.get<ApiResponse<RelationshipCounts>>('/relationships/counts');
        return response.data.data;
    },

    // Get relationship status with a user
    async getRelationshipStatus(userId: string): Promise<{ status: string }> {
        const response = await api.get<ApiResponse<{ status: string }>>(`/relationships/status/${userId}`);
        return response.data.data;
    },

    // Block user
    async blockUser(userId: string): Promise<void> {
        await api.post(`/block/${userId}`);
    },

    // Unblock user
    async unblockUser(userId: string): Promise<void> {
        await api.delete(`/block/${userId}`);
    },
};

// People suggestions service
export const peopleService = {
    // Get people suggestions
    async getSuggestions(params?: {
        lat?: number;
        lon?: number;
        radiusKm?: number;
        limit?: number;
    }): Promise<PeopleSuggestion[]> {
        const response = await api.get<ApiResponse<PeopleSuggestion[]>>('/people/suggestions', { params });
        return response.data.data;
    },

    // Get user profile
    async getUserProfile(userId: string, lat?: number, lon?: number): Promise<UserSummary> {
        const response = await api.get<ApiResponse<UserSummary>>(`/people/${userId}`, {
            params: { lat, lon }
        });
        return response.data.data;
    },
};
