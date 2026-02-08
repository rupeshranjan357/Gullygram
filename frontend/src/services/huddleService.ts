import { api } from './api';

export interface Huddle {
    id: string;
    creator: {
        userId: string;
        alias: string;
        avatarUrl?: string;
        isFriend?: boolean;
    };
    title: string;
    description?: string;
    lat: number;
    lon: number;
    locationName?: string;
    distanceKm?: number;
    startTime: string; // ISO date string
    endTime: string; // ISO date string
    status: 'OPEN' | 'FULL' | 'CANCELLED' | 'COMPLETED';
    maxParticipants: number;
    currentParticipants: number;
    genderFilter: 'EVERYONE' | 'WOMEN_ONLY' | 'MEN_ONLY';
    isJoined: boolean;
    createdAt: string;
}

export interface CreateHuddleRequest {
    title: string;
    description?: string;
    lat: number;
    lon: number;
    locationName?: string;
    startTime: string;
    endTime: string;
    maxParticipants: number;
    genderFilter: 'EVERYONE' | 'WOMEN_ONLY' | 'MEN_ONLY';
}

export const huddleService = {
    // Get nearby huddles
    getNearbyHuddles: async (lat: number, lon: number, radiusMs: number = 10): Promise<Huddle[]> => {
        const response = await api.get('/huddles', {
            params: { lat, lon, radius: radiusMs }
        });
        return response.data;
    },

    // Create a new huddle
    createHuddle: async (data: CreateHuddleRequest): Promise<Huddle> => {
        const response = await api.post('/huddles', data);
        return response.data;
    },

    // Join a huddle
    joinHuddle: async (huddleId: string): Promise<void> => {
        await api.post(`/huddles/${huddleId}/join`);
    },

    // Leave a huddle
    leaveHuddle: async (huddleId: string): Promise<void> => {
        await api.post(`/huddles/${huddleId}/leave`);
    },

    // Complete a huddle (Creator only)
    completeHuddle: async (huddleId: string): Promise<void> => {
        await api.post(`/huddles/${huddleId}/complete`);
    },

    // Get participants of a huddle
    getParticipants: async (huddleId: string): Promise<{ userId: string, alias: string, avatarUrl?: string }[]> => {
        const response = await api.get(`/huddles/${huddleId}/participants`);
        return response.data;
    }
};
