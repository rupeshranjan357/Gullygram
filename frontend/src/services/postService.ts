import { api } from './api';
import { ApiResponse } from '@/types';
import { FeedPost } from './feedService';

export interface CreatePostRequest {
    text: string;
    type: 'GENERAL' | 'LOCAL_NEWS' | 'MARKETING' | 'EVENT_PROMO' | 'MARKETPLACE';
    latitude: number;
    longitude: number;
    visibilityRadiusKm: number;
    interestIds?: number[];
    mediaUrls?: string[];
    friendsOnly?: boolean;
    eventDate?: string;
    eventCity?: string;
    eventLocationName?: string;
}

export interface PostDetail extends FeedPost {
    // Additional fields for detail view if needed
}

export const postService = {
    async createPost(data: CreatePostRequest): Promise<FeedPost> {
        const response = await api.post<ApiResponse<FeedPost>>('/posts', data);
        return response.data.data;
    },

    async getPost(postId: string): Promise<PostDetail> {
        const response = await api.get<ApiResponse<PostDetail>>(`/posts/${postId}`);
        return response.data.data;
    },
};
