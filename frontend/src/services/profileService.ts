import { api } from './api';
import {
    ProfileResponse,
    UpdateProfileRequest,
    UpdateLocationRequest,
    ApiResponse,
} from '@/types';

export const profileService = {
    async getProfile(): Promise<ProfileResponse> {
        const response = await api.get<ApiResponse<ProfileResponse>>('/me');
        return response.data.data;
    },

    async updateProfile(data: UpdateProfileRequest): Promise<ProfileResponse> {
        const response = await api.patch<ApiResponse<ProfileResponse>>('/me/profile', data);
        return response.data.data;
    },

    async updateLocation(data: UpdateLocationRequest): Promise<{ message: string }> {
        const response = await api.post<ApiResponse<void>>('/me/location', data);
        return { message: response.data.message };
    },

    async getMyPosts(page: number = 0, size: number = 20): Promise<import('./feedService').FeedPost[]> {
        const response = await api.get<ApiResponse<{
            content: import('./feedService').FeedPost[];
            page: number;
            size: number;
            totalElements: number;
            totalPages: number;
            hasNext: boolean;
            hasPrevious: boolean;
        }>>('/me/posts', {
            params: { page, size }
        });
        // Return just the content array for now (can add pagination later)
        return response.data.data.content;
    },
};
