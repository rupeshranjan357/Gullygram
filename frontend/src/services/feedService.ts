import { api } from './api';
import { ApiResponse } from '@/types';

export interface FeedPost {
    id: string;
    text: string;
    type: 'GENERAL' | 'LOCAL_NEWS' | 'MARKETING' | 'EVENT_PROMO' | 'MARKETPLACE';
    authorId: string;
    authorAlias: string;
    authorAvatarUrl?: string;
    latitude: number;
    longitude: number;
    visibilityRadiusKm: number;
    distance?: number;
    likeCount: number;
    commentCount: number;
    liked: boolean;
    interests: Array<{ id: number; name: string }>;
    createdAt: string;
    mediaUrls?: string[];
}

export interface FeedResponse {
    content: FeedPost[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
}

export interface FeedParams {
    lat: number;
    lon: number;
    radiusKm: number;
    interestBoost?: boolean;
    page?: number;
    size?: number;
}

export const feedService = {
    async getFeed(params: FeedParams): Promise<FeedResponse> {
        const response = await api.get<ApiResponse<FeedResponse>>('/feed', { params });
        return response.data.data;
    },
};
