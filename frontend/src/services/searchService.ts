import { api } from './api';
import { Post } from '../types/Post';
import { UserSummary } from '../types/User';

export const searchService = {
    searchUsers: async (query: string): Promise<UserSummary[]> => {
        const response = await api.get<UserSummary[]>('/search/users', {
            params: { q: query },
        });
        return response.data;
    },

    searchPosts: async (query: string, lat?: number, lon?: number, radiusKm?: number): Promise<Post[]> => {
        const response = await api.get<Post[]>('/search/posts', {
            params: { q: query, lat, lon, radiusKm },
        });
        return response.data;
    },

    searchHashtags: async (hashtag: string, lat?: number, lon?: number, radiusKm?: number): Promise<Post[]> => {
        const response = await api.get<Post[]>('/search/hashtags', {
            params: { q: hashtag, lat, lon, radiusKm },
        });
        return response.data;
    },
};
