import { api } from './api';
import { Interest, UpdateInterestsRequest, ApiResponse } from '@/types';

export const interestService = {
    async getAllInterests(): Promise<Interest[]> {
        const response = await api.get<ApiResponse<Interest[]>>('/interests');
        return response.data.data;
    },

    async getMyInterests(): Promise<Interest[]> {
        const response = await api.get<ApiResponse<Interest[]>>('/me/interests');
        return response.data.data;
    },

    async updateInterests(data: UpdateInterestsRequest): Promise<Interest[]> {
        const response = await api.put<ApiResponse<Interest[]>>('/me/interests', data);
        return response.data.data;
    },
};
