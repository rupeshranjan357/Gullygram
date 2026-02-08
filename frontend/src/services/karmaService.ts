import { api } from './api';
import { KarmaTransaction, SubmitVibeCheckRequest } from '../types/karma.types';

export const karmaService = {
    getKarmaScore: async (): Promise<number> => {
        const response = await api.get<number>('/karma/score');
        return response.data;
    },

    getKarmaHistory: async (): Promise<KarmaTransaction[]> => {
        const response = await api.get<KarmaTransaction[]>('/karma/history');
        return response.data;
    },

    submitVibeCheck: async (request: SubmitVibeCheckRequest): Promise<void> => {
        await api.post('/karma/vibe-check', request);
    }
};
