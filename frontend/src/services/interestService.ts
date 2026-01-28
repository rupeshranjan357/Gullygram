import { api } from './api';
import { Interest, UpdateInterestsRequest } from '@/types';

export const interestService = {
    async getAllInterests(): Promise<Interest[]> {
        const response = await api.get<Interest[]>('/interests');
        return response.data;
    },

    async getMyInterests(): Promise<Interest[]> {
        const response = await api.get<Interest[]>('/me/interests');
        return response.data;
    },

    async updateInterests(data: UpdateInterestsRequest): Promise<Interest[]> {
        const response = await api.put<Interest[]>('/me/interests', data);
        return response.data;
    },
};
