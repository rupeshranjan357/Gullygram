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
};
