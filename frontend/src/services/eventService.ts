import { api } from './api';
import { ApiResponse } from '@/types';
import { FeedPost } from './feedService';

export const eventService = {
    async getEventsByCity(city: string): Promise<FeedPost[]> {
        const response = await api.get<ApiResponse<FeedPost[]>>(`/events/city`, {
            params: { city }
        });
        return response.data.data;
    },

    async getEventsNearby(lat: number, lon: number, radius: number): Promise<FeedPost[]> {
        const response = await api.get<ApiResponse<FeedPost[]>>(`/events/nearby`, {
            params: { lat, lon, radius }
        });
        return response.data.data;
    }
};
