import { api } from './api';
import {
    ProfileResponse,
    UpdateProfileRequest,
    UpdateLocationRequest,
} from '@/types';

export const profileService = {
    async getProfile(): Promise<ProfileResponse> {
        const response = await api.get<ProfileResponse>('/me');
        return response.data;
    },

    async updateProfile(data: UpdateProfileRequest): Promise<ProfileResponse> {
        const response = await api.patch<ProfileResponse>('/me/profile', data);
        return response.data;
    },

    async updateLocation(data: UpdateLocationRequest): Promise<{ message: string }> {
        const response = await api.post('/me/location', data);
        return response.data;
    },
};
